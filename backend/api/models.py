from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User
from django.contrib.postgres.fields import JSONField

from .fields import WIFPrivateKeyField

from safedelete.models import SafeDeleteModel

import uuid
from hashlib import sha1
import hmac
import re
from functools import reduce

class RequirementsManager(models.Manager):
  def pending(self):
    return self.all().filter(signature=None, signature_required=True) | self.all().filter(acknowledged=False, acknowledgment_required=True)

class TransactionManager(models.Manager):
  def pending(self):
    return self.filter(id__in=Requirement.objects.pending().values("transaction_id"))

  def nonpending(self):
    return self.exclude(id__in=Requirement.objects.pending().values("transaction_id"))

  def owned_by(self, *args):
    return reduce(
      lambda acc, x: x if acc is None else acc & x,
      [self.all().filter(buyer__id = id) | self.all().filter(seller__id = id) for id in args]
    )

class BaseModel(SafeDeleteModel):
  created_at = models.DateTimeField(default=timezone.now)

  def __str__(self):
    return "<" + type(self).__name__ + " id: " + str(self.id) + ", created_at: " + str(self.created_at) + ">"

  class Meta:
    abstract = True

class Token(BaseModel):
  def make_key():
    return hmac.new(uuid.uuid4().bytes, digestmod=sha1).hexdigest()

  user = models.ForeignKey(User, on_delete=models.CASCADE)
  key = models.CharField(max_length=128, default=make_key, db_index=True)

  @classmethod
  def read_token(cls, request):
    if 'HTTP_AUTHORIZATION' in request.META:
      auth_header = request.META['HTTP_AUTHORIZATION']
      vals_iter = iter(re.split(re.compile(r'\s+', re.U), auth_header, 1))
      if next(vals_iter, None) == "Token": # ensure we're using token auth
        try:
          token = next(vals_iter, None)
          if token is not None:
            return cls.objects.get(key=token)
        except cls.DoesNotExist:
          pass
    return None

class Wallet(BaseModel):
  user = models.ForeignKey(User, on_delete=models.CASCADE)
  private_key = WIFPrivateKeyField() # TODO: figure out user

  @property
  def address(self):
    return self.private_key.address

class Transaction(BaseModel):
  buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="api_trans_buyer")
  seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name="api_trans_seller")
  buyer_wallet = models.ForeignKey(Wallet, on_delete=models.SET_NULL, null=True, related_name="api_trans_buyer_wallet")
  seller_wallet = models.ForeignKey(Wallet, on_delete=models.SET_NULL, null=True, related_name="api_trans_seller_wallet")
  amount = models.DecimalField(max_digits=11, decimal_places=2)
  success = models.BooleanField(default=False)

  objects = TransactionManager()

  @property
  def is_completed(self):
    if not self.buyer_wallet or not self.seller_wallet:
      return False

    rqs = Requirement.objects.filter(transaction__id=self.id)
    for req in rqs:
      if not req.is_fulfilled:
        return False
    return True

class Requirement(BaseModel):
  user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='api_req_user')
  text = models.TextField(blank=True, null=True)
  transaction = models.ForeignKey(Transaction, on_delete=models.CASCADE, related_name='api_req_transaction')
  signature = models.TextField(blank=True, null=True)
  signature_required = models.BooleanField(default=False)
  acknowledged = models.BooleanField(default=False)
  acknowledgment_required = models.BooleanField(default=False)

  objects = RequirementsManager()

  @property
  def is_fulfilled(self):
    print(self)
    ack = self.acknowledged    or not self.acknowledgment_required
    sig = bool(self.signature) or not self.signature_required
    return ack and sig


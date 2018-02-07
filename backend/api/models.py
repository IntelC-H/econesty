from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User
from django.contrib.postgres.fields import JSONField

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

class PaymentData(BaseModel):
  BITCOIN='btc'
  CASH='csh'
  CREDIT_CARD='cdt'
  DEBIT_CARD='dbt'
  GENERIC='gnc'
  KINDS = [BITCOIN, CASH, CREDIT_CARD, DEBIT_CARD, GENERIC]
  kind = models.CharField(
    max_length=3,
    choices=(
      (BITCOIN, 'Bitcoin'),
      (CASH, 'Cash'),
      (CREDIT_CARD, 'Credit Card'),
      (DEBIT_CARD, 'Debit Card'),
      (GENERIC, 'Other')
    ),
    default=GENERIC
  )
  data = models.TextField()
  encrypted = models.BooleanField() # using a key stored exclusively in the user's mind
  user = models.ForeignKey(User, on_delete=models.CASCADE)

class Transaction(BaseModel):
  buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="api_trans_buyer")
  buyer_payment_data = models.ForeignKey(PaymentData, on_delete=models.SET_NULL, null=True, related_name="api_trans_buyer_pd")
  seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name="api_trans_seller")
  seller_payment_data = models.ForeignKey(PaymentData, on_delete=models.SET_NULL, null=True, related_name="api_trans_seller_pd")
  offer = models.DecimalField(max_digits=11, decimal_places=2)
  offer_currency = models.CharField(max_length=3, default="USD")

  objects = TransactionManager()
  
  @property
  def is_completed(self):
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

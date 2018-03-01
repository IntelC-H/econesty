from django.conf import settings
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

class BaseModel(SafeDeleteModel):
  created_at = models.DateTimeField(default=timezone.now)

  def __str__(self):
    return "<" + type(self).__name__ + " id: " + str(self.id) + ", created_at: " + str(self.created_at) + ">"

  class Meta:
    abstract = True

WHITESPACE_REGEX = re.compile(r'\s+', re.U)
def read_token(string):
  try:
    kind, token = re.split(WHITESPACE_REGEX, string, 1)
    if kind == "Token":
      return token
  except:
    pass
  return None

class Token(BaseModel):
  def make_key():
    return hmac.new(uuid.uuid4().bytes, digestmod=sha1).hexdigest()

  user = models.ForeignKey(User, on_delete=models.CASCADE)
  key = models.CharField(max_length=128, default=make_key, db_index=True)

  @classmethod
  def read_token(cls, request):
    token = None
    if 'HTTP_AUTHORIZATION' in request.META:
      token = read_token(request.META['HTTP_AUTHORIZATION'])
    elif settings.DEBUG and "Authorization" in request.COOKIES:
      token = read_token(request.COOKIES["Authorization"])

    try:
      if token is not None:
        return cls.objects.get(key=token)
    except cls.DoesNotExist:
      pass
    return None

class Wallet(BaseModel):
  user = models.ForeignKey(User, on_delete=models.CASCADE)
  private_key = WIFPrivateKeyField()

  @property
  def address(self):
    return self.private_key.address

  @property
  def balance(self):
    return self.private_key.get_balance('btc')

class Transaction(BaseModel):
  sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name="api_trans_sender")
  recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name="api_trans_recipient")
  sender_wallet = models.ForeignKey(Wallet, on_delete=models.SET_NULL, null=True, related_name="api_trans_sender_wallet")
  recipient_wallet = models.ForeignKey(Wallet, on_delete=models.SET_NULL, null=True, related_name="api_trans_recipient_wallet")
  amount = models.DecimalField(max_digits=11, decimal_places=8)
  success = models.BooleanField(default=False) # Whether or not the transaction
                                               # succeeded - i.e. payment went
                                               # through.
  error = models.TextField(null=True)

  @property
  def completed(self):
    if not self.sender_wallet or not self.recipient_wallet:
      return False
    return Requirement.fulfilled_queryset().filter(transaction__id=self.id).exists()

  def finalize(self):
    amount = float(self.amount)
    try: 
      self.sender_wallet.private_key.get_unspents()
      self.sender_wallet.private_key.send([
        (self.recipient_wallet.private_key.address, amount, 'btc')
      ])
      # An error will be raised here if there's a problem, and success will
      # never set to True
      self.success = True
    except Exception as e:
      self.error = str(e)
    self.save()

class Requirement(BaseModel):
  user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='api_req_user')
  text = models.TextField(blank=True, null=True)
  transaction = models.ForeignKey(Transaction, on_delete=models.CASCADE, related_name='api_req_transaction')
  signature = models.TextField(blank=True, null=True) # just a string for now
  acknowledged = models.BooleanField(default=False)
  rejected = models.BooleanField(default=False)

  @property
  def fulfilled(self):
    return self.acknowledged and bool(self.signature) and not self.rejected

  @classmethod
  def fulfilled_queryset(cls):
    return cls.objects.filter(signature__isnull=False, acknowledged=True, rejected=False)

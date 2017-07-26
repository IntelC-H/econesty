from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User
from . import fields

class PaymentData(models.Model):
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
  created_at = models.DateTimeField(default=timezone.now)

class Transaction(models.Model):
  buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="api_trans_buyer")
  buyer_payment_data = models.ForeignKey(PaymentData, on_delete=models.SET_NULL, null=True, related_name="api_trans_buyer_pd")
  seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name="api_trans_seller")
  seller_payment_data = models.ForeignKey(PaymentData, on_delete=models.SET_NULL, null=True, related_name="api_trans_seller_pd")
  offer = models.DecimalField(max_digits=11, decimal_places=2)
  offer_currency = models.CharField(max_length=3, default="USD")
  created_at = models.DateTimeField(default=timezone.now)

class Signature(models.Model):
  user = models.ForeignKey(User, on_delete=models.CASCADE)
  points = fields.PointsField()
  created_at = models.DateTimeField(default=timezone.now)

  def signature_list(self):
    return list(map(lambda x: list(map(int, x.split(','))), self.signature.split('|')))

class Requirement(models.Model):
  user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='api_req_user')
  text = models.TextField(blank=True, null=True)
  transaction = models.ForeignKey(Transaction, on_delete=models.CASCADE, related_name='api_req_transaction')
  signature = models.ForeignKey(Signature, on_delete=models.SET_NULL, blank=True, null=True, related_name='api_req_sig')
  signature_required = models.BooleanField(default=False)
  acknowledged = models.BooleanField(default=False)
  acknowledgment_required = models.BooleanField(default=False)

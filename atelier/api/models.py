from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User

class PaymentData(models.Model):
  BITCOIN='btc'
  CASH='csh'
  CREDIT_CARD='cdt'
  DEBIT_CARD='dbt'
  GENERIC='gnc'
  kind = models.CharField(
    max_length=3,
    choices=(
      (BITCOIN, 'Bitcoin'),
      (CREDIT_CARD, 'Credit Card'),
      (DEBIT_CARD, 'Debit Card'),
      (GENERIC, 'Other')
    ),
    default=GENERIC
  )
  data = models.TextField()
  encrypted = models.BooleanField()
  user = models.ForeignKey(User, on_delete=models.CASCADE)
  # data can be encrypted with a key that is stored exclusively in the user's mind.

class Transaction(models.Model):
  buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="api_trans_buyer")
  buyer_payment_data = models.ForeignKey(PaymentData, on_delete=models.SET_NULL, null=True, related_name="api_trans_buyer_pd")
  seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name="api_trans_seller")
  seller_payment_data = models.ForeignKey(PaymentData, on_delete=models.SET_NULL, null=True, related_name="api_trans_seller_pd")
  required_witnesses = models.IntegerField(default=0)
  offer = models.DecimalField(max_digits=11, decimal_places=2)
  offer_currency = models.CharField(max_length=3)
  date_proposed = models.DateTimeField(default=timezone.now)
  date_finalized = models.DateTimeField(null=True)

  # TODO: other information about what the transaction was for?

  def is_finalized(self):
    return self.date_finalized != None

class CounterSignature(models.Model):
  user = models.ForeignKey(User, on_delete=models.CASCADE)
  transaction = models.ForeignKey(Transaction, on_delete=models.CASCADE)
  signature = models.TextField() # stored as x,y|x,y|x,y

  def signature_list(self):
    return list(map(lambda x: list(map(int, x.split(','))), self.signature.split('|')))


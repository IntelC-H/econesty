from . import models
import django.contrib.auth.models as amodels
from rest_framework import serializers

class UserSerializer(serializers.ModelSerializer):
  class Meta:
    model = amodels.User
    fields = ("id", "username", "first_name", "last_name", "email")

class PaymentDataSerializer(serializers.ModelSerializer):
  user = UserSerializer(many=False, read_only=True)
  class Meta:
    model = models.PaymentData
    fields = '__all__'

class TransactionSerializer(serializers.ModelSerializer):
  buyer = UserSerializer(many=False, read_only=True)
  buyer_payment_data = PaymentDataSerializer(many=False, read_only=True)
  seller = UserSerializer(many=False, read_only=True)
  seller_payment_data = PaymentDataSerializer(many=False, read_only=True)
  class Meta:
    model = models.Transaction
    fields = '__all__'

class CounterSignatureSerializer(serializers.ModelSerializer):
  user = UserSerializer(many=False, read_only=True)
  transaction = TransactionSerializer(many=False, read_only=True)
  class Meta:
    model = models.CounterSignature
    fields = '__all__'


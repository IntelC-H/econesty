from . import models
import django.contrib.auth.models as amodels
from rest_framework import serializers

class UserSerializer(serializers.ModelSerializer):
  class Meta:
    model = amodels.User
    fields = ("id", "password", "username", "first_name", "last_name", "email")

class PaymentDataSerializer(serializers.ModelSerializer):
  class Meta:
    model = models.PaymentData
    fields = '__all__'
    depth = 1

class CounterSignatureSerializer(serializers.ModelSerializer):
  class Meta:
    model = models.CounterSignature
    fields = '__all__'
    depth = 1

class TransactionSerializer(serializers.ModelSerializer):
  class Meta:
    model = models.Transaction
    fields = '__all__'
    depth = 1
 

from . import models
import django.contrib.auth.models as amodels
from rest_framework import serializers

class UserSerializer(serializers.ModelSerializer):
  class Meta:
    model = amodels.User
    fields = ("id", "username", "first_name", "last_name", "email", "password", "date_joined")
    extra_kwargs = {
      'password': {'write_only': True},
      'id': {'read_only': True},
      'date_joined': {'read_only': True},
    } 

  def create(self, data):
    passwd = data.pop("password", None)
    u = amodels.User(**data)
    u.set_password(passwd)
    u.save()
    return u

  def update(self, instance, data):
    instance.username = data.get("username", instance.username)
    instance.first_name = data.get("first_name", instance.first_name)
    instance.last_name = data.get("last_name", instance.last_name)
    instance.email = data.get("email", instance.email)
    passwd = data.get("password", None)
    if passwd is not None:
      instance.set_password(passwd)
    instance.save()
    return instance

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


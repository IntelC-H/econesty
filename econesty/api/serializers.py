from . import models
import django.contrib.auth.models as amodels
from rest_framework import serializers

def writing_field(model_clazz, source):
  """
  Define a field for writing to a nested property
  """
  return serializers.PrimaryKeyRelatedField(queryset=model_clazz.objects.all(), source=source, write_only=True)

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
  user_id = writing_field(amodels.User, "user")
  class Meta:
    model = models.PaymentData
    fields = '__all__'
    extra_kwargs = {
      'id': {'read_only': True},
    }

class TransactionSerializer(serializers.ModelSerializer):
  buyer = UserSerializer(read_only=True)
  buyer_id = writing_field(amodels.User, "buyer")
  buyer_payment_data = PaymentDataSerializer(read_only=True)
  buyer_payment_data_id = writing_field(models.PaymentData, "buyer_payment_data")
  seller = UserSerializer(read_only=True)
  seller_id = writing_field(amodels.User, "seller")
  seller_payment_data = PaymentDataSerializer(read_only=True)
  seller_payment_data_id = writing_field(models.PaymentData, "seller_payment_data")
  class Meta:
    model = models.Transaction
    fields = '__all__'
    extra_kwargs = {
      'id': {'read_only': True},
    }

class CounterSignatureSerializer(serializers.ModelSerializer):
  user = UserSerializer(many=False, read_only=True)
  user_id = writing_field(amodels.User, "user")
  transaction = TransactionSerializer(many=False, read_only=True)
  transaction_id = writing_field(models.Transaction, "transaction")
  class Meta:
    model = models.CounterSignature
    fields = '__all__'
    extra_kwargs = {
      'id': {'read_only': True},
    }

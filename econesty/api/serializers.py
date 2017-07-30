from . import models
import django.contrib.auth.models as amodels
from django.contrib.auth.hashers import check_password
from rest_framework import serializers
from django.http import Http404
from django.core.exceptions import PermissionDenied

# TODO: all the user_fields from views.py have to be taken into account here.

def writing_field(model_clazz, source):
  """
  Define a field for assigning to a foreign key.
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
    u = amodels.User(**data)
    u.set_password(data["password"])
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

class SignatureSerializer(serializers.ModelSerializer):
  user = UserSerializer(many=False, read_only=True)
  user_id = writing_field(amodels.User, "user")
  class Meta:
    model = models.Signature
    fields = '__all__'
    extra_kwargs = {
      'id': {'read_only': True},
    }

class RequirementSerializer(serializers.ModelSerializer):
  user = UserSerializer(many=False, read_only=True)
  user_id = writing_field(amodels.User, "user")
  transaction = TransactionSerializer(many=False, read_only=True)
  transaction_id = writing_field(models.Transaction, "transaction")
  signature = SignatureSerializer(many=False, read_only=True)
  signature_id = writing_field(models.Signature, "signature")
  pass
  class Meta:
    model = models.Requirement
    fields = '__all__'
    extra_kwargs = {
      'id': {'read_only': True}
    }

class TokenSerializer(serializers.ModelSerializer):
  username = serializers.CharField(write_only=True)
  password = serializers.CharField(write_only=True)
  user = UserSerializer(many=False, read_only=True)
  key = serializers.CharField(read_only=True)

  def create(self, data):
    username = data.pop("username", None)
    password = data.pop("password", None)
    try:
      u = amodels.User.objects.get()
    except amodels.User.DoesNotExist:
      raise Http404('not found')

    if not check_password(password, u.password):
      raise PermissionDenied('invalid password')

    try:
      t = models.Token.objects.get(user__id=u.id)
    except models.Token.DoesNotExist:
      t = models.Token(user=u)
      t.save()
    return t

  class Meta:
    model = models.Token
    fields = '__all__'
    extra_kwargs = {
      'id': {'read_only': True},
      'created_at': {'read_only': True}
    }

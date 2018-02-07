import hashlib

from . import models
import django.contrib.auth.models as amodels
from django.contrib.auth.hashers import check_password
from rest_framework import serializers
from django.http import Http404
from django.core.exceptions import PermissionDenied

# TODO: all the user_fields from views.py have to be taken into account here.

class BaseSerializer(serializers.ModelSerializer):
  def to_representation(self, obj):
    ret = super().to_representation(obj)
    if "deleted" in ret:
      del ret["deleted"]
    return ret

def writing_field(model_clazz, source, **kwargs):
  """
  Define a field for assigning to a foreign key.
  """
  kwargs['label'] = source.title()
  kwargs['write_only'] = True
  kwargs['source'] = source
  kwargs['queryset'] = model_clazz.objects.all()
  return serializers.PrimaryKeyRelatedField(**kwargs)

class UserSerializer(BaseSerializer):
  avatar_url = serializers.SerializerMethodField()
  is_me = serializers.SerializerMethodField()
  class Meta:
    model = amodels.User
    fields = ("id", "username", "first_name", "last_name", "email", "password", "date_joined", "avatar_url", "is_me")
    extra_kwargs = {
      'avatar_url': { 'read_only': True },
      'is_me': { 'read_only': True },
      'password': {'write_only': True, 'style': {'input_type': 'password'} },
      'id': {'read_only': True},
      'date_joined': {'read_only': True},
    }

  def get_avatar_url(self, obj):
    md5Email = hashlib.md5(obj.email.encode("utf8")).hexdigest()
    return "https://www.gravatar.com/avatar/" + md5Email

  def get_is_me(self, obj):
    if 'request' in self.context:
      return self.context['request'].user.id is obj.id
    return False

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

class PaymentDataSerializer(BaseSerializer):
  user = UserSerializer(many=False, read_only=True)
  user_id = writing_field(amodels.User, "user")
  class Meta:
    model = models.PaymentData
    fields = '__all__'
    extra_kwargs = {
      'id': {'read_only': True},
      'created_at': {'read_only': True}
    }

class TransactionSerializer(BaseSerializer):
  buyer = UserSerializer(read_only=True)
  buyer_id = writing_field(amodels.User, "buyer")
  buyer_payment_data = PaymentDataSerializer(read_only=True)
  buyer_payment_data_id = writing_field(models.PaymentData, "buyer_payment_data")
  seller = UserSerializer(read_only=True)
  seller_id = writing_field(amodels.User, "seller")
  seller_payment_data = PaymentDataSerializer(read_only=True)
  seller_payment_data_id = writing_field(models.PaymentData, "seller_payment_data")
  completed = serializers.BooleanField(read_only=True)

  class Meta:
    model = models.Transaction
    fields = '__all__'
    extra_kwargs = {
      'id': {'read_only': True},
      'created_at': {'read_only': True}
    }

class RequirementSerializer(BaseSerializer):
  user = UserSerializer(many=False, read_only=True)
  user_id = writing_field(amodels.User, "user")
  transaction = TransactionSerializer(many=False, read_only=True)
  transaction_id = writing_field(models.Transaction, "transaction")

  class Meta:
    model = models.Requirement
    fields = '__all__'
    extra_kwargs = {
      'id': {'read_only': True},
      'created_at': {'read_only': True}
    }

class TokenSerializer(BaseSerializer):
  username = serializers.CharField(write_only=True)
  password = serializers.CharField(write_only=True, style={'input_type': 'password'})
  user = UserSerializer(many=False, read_only=True)
  key = serializers.CharField(read_only=True)

  def create(self, data):
    username = data.get("username", None)
    password = data.get("password", None)
    try:
      u = amodels.User.objects.get(username=username)
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

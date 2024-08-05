import hashlib

from .fields import WIFPrivateKeySerializerField, BitcoinBalanceField

from . import models
import django.contrib.auth.models as amodels
from django.contrib.auth.hashers import check_password
from rest_framework import serializers
from django.http import Http404
from django.core.exceptions import PermissionDenied

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
    password = data.pop("password")
    u = amodels.User(**data)
    u.set_password(password)
    u.save()
    return u

  def update(self, instance, data):
    instance.username = data.get("username", instance.username)
    instance.first_name = data.get("first_name", instance.first_name)
    instance.last_name = data.get("last_name", instance.last_name)
    instance.email = data.get("email", instance.email)
    if "password" in data:
      instance.set_password(data["password"])
    instance.save()
    return instance

class WalletSerializer(BaseSerializer):
  user = UserSerializer(many=False, read_only=True)
  user_id = writing_field(amodels.User, "user")
  private_key = WIFPrivateKeySerializerField(user_field="user")
  address = serializers.ReadOnlyField()
  is_testnet = serializers.ReadOnlyField()
  class Meta:
    model = models.Wallet
    fields = '__all__'
    extra_kwargs = {
      'id': {'read_only': True},
      'created_at': {'read_only': True}
    }

class WalletDetailSerializer(WalletSerializer):
  balance = BitcoinBalanceField(user_field="user")

class TransactionSerializer(BaseSerializer):
  sender = UserSerializer(read_only=True)
  sender_id = writing_field(amodels.User, "sender")
  sender_wallet = WalletSerializer(read_only=True)
  sender_wallet_id = writing_field(models.Wallet, "sender_wallet", required=False, allow_null=True)
  recipient = UserSerializer(read_only=True)
  recipient_id = writing_field(amodels.User, "recipient")
  recipient_wallet = WalletSerializer(read_only=True)
  recipient_wallet_id = writing_field(models.Wallet, "recipient_wallet", required=False, allow_null=True)
  completed = serializers.ReadOnlyField()
  rejected = serializers.ReadOnlyField()

  class Meta:
    model = models.Transaction
    fields = '__all__'
    extra_kwargs = {
      'id': {'read_only': True},
      'created_at': {'read_only': True},
      'success': {'read_only': True}
    }

class RequirementSerializer(BaseSerializer):
  user = UserSerializer(many=False, read_only=True)
  user_id = writing_field(amodels.User, "user")
  transaction = TransactionSerializer(many=False, read_only=True)
  transaction_id = writing_field(models.Transaction, "transaction", required=False)
  fulfilled = serializers.ReadOnlyField()

  class Meta:
    model = models.Requirement
    fields = '__all__'
    extra_kwargs = {
      'id': {'read_only': True},
      'created_at': {'read_only': True}
    }

class TransactionSerializerWithRequirements(TransactionSerializer):
  requirements = RequirementSerializer(required=False, many=True)

  def create(self, validated_data):
    reqs_data = validated_data.pop('requirements', [])
    trans = super().create(validated_data)
    for req_data in reqs_data:
      req_data["transaction_id"] = trans.id
      models.Requirement.objects.create(**req_data)
    return trans

  def update(self, instance, validated_data):
    reqs_data = validated_data.pop('requirements', [])
    trans = super().update(instance, validated_data)
    for req_data in reqs_data:
      req_data["transaction_id"] = trans.id
      models.Requirement.objects.create(**req_data)
    return trans

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

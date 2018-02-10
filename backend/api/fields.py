from django.db import models
from rest_framework import serializers
from rest_framework.fields import get_attribute

from bit import PrivateKeyTestnet, PrivateKey, wif_to_key

class WIFPrivateKeyField(models.TextField):
  description = "A BitCoin private key (stored in WIF format)"

  def from_db_value(self, value, expression, connection, context):
    if value is None:
      return value
    return wif_to_key(value)

  def to_python(self, value):
    if isinstance(value, PrivateKeyTestnet) or isinstance(value, PrivateKey):
      return value
    
    if value is None:
      return value
    
    return wif_to_key(value)

  def get_prep_value(self, value):
    return value.to_wif()

class WIFPrivateKeySerializer(serializers.Field):
  def __init__(self, user_field = None, **kwargs):
    self.user_field = user_field
    super(WIFPrivateKeySerializer, self).__init__(**kwargs)

  def should_redact(self, instance, context = None):
    if self.user_field and self.parent:
      request = (context or self.context).get("request")
      if request and hasattr(request, "user"):
        user = get_attribute(instance, self.user_field.split("."))
        return not request.user.id is user.id
      return True
    else:
      return False

  def get_attribute(self, instance):
    return instance # keep whole model instance around

  def to_representation(self, instance):
    if self.should_redact(instance):
      return None

    value = get_attribute(instance, self.source_attrs)
    return value.to_wif()

  def to_internal_value(self, data):
    if data is None:
      return data
    try:
      return wif_to_key(data)
    except (ValueError):
      self.fail('invalid', data=data)


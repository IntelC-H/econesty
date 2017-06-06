from . import models
from . import serializers
from django.contrib.auth.models import User

from rest_framework import status
from rest_framework import viewsets
from rest_framework.decorators import detail_route, list_route
from rest_framework.response import Response
from rest_framework import permissions
from rest_framework import mixins

class UserPermission(permissions.BasePermission):
  def has_object_permission(self, request, view, obj):
    if request.method == "POST": # allow unauthenticated clients to create users
      return True
    return request.user == obj

class CRUDModelViewset(mixins.CreateModelMixin,
                       mixins.RetrieveModelMixin,
                       mixins.UpdateModelMixin,
                       mixins.DestroyModelMixin,
                       viewsets.GenericViewSet):
  pass

class UserViewSet(CRUDModelViewset):
#  permission_classes = (UserPermission,)
  queryset = User.objects.all()
  serializer_class = serializers.UserSerializer

class PaymentDataViewSet(viewsets.ModelViewSet):
  queryset = models.PaymentData.objects.all()   
  serializer_class = serializers.PaymentDataSerializer

class CounterSignatureViewSet(viewsets.ModelViewSet):
  queryset = models.CounterSignature.objects.all()
  serializer_class = serializers.CounterSignatureSerializer

class TransactionViewSet(viewsets.ModelViewSet):
  queryset = models.Transaction.objects.all()
  serializer_class = serializers.TransactionSerializer


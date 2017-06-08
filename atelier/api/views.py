from . import models
from . import serializers
from django.contrib.auth.models import User

from rest_framework import viewsets
from rest_framework import permissions
from rest_framework.decorators import list_route, detail_route
from rest_framework.response import Response

class IsOwned(permissions.BasePermission):
  def has_object_permission(self, request, view, obj):
    if request.auth is None:
      return False
    u = request.auth.user
    user_attr = getattr(obj, "user", None)
    buyer_attr = getattr(obj, "buyer", None)
    seller_attr = getattr(obj, "seller", None)
    return (u == user_attr) | (u == buyer_attr) | (u == seller_attr)

class IsOwnedOrCreating(IsOwned):
  def has_object_permission(self, request, view, obj):
    if request.method == "POST":
      return True
    else:
      return super().has_object_permission(request, view, obj)

# Add methods like this:
# /user/current **DETAIL**
# /user/search **LIST**
class UserViewSet(viewsets.ModelViewSet):
  permission_classes = (IsOwnedOrCreating,)
  queryset = User.objects.all()
  serializer_class = serializers.UserSerializer

  # requires authentication
  # override to get the current user
  def list(self, request, *args, **kwargs):
    ser = self.get_serializer(request.auth.user, many=False)
    return Response(ser.data)

class PaymentDataViewSet(viewsets.ModelViewSet):
  permission_classes = (permissions.IsAuthenticated, IsOwned)
  serializer_class = serializers.PaymentDataSerializer

  def get_queryset(self):
    qs = models.PaymentData.objects.all()
    if self.request.user is not None:
      qs = qs.filter(user=self.request.user)
    return qs

class CounterSignatureViewSet(viewsets.ModelViewSet):
  permission_classes = (permissions.IsAuthenticated, IsOwned)
  serializer_class = serializers.CounterSignatureSerializer

  def get_queryset(self):
    return models.CounterSignature.objects.filter(user=self.request.user)
  
class TransactionViewSet(viewsets.ModelViewSet):
  permission_classes = (permissions.IsAuthenticated, IsOwned)
  serializer_class = serializers.TransactionSerializer

  def get_queryset(self):
    u = self.request.user
    qs = models.Transaction.objects.all()
    if u is not None:
      qs = qs.filter(buyer=u) | qs.filter(seller=u)
    return qs.order_by("-date_proposed")

  @detail_route()
  def countersignatures(self, request, pk=None):
    q = models.CounterSignatures.objects.filter(transaction=pk)
    page = self.paginate_queryset(q)
    if page is not None:
      ser = self.get_serializer(page, many=True)
      return self.get_paginated_response(ser.data)
    else:
      ser = self.get_serializer(q, many=True)
      return Response(ser.data)

  # TODO: order these too
  @list_route()
  def coutersigned(self, request):
    q = models.CounterSignature.objects.filter(user=request.auth.user)
    page = self.paginate_queryset(q)
    if page is not None:
      serializer = self.get_serializer([cs.transaction for cs in page], many=True)
      return self.get_paginated_response(serializer.data)
    else:
      serializer = self.get_serializer([sig.transaction for sig in q], many=True)
      return Response(serializer.data)
 

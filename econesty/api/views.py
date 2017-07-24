from . import models
from . import serializers
from django.contrib.auth.models import User
from django.db.models.aggregates import Count
from django.shortcuts import redirect

from rest_framework import viewsets
from rest_framework import permissions
from rest_framework import filters
from django.utils.decorators import classonlymethod
from rest_framework.decorators import list_route, detail_route
from rest_framework.response import Response
from rest_framework.exceptions import NotFound

# Permissions

class Sensitive(permissions.BasePermission):
  def has_permission(self, request, view):
    return request.auth is not None;

  def has_object_permission(self, request, view, obj):
    if obj is None:
      return False

    u = request.auth.user
    if u == obj or getattr(obj, "user", getattr(obj, "buyer", getattr(obj, "seller", None))) == u: # does the authenticated user own the object?
      return True
    elif type(obj) is models.CounterSignature:
      transaction = getattr(obj, "transaction", None)
      if transaction is not None: # does the countersignature have a transaction associated with it?
        return self.has_object_permission(request, view, transaction) # if so, test if the transaction is owned by the authenticated user.
    elif type(obj) is models.PaymentData:
      #
      # TODO: test this
      # 1. Authenticate with user id other than 2
      # 2. create a payment data (let's call it pd)
      # 3. create a transaction using the payment data with user 2
      # 4. check if user id 2 can access pd
      #

      transactions = (
        models.Transaction.objects.filter(buyer_payment_data__id=obj.id)
        | models.Transaction.objects.filter(seller_payment_data__id=obj.id)
      ).select_related("buyer", "seller")
  
      for t in transactions: # for each transaction associated with the PaymentData obj
        if self.has_object_permission(request, view, t): # Determine if the authenticated user owns it
          return True

    return False

class ReadableSensitive(Sensitive):
  def has_object_permission(self, request, view, obj):
    return request.method == "GET" or super().has_object_permission(request, view, obj)

class ReadableCreatableSensitive(ReadableSensitive):
  def has_object_permission(self, request, view, obj):
    return request.method == "POST" or super().has_object_permission(request, view, obj)

# Mixins

# list_route without implicit added meaning.
# THIS IS AN OVERSIGHT IN DRF
collection_route = list_route

class PaginatedViewSetMixin(object):
  def paginated_response(self, queryset, serializer, transform = None):
    page = self.paginate_queryset(queryset)
    ser = serializer((transform or (lambda x: x))(page or queryset), many=True)
    if page is not None:
      return self.get_paginated_response(ser.data)
    else:
      return Response(ser.data)

class QuerySetGetterMixin(object):
  @classonlymethod
  def obtain_queryset(cls, request):
    vs = cls()
    vs.request = request
    return vs.get_queryset()

#
# Actual API viewsets
#

class UserViewSet(viewsets.ModelViewSet, PaginatedViewSetMixin):
  permission_classes = (ReadableCreatableSensitive,)
  queryset = User.objects.all().order_by("-username")
  serializer_class = serializers.UserSerializer
  filter_backends = (filters.SearchFilter,)
  search_fields = ('username', 'email', 'first_name')

  @collection_route(methods=["GET"], permission_classes=[permissions.IsAuthenticated])
  def me(self, request):
    ser = self.get_serializer(request.auth.user, many=False)
    return Response(ser.data)

  @detail_route(methods=["GET"], permission_classes=[permissions.IsAuthenticated])
  def payment(self, request, pk = None):
    pk = int(request.auth.user.id if pk == "me" else pk)
    common = self.find_common_payment(request.auth.user.id, pk);
    if common is None:
      raise NotFound(detail="No common payment data.", code=404)
    return Response(common)

  @detail_route(methods=["GET"], permission_classes=[Sensitive])
  def transactions(self, request, pk = None):
    uid = request.auth.user.id
    pk = uid if pk == "me" else int(pk) # the primary key of the user to load transactions for
    qs = models.Transaction.objects.all();
    qs = qs.filter(buyer__id=pk) | qs.filter(seller__id=pk) # Ensure only user #{pk}'s transactions are fetched
    qs = qs & (qs.filter(buyer__id=uid) | qs.filter(seller__id=uid)) # Ensure only transactions the authenticated user can see are fetched.
    qs = qs.order_by("-created_at") # Order newest to lodest
    return self.paginated_response(qs, serializers.TransactionSerializer)

  def find_common_payment(self, me_id, them_id):
    def makeKindHash(acc, x):
      hsh = acc or {}
      hsh[x.kind] = x
      return hsh

    me = reduce(makeKindHash, models.PaymentData.objects.filter(user__id=me_id).all())
    them = reduce(makeKindHash, models.PaymentData.objects.filter(user__id=them_id).all())

    for k in models.PaymentData.KINDS:
      m = me.get(k, None)
      t = them.get(k, None)
      if m is not None and t is not None:
        return {
          'me': serializers.PaymentDataSerializer(m).data,
          'them': serializers.PaymentDataSerializer(t).data
        }

    return None

class PaymentDataViewSet(viewsets.ModelViewSet, QuerySetGetterMixin):
  permission_classes = (Sensitive,)
  serializer_class = serializers.PaymentDataSerializer

  def get_queryset(self):
    return models.PaymentData.objects.all().filter(user=self.request.auth.user).order_by("-created_at").select_related("user")

class CounterSignatureViewSet(viewsets.ModelViewSet, QuerySetGetterMixin):
  permission_classes = (Sensitive,)
  serializer_class = serializers.CounterSignatureSerializer

  def get_queryset(self):
    return models.CounterSignature.objects.filter(user__id=self.request.auth.user.id).select_related("transaction").select_related("user")
  
class TransactionViewSet(viewsets.ModelViewSet, PaginatedViewSetMixin):
  permission_classes = (Sensitive,)
  serializer_class = serializers.TransactionSerializer

  def get_queryset(self):
    u = self.request.auth.user
    buyer = models.Transaction.objects.all().filter(buyer__id=u.id)
    seller = models.Transaction.objects.all().filter(seller__id=u.id)
    return (buyer | seller).order_by("-created_at").select_related("buyer", "seller")

  @detail_route(methods=["GET"])
  def countersignatures(self, request, pk=None):
    q = models.CounterSignature.objects.filter(transaction__id=int(pk)).select_related("transaction").select_related("user")
    return self.paginated_response(q, serializers.CounterSignatureSerializer)

  @list_route(methods=["GET"])
  def coutersigned(self, request):
    q = models.CounterSignature.objects.filter(user=request.auth.user).order_by("-created_at")
    return self.paginated_response(q, serializers.TransactionSerializer, lambda cs: [c.transaction for c in cs])

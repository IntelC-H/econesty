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

# TRANSACTIONS MAY EXPOSE PAYMENT DATA!!!!!!!!!!!!

# Permissions

# TODO: move to permissions.py
class Sensitive(permissions.BasePermission):
  def has_permission(self, request, view):
    return request.auth is not None;

  def has_object_permission(self, request, view, obj):
    if obj is None:
      return False
    if type(obj) is User: # Users aren't sensitive.
      return True

    # does the authenticated user own the object?
    if getattr(obj, "user", None) == request.auth.user:
      return True
    elif getattr(obj, "buyer", None) == request.auth.user | getattr(obj, "seller", None) == request.auth.user;
      return True
    
    if type(obj) is models.Requirement:
      qs = getattr(obj, "transaction", [])
    elif type(obj) is models.Signature:
      qs = models.Requirement.objects.filter(signature__id=obj.id).values_list("transaction", flat=True)
    elif type(obj) is models.PaymentData:
      #
      # TODO: test this
      # 1. Authenticate with a user
      # 2. Authenticate with a different user
      # 3. create a payment data (let's call it pd) using the first user
      # 4. create a payment data (let's call it pd') using the second user
      # 5. create a transaction using the payment datas
      # 6. check if the first user can access pd'
      #
      qs = models.Transaction.objects.all()
      qs = qs.filter(buyer_payment_data__id=obj.id) | qs.filter(seller_payment_data__id=obj.id)
  
    if qs is not None:
      for v in qs: # for each model in the queryset
        if self.has_object_permission(request, view, v): # determine if the authenticated user owns it
          return True

    return False

  @classonlymethod
  def filtered_queryset(self, request, model_cls):
    pass

def exempt_methods(perm_cls, methods):
  class Wrapped(perm_cls):
    def has_permission(self, request, view):
      return request.method in methods or super().has_permission(request, view)

    def has_object_permission(self, request, view, obj):
      return request.method in methods or super().has_object_permission(request, view, obj)

  return Wrapped

# Mixins

# list_route without implicit added meaning.
# THIS IS AN OVERSIGHT IN DRF
collection_route = list_route

class PaginationHelperMixin(object):
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

class UserViewSet(viewsets.ModelViewSet, PaginationHelperMixin):
  permission_classes = (exempt_methods(Sensitive, ["GET", "POST"]),)
  queryset = User.objects.order_by("-username")
  serializer_class = serializers.UserSerializer
  filter_backends = (filters.SearchFilter,)
  search_fields = ('username', 'email', 'first_name')

  # Returns the authenticated user.
  # TODO: redirect to /user/<id>
  @collection_route(methods=["GET"], permission_classes=[permissions.IsAuthenticated])
  def me(self, request):
    return Response(self.get_serializer(request.auth.user, many=False).data)

  # Finds a common payment method to use for a transaction.
  @detail_route(methods=["GET"], permission_classes=[permissions.IsAuthenticated])
  def payment(self, request, pk = None):
    pk = int(request.auth.user.id if pk == "me" else pk)
    common = self.find_common_payment(request.auth.user.id, pk);
    if common is None:
      raise NotFound(detail="No common payment data.", code=404)
    return Response(common)

  # Returns the all transactions user id PK shares with the authed user.
  @detail_route(methods=["GET"], permission_classes=[Sensitive])
  def transactions(self, request, pk = None):
    uid = request.auth.user.id
    pk = uid if pk == "me" else int(pk) # the primary key of the user to load transactions for
    qs = models.Transaction.objects.all()
    qs = qs.filter(buyer__id=pk) | qs.filter(seller__id=pk) # Ensure only user #{pk}'s transactions are fetched
    qs = qs & ((qs.filter(buyer__id=uid) | qs.filter(seller__id=uid))) # Ensure only transactions the authenticated user can see are fetched.
    return self.paginated_response(qs.order_by("-created_at"), serializers.TransactionSerializer)

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

## TODO: ensure PaymentData read request.auth.user for user id.
class PaymentDataViewSet(viewsets.ModelViewSet, QuerySetGetterMixin):
  permission_classes = (Sensitive,)
  serializer_class = serializers.PaymentDataSerializer

  def get_queryset(self):
    return models.PaymentData.objects.filter(user=self.request.auth.user).order_by("-created_at").select_related("user")

class TransactionViewSet(viewsets.ModelViewSet):
  permission_classes = (Sensitive,)
  serializer_class = serializers.TransactionSerializer

  # All transactions in which the auth'd user is buying, selling, or has been required in.
  def get_queryset(self):
    u = self.request.auth.user
    buyer = models.Transaction.objects.filter(buyer__id=u.id)
    seller = models.Transaction.objects.filter(seller__id=u.id)
    required = models.Requirement.objects.filter(user__id=u.id).select_related("transaction").values_list("transaction", flat=True)
    return (buyer | seller | required).order_by("-created_at").select_related("buyer", "seller", "buyer_payment_data", "seller_payment_data")

  # Returns all transactions whose requirements haven't been fulfilled.
  @collection_route(methods=["GET"])
  def pending(self, request):
    rqs = RequirementViewSet.obtain_queryset(self.request)
    qs = rqs.filter(signature=None, signature_required=True) | rqs.filter(acknowledged=False, acknowledgment_required=True)
    qs = qs.values_list("transaction", flat=True)
    return self.paginated_response(qs, TransactionViewSet.serializer_class)

## TODO: ensure Signatures read request.auth.user for user id.
class SignatureViewSet(viewsets.ModelViewSet):
  permission_classes = (Sensitive,)
  serializer_class = serializers.SignatureSerializer

  def get_queryset(self):
    return models.Signature.objects.filter(user__id=self.request.auth.user.id).select_related("user")

class RequirementViewSet(viewsets.ModelViewSet, QuerySetGetterMixin):
  permission_classes = (Sensitive,)
  serializer_class = serializers.RequirementSerializer
  filter_backends = (filters.SearchFilter,)
  search_fields = ('text')

  # All requirements for transactions where the auth'd user is required, is buying, or is selling.
  def get_queryset(self):
    u = self.request.auth.user
    by_user = models.Requirement.objects.filter(user__id=u.id)
    related_buyer = models.Requirement.objects.filter(transaction__buyer__id=u.id)
    related_seller = models.Requirement.objects.filter(transaction__seller__id=u.id)
    return (by_user | related_buyer | related_seller).select_related("user", "transaction", "signature")

from . import models
from . import serializers
from django.contrib.auth.models import User
from django.db.models.aggregates import Count
from django.shortcuts import redirect

from rest_framework import viewsets
from rest_framework import permissions
from rest_framework import filters
from rest_framework import mixins
from django.utils.decorators import classonlymethod
from rest_framework.decorators import list_route, detail_route
from rest_framework.response import Response, HttpResponseRedirect
from rest_framework.exceptions import NotFound

from django.conf import settings

# TODO:
# 1. Next and prev must be page numbers.
# 2. Implement field values based on auth
# 3. Implement lossless deletion.

# TRANSACTIONS MAY EXPOSE PAYMENT DATA!!!!!!!!!!!!

# Permissions

# TODO: move to permissions.py
class Sensitive(permissions.BasePermission):
  def has_permission(self, request, view):
    return request.auth is not None;

  # TODO: have this read the user_fields view attr
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
  def paginated_response(self, queryset, serializer, transform = (lambda x: x)):
    return self.get_paginated_response(
      serializer(
        transform(self.paginate_queryset(queryset) or queryset),
        many=True
      ).data
    )

class QuerySetGetterMixin(object):
  @classonlymethod
  def obtain_queryset(clss, request):
    vs = clss()
    vs.request = request
    return vs.filter_queryset(request, vs.get_queryset(), clss)

class AuthOwnershipMixin(object):
  def perform_create(self, serializer):
    user_fields = getattr(typeof(self), 'user_fields', None)
    if self.request.auth is None or user_fields is None:
      serializer.save()
    else:
      uid = self.request.auth.user.id
      def f(acc, fname):
        ret = acc or {}
        ret[fname + "__id"] = uid
        return ret
      serializer.save(reduce(f, user_fields))

class AuthOwnershipFilter(filters.BaseFilterBackend):
  def filter_queryset(self, request, queryset, view):
    if request.auth is None:
      return queryset

    user_fields = getattr(view, 'user_fields', None)
    if user_fields is None:
      return queryset

    uid = request.auth.user.id
    qss = map(lambda fname: queryset.filter(**{(str(fname) + "__id"): uid}), user_fields)
    return reduce(lambda acc,qs: qs if acc is None else acc | qs, qss)

class LosslessDeletionMixin(mixins.DestroyModelMixin):
  def perform_destroy(self, instance):
    deleted_field = getattr(type(self), 'deleted_field', 'is_deleted')
    if hasattr(instance, deleted_field):
      instance.update(**{deleted_field: True})
    else:
      instance.delete()

class LosslessDeletionFilter(filters.BaseFilterBackend):
  def filter_queryset(self, request, queryset, view):
    deleted_field = getattr(view, 'deleted_field', 'is_deleted')
    return queryset.filter(**{deleted_field: False})

#
# Actual API viewsets
#

class UserViewSet(viewsets.ModelViewSet, PaginationHelperMixin):
  permission_classes = (exempt_methods(Sensitive, ["GET", "POST"]),)
  queryset = User.objects.all()
  serializer_class = serializers.UserSerializer
  filter_backends = (filters.SearchFilter,filters.OrderingFilter,filters.DjangoFilterBackend,)
  filter_fields = ('first_name', 'last_name')
  search_fields = ('username', 'email', 'first_name', 'last_name')
  ordering_fields = ('username', 'email', 'first_name', 'last_name')
  ordering = ('-username',)

  # Returns the authenticated user.
  @collection_route(methods=["GET"], permission_classes=[permissions.IsAuthenticated])
  def me(self, request):
    return HttpResponseRedirect("/user/" + str(request.auth.user.id) + "/")

  # Finds a common payment method to use for a transaction.
  @detail_route(methods=["GET"], permission_classes=[permissions.IsAuthenticated])
  def payment(self, request, pk = None):
    if pk == "me":
      return HttpResponseRedirect("/user/" + str(request.auth.user.id) + "/payment/")
    common = self.find_common_payment(request.auth.user.id, pk);
    return common or NotFound(detail="No common payment data.", code=404)

  # Returns the all transactions user id PK shares with the authed user.
  @detail_route(methods=["GET"], permission_classes=[Sensitive])
  def transactions(self, request, pk = None):
    if pk == "me":
      return HttpResponseRedirect("/user/" + str(request.auth.user.id) + "/transactions/")
    uid = request.auth.user.id
    qs = models.Transaction.objects.all()
    qs = qs.filter(buyer__id=pk) | qs.filter(seller__id=pk) # Ensure only user #{pk}'s transactions are fetched
    qs = qs & ((qs.filter(buyer__id=uid) | qs.filter(seller__id=uid))) # Ensure only transactions the authenticated user can see are fetched.
    return self.paginated_response(qs.order_by("-created_at"), serializers.TransactionSerializer)

  def find_common_payment(self, me_id, them_id):
    def makeKindHash(acc, x):
      hsh = acc or {}
      hsh[x.kind] = x
      return hsh

    me = reduce(makeKindHash, models.PaymentData.objects.filter(user__id=me_id))
    them = reduce(makeKindHash, models.PaymentData.objects.filter(user__id=them_id))

    for k in models.PaymentData.KINDS:
      m = me.get(k, None)
      t = them.get(k, None)
      if m is not None and t is not None:
        return Response({
          'me': serializers.PaymentDataSerializer(m).data,
          'them': serializers.PaymentDataSerializer(t).data
        })

    return None

class TransactionViewSet(LosslessDeletionMixin, viewsets.ModelViewSet):
  permission_classes = (Sensitive,)
  serializer_class = serializers.TransactionSerializer
  filter_backends = (filters.OrderingFilter,filters.DjangoFilterBackend,LosslessDeletionFilter,)
  ordering_fields = ('created_at',)
  ordering = "-created_at"
  filter_fields = ('offer','offer_currency',)
  user_fields = ('buyer','seller',)

  # All transactions in which the auth'd user is buying, selling, or has been required in.
  def get_queryset(self):
    u = self.request.auth.user
    buyer = models.Transaction.objects.filter(buyer__id=u.id)
    seller = models.Transaction.objects.filter(seller__id=u.id)
    required = models.Requirement.objects.filter(user__id=u.id).select_related("transaction").values_list("transaction", flat=True)
    return (buyer | seller | required).select_related("buyer", "seller", "buyer_payment_data", "seller_payment_data")

  # Returns all transactions whose requirements haven't been fulfilled.
  @collection_route(methods=["GET"])
  def pending(self, request):
    rqs = RequirementViewSet.obtain_queryset(self.request)
    qs = rqs.filter(signature=None, signature_required=True) | rqs.filter(acknowledged=False, acknowledgment_required=True)
    qs = qs.values_list("transaction", flat=True)
    return self.paginated_response(qs, TransactionViewSet.serializer_class)

## TODO: ensure PaymentData read request.auth.user for user id.
class PaymentDataViewSet(LosslessDeletionMixin, viewsets.ModelViewSet, QuerySetGetterMixin):
  permission_classes = (Sensitive,)
  serializer_class = serializers.PaymentDataSerializer
  queryset = models.PaymentData.objects.all()
  filter_backends = (filters.OrderingFilter,AuthOwnershipFilter,LosslessDeletionFilter,filters.DjangoFilterBackend,)
  filter_fields = ('kind','encrypted',)
  ordering_fields = ('created_at','kind','encrypted',)
  ordering = "-created_at"
  user_fields = ("user",)

## TODO: ensure Signatures read request.auth.user for user id.
class SignatureViewSet(LosslessDeletionMixin, viewsets.ModelViewSet, QuerySetGetterMixin):
  permission_classes = (Sensitive,)
  serializer_class = serializers.SignatureSerializer
  queryset = models.Signature.objects.all()
  filter_backends = (filters.OrderingFilter,AuthOwnershipFilter,LosslessDeletionFilter,)
  ordering_fields = ('created_at',)
  ordering = "-created_at"
  user_fields = ("user",)

class RequirementViewSet(LosslessDeletionMixin, viewsets.ModelViewSet, QuerySetGetterMixin):
  permission_classes = (Sensitive,)
  serializer_class = serializers.RequirementSerializer
  queryset = models.Requirement.objects.all()
  filter_backends = (filters.SearchFilter,filters.OrderingFilter,AuthOwnershipFilter,filters.DjangoFilterBackend,LosslessDeletionFilter,)
  filter_fields = ('text','signature_required','acknowledged','acknowledgment_required',)
  search_fields = ('text',)
  ordering_fields = ('created_at',)
  ordering = "-created_at"
  user_fields = ('user','transaction__buyer','transaction__seller',)

from functools import reduce

from . import models
from . import serializers

from django.conf import settings
from django.contrib.auth.models import User, AnonymousUser
from django.db.models.aggregates import Count
from django.utils.decorators import classonlymethod

from django_filters.rest_framework import DjangoFilterBackend

from rest_framework import viewsets, permissions, filters, mixins, pagination
from rest_framework.decorators import list_route, detail_route
from rest_framework.response import Response
from rest_framework.exceptions import NotFound
from rest_framework.compat import is_authenticated

# TODO:
# 1. Pagination: Next and prev must be page numbers.

# TRANSACTIONS MAY INADVERTENTLY EXPOSE PAYMENT DATA!!!!!!!!!!!!

# Permissions

# TODO: move to permissions.py
class Sensitive(permissions.BasePermission):
  def has_permission(self, request, view):
    u = getattr(request, "user", AnonymousUser())
    return u.is_authenticated

  def has_object_permission(self, request, view, obj):
    if type(obj) is User:
      return True
    if self.check_permission(request.user, obj, getattr(view, "user_fields", [])):
      return True
    return False

    def check_permission(self, authuser, obj, user_fields = []):
      if obj is None:
        return False

      if obj.id == authuser.id:
        return True

      return reduce(lambda acc, x: acc or self.check_permission(authuser, reduce(getattr, x.split('__'), obj)), user_fields, False)

def exempt_methods(perm_cls, methods):
  class Wrapped(perm_cls):
    def has_permission(self, request, view):
      return request.method in methods or super().has_permission(request, view)

    def has_object_permission(self, request, view, obj):
      return request.method in methods or super().has_object_permission(request, view, obj)

  return Wrapped

# Mixins

class EconestyPagination(pagination.PageNumberPagination):
  def get_next_link(self):
    if not self.page.has_next():
        return None
    return self.page.next_page_number()

  def get_previous_link(self):
    if not self.page.has_previous():
        return None
    return self.page.previous_page_number()

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

class AuthOwnershipMixin(object):
  def perform_create(self, serializer):
    user_fields = getattr(typeof(self), 'user_fields', None)
    u = self.request.user
    if not u.is_authenticated or user_fields is None:
      serializer.save()
    else:
      serializer.save(**dict(map(lambda x:(x + "__id", u.id), user_fields)))

class AuthOwnershipFilter(filters.BaseFilterBackend):
  def filter_queryset(self, request, queryset, view):
    if not request.user.is_authenticated:
      return queryset

    user_fields = getattr(view, 'user_fields', None)
    if user_fields is None:
      return queryset

    uid = request.user.id
    qss = map(lambda fname: queryset.filter(**{(str(fname) + "__id"): uid}), user_fields)
    return reduce(lambda acc,qs: qs if acc is None else acc | qs, qss)

class ThroughModelFilter(filters.BaseFilterBackend):
  def filter_queryset(self, request, queryset, view):
    if not request.user.is_authenticated:
      return queryset

    through = getattr(view, 'through', None)
    if through is None or type(through) is not dict:
      return queryset

    through_qss = []
    for model, field in through.items():
      through_qss.push(model.objects.select_related(field).values_list(field, flat=True))

    return reduce(lambda acc, x: acc | x, through_qss, queryset)

class EconestyBaseViewset(viewsets.ModelViewSet,
                          PaginationHelperMixin):
  pass

def redirect_to(url):
  r = Response()
  r['Location'] = url
  r.status = 302
  return r

#
# Actual API viewsets
#

class UserViewSet(EconestyBaseViewset):
  pagination_class = EconestyPagination
  permission_classes = (exempt_methods(Sensitive, ["GET", "POST", "OPTIONS"]),) # Users cannot be updated/deleted without auth.
  queryset = User.objects.all()
  serializer_class = serializers.UserSerializer
  filter_backends = (
    filters.SearchFilter,
    filters.OrderingFilter,
    DjangoFilterBackend,
  )
  filter_fields = ('first_name', 'last_name')
  search_fields = ('username', 'email', 'first_name', 'last_name')
  ordering_fields = ('username', 'email', 'first_name', 'last_name')
  ordering = ('-username',)

  # Returns the authenticated user.
  @collection_route(methods=["GET"], permission_classes=[permissions.IsAuthenticated])
  def me(self, request):
    return redirect_to("/user/" + str(request.user.id) + "/")

  # Finds a common payment method to use for a transaction.
  @detail_route(methods=["GET"], permission_classes=[permissions.IsAuthenticated])
  def payment(self, request, pk = None):
    if pk == "me":
      return redirect_to("/user/" + str(request.user.id) + "/payment/")
    common = self.find_common_payment(request.user.id, pk);
    return common or NotFound(detail="No common payment data.", code=404)

  # Returns the all transactions user id PK shares with the authed user.
  @detail_route(methods=["GET"], permission_classes=[Sensitive])
  def transactions(self, request, pk = None):
    if pk == "me":
      return redirect_to("/user/" + str(request.user.id) + "/transactions/")
    uid = request.user.id
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

class TransactionViewSet(EconestyBaseViewset):
  pagination_class = EconestyPagination
  permission_classes = (Sensitive,)
  serializer_class = serializers.TransactionSerializer
  filter_backends = (
    AuthOwnershipFilter,
    ThroughModelFilter,
    filters.OrderingFilter,
    DjangoFilterBackend,
  )
  ordering_fields = ('created_at',)
  ordering = "-created_at"
  filter_fields = ('offer','offer_currency',)
  user_fields = ('buyer','seller',)
  through = {
    models.Requirement: "transaction"
  }
  queryset = models.Transaction.objects.all()

  # Returns all transactions whose requirements haven't been fulfilled.
  @collection_route(methods=["GET"])
  def pending(self, request):
    rqs = models.Requirement.objects.all()
    qs = rqs.filter(signature=None, signature_required=True) | rqs.filter(acknowledged=False, acknowledgment_required=True)
    qs = qs.select_related("transaction").values_list("transaction", flat=True)
    return self.paginated_response(qs, TransactionViewSet.serializer_class)

class PaymentDataViewSet(AuthOwnershipMixin, EconestyBaseViewset):
  pagination_class = EconestyPagination
  permission_classes = (Sensitive,)
  serializer_class = serializers.PaymentDataSerializer
  queryset = models.PaymentData.objects.select_related("user")
  filter_backends = (
    filters.OrderingFilter,
    AuthOwnershipFilter,
    DjangoFilterBackend,
  )
  filter_fields = ('kind','encrypted',)
  ordering_fields = ('created_at','kind','encrypted',)
  ordering = "-created_at"
  user_fields = ("user",)

class SignatureViewSet(AuthOwnershipMixin, EconestyBaseViewset):
  pagination_class = EconestyPagination
  permission_classes = (Sensitive,)
  serializer_class = serializers.SignatureSerializer
  queryset = models.Signature.objects.select_related("user")
  filter_backends = (
    filters.OrderingFilter,
    AuthOwnershipFilter,
  )
  ordering_fields = ('created_at',)
  ordering = "-created_at"
  user_fields = ("user",)

class RequirementViewSet(AuthOwnershipMixin, EconestyBaseViewset):
  pagination_class = EconestyPagination
  permission_classes = (Sensitive,)
  serializer_class = serializers.RequirementSerializer
  queryset = models.Requirement.objects.all()
  filter_backends = (
    filters.SearchFilter,
    filters.OrderingFilter,
    AuthOwnershipFilter,
    DjangoFilterBackend,
  )
  filter_fields = ('text','signature_required','acknowledged','acknowledgment_required',)
  search_fields = ('text',)
  ordering_fields = ('created_at',)
  ordering = "-created_at"
  user_fields = ('user','transaction__buyer','transaction__seller',)

class TokenViewSet(mixins.CreateModelMixin, mixins.DestroyModelMixin, viewsets.GenericViewSet):
  queryset = models.Token.objects.all()
  serializer_class = serializers.TokenSerializer

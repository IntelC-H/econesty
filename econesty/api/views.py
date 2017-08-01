from functools import reduce

from . import models
from . import serializers
from .permissions import Sensitive, exempt_methods
from .filters import AuthOwnershipFilter
from .mixins import EconestyPagination, WriteOnlyViewset, EconestyBaseViewset, AuthOwnershipMixin

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

# TRANSACTIONS MAY INADVERTENTLY EXPOSE PAYMENT DATA!!!!!!!!!!!!
# NO SELF-TRANSACTIONS!

class UserViewSet(EconestyBaseViewset):
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

  # Finds a common payment method to use for a transaction.
  @detail_route(methods=["GET"], permission_classes=[permissions.IsAuthenticated])
  def payment(self, request, pk = None):
    def makeKindHash(acc, x):
      hsh = acc or {}
      hsh[x.kind] = x
      return hsh

    me = reduce(makeKindHash, models.PaymentData.objects.filter(user__id=request.user.id))
    them = reduce(makeKindHash, models.PaymentData.objects.filter(user__id=pk))

    for k in models.PaymentData.KINDS:
      m = me.get(k, None)
      t = them.get(k, None)
      if m is not None and t is not None:
        return Response({
          'me': serializers.PaymentDataSerializer(m).data,
          'them': serializers.PaymentDataSerializer(t).data
        })

    return NotFound(detail="No common payment data.", code=404)

  # Returns the all transactions user id PK shares with the authed user.
  @detail_route(methods=["GET"], permission_classes=[Sensitive])
  def transactions(self, request, pk = None):
    uid = request.user.id
    qs = models.Transaction.objects.all()
    qs = qs.filter(buyer__id=pk) | qs.filter(seller__id=pk) # Ensure only user #{pk}'s transactions are fetched
    qs = qs & ((qs.filter(buyer__id=uid) | qs.filter(seller__id=uid))) # Ensure only transactions the authenticated user can see are fetched.
    return self.paginated_response(qs.order_by("-created_at"), serializers.TransactionSerializer)

class TransactionViewSet(EconestyBaseViewset):
  serializer_class = serializers.TransactionSerializer
  queryset = models.Transaction.objects.all()
  filter_backends = (
    AuthOwnershipFilter,
    filters.OrderingFilter,
    DjangoFilterBackend,
  )
  ordering_fields = ('created_at',)
  ordering = "-created_at"
  filter_fields = ('offer','offer_currency',)
  user_fields = ('buyer','seller',)

  # TODO: auth'd user's transactions pending completion of requirements
  #       Do this through a queryset that filters based on calculated property
  # TODO: auth'd user's transactions that have been completed.
  #       See above
  # TODO: auth'd user's transactions that have had their requirements completed, but have not been finalized yet.
  
  # IMPORTANT: this is a starting point for the first two.
  # # Returns all transactions whose requirements haven't been fulfilled.
  # @list_route(methods=["GET"])
  # def pending(self, request):
  #   rqs = models.Requirement.objects.all()
  #   qs = rqs.filter(signature=None, signature_required=True) | rqs.filter(acknowledged=False, acknowledgment_required=True)
  #   qs = qs.select_related("transaction").values_list("transaction", flat=True)
  #   return self.paginated_response(qs, TransactionViewSet.serializer_class)

class PaymentDataViewSet(AuthOwnershipMixin, EconestyBaseViewset):
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

class TokenViewSet(WriteOnlyViewset):
  serializer_class = serializers.TokenSerializer
  queryset = models.Token.objects.all()

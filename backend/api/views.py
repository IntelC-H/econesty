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
from django.core.exceptions import ObjectDoesNotExist

from django_filters.rest_framework import DjangoFilterBackend

from rest_framework import viewsets, permissions, filters, mixins, pagination
from rest_framework.decorators import list_route, detail_route
from rest_framework.response import Response
from rest_framework.exceptions import NotFound, APIException

# FIXME: TRANSACTIONS MAY INADVERTENTLY EXPOSE PAYMENT DATA!!!!!!!!!!!!
# FIXME: NO SELF-TRANSACTIONS!

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
      acc[x.kind] = x
      return acc

    me = reduce(makeKindHash, models.PaymentData.objects.filter(user__id=request.user.id), {})
    them = reduce(makeKindHash, models.PaymentData.objects.filter(user__id=str(pk)), {})

    for k in models.PaymentData.KINDS:
      m = me.get(k, None)
      t = them.get(k, None)
      if m is not None and t is not None:
        return Response({
          'me': serializers.PaymentDataSerializer(m).data,
          'them': serializers.PaymentDataSerializer(t).data
        })

    raise NotFound(detail="No common payment data.", code=404)

  # TODO: if pk == request.user.id, proxy through to TransactionViewSet
  # Returns the all transactions user id PK shares with the authed user.
  @detail_route(methods=["GET"], permission_classes=[Sensitive])
  def transactions(self, request, pk = None):
    return self.paginated_response(
      models.Transaction.objects.owned_by(request.user.id, int(pk)).order_by("-created_at"),
      serializer = serializers.TransactionSerializer
    )

# PROPOSAL: no update
# PROPOSAL: creating a transaction takes:
# buyer_id, seller_id, offer, and currency. Payment data are negotiated behind the scenes.
class TransactionViewSet(EconestyBaseViewset):
  serializer_class = serializers.TransactionSerializer
  queryset = models.Transaction.objects.all()
  filter_backends = (
    filters.OrderingFilter,
    DjangoFilterBackend,
    AuthOwnershipFilter,
  )
  ordering_fields = ('created_at',)
  ordering = "created_at"
  filter_fields = ('offer','offer_currency',)
  user_fields = ('buyer','seller',)

  @list_route(methods=["GET"])
  def pending_action(self, request):
    return self.paginated_response(self.filter_queryset(models.Transaction.objects.pending()))

  @list_route(methods=["GET"])
  def pending_completion(self, request):
    return self.paginated_response(self.filter_queryset(models.Transaction.objects.nonpending()).filter(completed = False))

  @list_route(methods=["GET"])
  def completed(self, request):
    return self.paginated_response(self.filter_queryset(models.Transaction.objects.nonpending()).filter(completed = True))

  @detail_route(methods=["POST"])
  def complete(self, request, pk):
    xaction = self.get_object()
    if xaction not in models.Transaction.objects.nonpending():
      raise APIException("the transaction has outstanding requirements.")
    xaction.completed = True
    xaction.save()
    return Response(serializers.TransactionSerializer(xaction).data)

class PaymentDataViewSet(AuthOwnershipMixin, EconestyBaseViewset):
  serializer_class = serializers.PaymentDataSerializer
  queryset = models.PaymentData.objects.select_related("user")
  filter_backends = (
    filters.OrderingFilter,
    DjangoFilterBackend,
    AuthOwnershipFilter,
  )
  filter_fields = ('kind','encrypted',)
  ordering_fields = ('created_at','kind','encrypted',)
  ordering = "-created_at"
  user_fields = ("user",)

class RequirementViewSet(AuthOwnershipMixin, EconestyBaseViewset):
  serializer_class = serializers.RequirementSerializer
  queryset = models.Requirement.objects.all()
  filter_backends = (
    filters.SearchFilter,
    filters.OrderingFilter,
    DjangoFilterBackend,
    AuthOwnershipFilter,
  )
  filter_fields = ('text','signature_required','acknowledged','acknowledgment_required','transaction_id', 'user__id',)
  search_fields = ('text',)
  ordering_fields = ('created_at',)
  ordering = "-created_at"
  user_fields = ('user','transaction__buyer','transaction__seller',)

class TokenViewSet(WriteOnlyViewset):
  serializer_class = serializers.TokenSerializer
  queryset = models.Token.objects.all()

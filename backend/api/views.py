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

class UserViewSet(EconestyBaseViewset):
  permission_classes = (exempt_methods(Sensitive, ["GET", "POST", "OPTIONS"]),) # Users cannot be updated nor deleted without auth.
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

  # Returns the all transactions user id PK shares with the authed user.
  @detail_route(methods=["GET"], permission_classes=[Sensitive])
  def transactions(self, request, pk = None):
    user_id = int(pk)
    me_id = request.user.id

    man = models.Transaction.objects
    qs = man.filter(buyer__id=me_id) | man.filter(seller__id=me_id)
    if user_id is not me_id:
      qs = qs & (man.filter(buyer__id=user_id) | man.filter(seller__id=user_id))

    return self.paginated_response(
      qs.ordered_by("-created_at"),
      serializer = serializers.TransactionSerializer
    )

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
  filter_fields = ('amount','success',)
  user_fields = ('buyer','seller',)

class WalletViewSet(EconestyBaseViewset):
  serializer_class = serializers.WalletSerializer
  queryset = models.Wallet.objects.all()
  filter_backends = (
    filters.OrderingFilter,
    DjangoFilterBackend
  )
  ordering_fields = ('created_at','kind','encrypted',)
  ordering = "-created_at"

class RequirementViewSet(AuthOwnershipMixin, EconestyBaseViewset):
  serializer_class = serializers.RequirementSerializer
  queryset = models.Requirement.objects.all()
  filter_backends = (
    filters.SearchFilter,
    filters.OrderingFilter,
    DjangoFilterBackend,
    AuthOwnershipFilter,
  )
  filter_fields = ('text','signature_required','acknowledged','acknowledgment_required','transaction__id', 'user__id',)
  search_fields = ('text',)
  ordering_fields = ('created_at',)
  ordering = "-created_at"
  user_fields = ('user','transaction__buyer','transaction__seller',)

class TokenViewSet(WriteOnlyViewset):
  serializer_class = serializers.TokenSerializer
  queryset = models.Token.objects.all()

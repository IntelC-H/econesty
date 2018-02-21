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

class PaymentRequired(APIException):
  status_code = 402
  default_detail = 'Request was valid, but a payment was required.'
  default_code = 'payment_required'

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
    qs = man.filter(sender__id=user_id) | man.filter(recipient__id=user_id)
    if user_id != me_id:
      qs = qs & (man.filter(sender__id=me_id) | man.filter(recipient__id=me_id))

    return self.paginated_response(
      qs.order_by("-created_at"),
      serializer = serializers.TransactionSerializer
    )

  @detail_route(methods=["GET"], permission_classes=[Sensitive])
  def all_wallets(self, request, pk = None):
    return self.unpaginated_response(
      models.Wallet.objects.filter(user__id=pk),
      serializer = serializers.WalletSerializer
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
  user_fields = ('sender','recipient',)

  def get_serializer_class(self):
    if self.action in ["create", "update", "partial_update"]:
      return serializers.TransactionSerializerWithRequirements
    return super().get_serializer_class()

  @detail_route(methods=["POST"], permission_classes=[Sensitive])
  def finalize(self, request, pk):
    try:
      t = self.get_queryset().get(id=pk)
    except models.DoesNotExist as e:
      raise NotFound(detail="Transaction does not exist.", code=404)

    if t.completed:
      try: 
        transaction.finalize()      
      except Exception as e:
        raise APIException(detail=str(e), code=402)

  def on_create(self, request, pk):
    transaction = self.get_queryset().get(id=pk)
    if transaction.completed:
      try: 
        transaction.finalize()
        s = serializers.TransactionSerializer(transaction)
        return Response(s.data)
      except Exception as e:
        raise APIException(detail=str(e), code=402)

  def on_update(self, request, pk, partial):
    transaction =  self.get_queryset().get(id=pk)
    if transaction.completed:
      try: 
        transaction.finalize()
        s = serializers.TransactionSerializer(transaction)
        return Response(s.data)
      except Exception as e:
        raise APIException(detail=str(e), code=402)

class WalletViewSet(EconestyBaseViewset):
  serializer_class = serializers.WalletSerializer
  queryset = models.Wallet.objects.all()
  filter_backends = (
    filters.OrderingFilter,
    DjangoFilterBackend
  )
  ordering_fields = ('created_at',)
  ordering = "-created_at"
  filter_fields = ('user__id',)
  user_fields = ('user',)

  def get_serializer_class(self):
    if self.action == 'retrieve':
      return serializers.WalletDetailSerializer
    return super().get_serializer_class()

class RequirementViewSet(AuthOwnershipMixin, EconestyBaseViewset):
  serializer_class = serializers.RequirementSerializer
  queryset = models.Requirement.objects.all()
  filter_backends = (
    filters.SearchFilter,
    filters.OrderingFilter,
    DjangoFilterBackend,
    AuthOwnershipFilter,
  )
  filter_fields = ('text','acknowledged','transaction__id', 'user__id',)
  search_fields = ('text',)
  ordering_fields = ('created_at',)
  ordering = "-created_at"
  user_fields = ('user','transaction__sender','transaction__recipient',)

  def on_create(self, request, pk):
    requirement = self.get_queryset().get(id=pk)
    if requirement.transaction.completwed:
      try: 
        requirement.transaction.finalize()      
      except Exception as e:
        raise APIException(detail=str(e), code=402)

  def on_update(self, request, pk, partial):
    requirement = self.get_queryset().get(id=pk)
    if requirement.transaction.completed:
      try: 
        requirement.transaction.finalize()      
      except Exception as e:
        raise APIException(detail=str(e), code=402)

class TokenViewSet(WriteOnlyViewset):
  serializer_class = serializers.TokenSerializer
  queryset = models.Token.objects.all()

  def create(self, request):
    res = super().create(request)

    if settings.DEBUG:
      res.set_cookie("Authorization", "Token " + res.data["key"], path="/api")

    return res

  @list_route(methods=["DELETE"])
  def clear(self, request):
    res = None
    if request.auth:
      request.auth.delete()
      res = Response({}, status=204)
    else:
      res = Response({}, status=401)

    if settings.DEBUG:
      res.set_cookie("Authorization", max_age=-99999999)
    return res

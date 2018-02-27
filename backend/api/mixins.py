from rest_framework import viewsets, mixins, pagination
from rest_framework.response import Response
from .permissions import Sensitive
from .pagination import EconestyPagination
from functools import reduce

class OptionalPaginationMixin(object):
  optional_pagination_param = "paginate"

  def paginate_queryset(self, queryset):
    param = self.request.query_params.get(self.optional_pagination_param, True)
    if param in [True, 'True', 'true', '1', 't', 'y', 'yes']:
      return super().paginate_queryset(queryset)
    return None

class OwnershipMixin(object):
  """
  If a ViewSet has an `owner_field` property, whenever it creates
  objects, set the `owner_field` of that property to the authenticated
  user, if authenticated.
  """
  def perform_create(self, serializer):
    owner_field = getattr(type(self), 'owner_field', None)
    u = self.request.user
    if not u.is_authenticated or owner_field is None:
      serializer.save()
    else:
      save_dict = serializer.validated_data
      *init, last = owner_field.split('__')
      d = reduce(lambda d, k: d and d.get(k, None), init)
 
      if d is not None:
        d[last] = u

      serializer.save(**save_dict)

class CreateUpdateHookMixin(object):
  """
  Add hooks to create/update/partial_update that enable
  changes to the object in question. If a hook returns an
  object, it is ONLY rendered as the response. You are
  responsible for saving objects in your hooks.
  """
  def on_update(self, request, partial):
    pass

  def on_create(self, request):
    pass
  
  def create(self, request):
    v = super().create(request)
    new_obj = self.on_create(request)
    if new_obj:
      return Response(self.get_serializer(new_obj).data)
    return v

  def update(self, request, pk = None):
    v = super().update(request, pk)
    new_obj = self.on_update(request, False)
    if new_obj:
      return Response(self.get_serializer(new_obj).data)
    return v

  def partial_update(self, request, pk = None):
    v = super().update(request, pk, partial=True)
    new_obj = self.on_update(request, True)
    if new_obj:
      return Response(self.get_serializer(new_obj).data)
    return v

class EconestyBaseViewset(CreateUpdateHookMixin,
                          OwnershipMixin,
                          OptionalPaginationMixin,
                          viewsets.ModelViewSet):
  pagination_class = EconestyPagination
  permission_classes = (Sensitive,)

class WriteOnlyViewset(mixins.CreateModelMixin,
                       mixins.DestroyModelMixin,
                       OwnershipMixin,
                       viewsets.GenericViewSet):
  pass

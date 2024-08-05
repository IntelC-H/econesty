from rest_framework import viewsets, mixins, pagination
from rest_framework.response import Response
from .permissions import Sensitive
from .pagination import EconestyPagination
from functools import reduce

class OptionalPaginationMixin(object):
  """
  Allow pagination to be disabled with a URL param.
  """
  optional_pagination_param = "paginate"

  def paginate_queryset(self, queryset):
    param = self.request.query_params.get(self.optional_pagination_param, True)
    if param in [True, 'True', 'true', '1', 't', 'y', 'yes']:
      return super().paginate_queryset(queryset)
    return None

class ImpliedOwnershipMixin(object):
  """
  Allow the authenticated user to automatically own model objects.
  Given a field named by the attr `owner_field` on a view set and an
  authenticated user, whenever an object is created by the viewset,
  set `obj.<owner_field>` to the authenticated user if `obj.<owner_field>`
  is `None` or does not exist.
  """
  def perform_create(self, serializer):
    owner_field = getattr(type(self), 'owner_field', None)
    u = self.request.user
    if not u.is_authenticated or owner_field is None:
      serializer.save()
    else:
      save_dict = serializer.validated_data
      *init, last = owner_field.split('__')
      d = reduce(lambda d, k: d and d.get(k, None), init, save_dict)

      if d is not None and d.get(last, None) is None:
        d[last] = u

      serializer.save(**save_dict)

class CreateUpdateHookMixin(object):
  """
  Add hooks to create/update/partial_update that enable
  changes to the object in question. Any changes to the
  `obj` parameter in `on_update` or `on_create` are reflected
  in responses.
  """
  def on_update(self, obj):
    pass

  def on_create(self, obj):
    pass

  def perform_create(self, serializer):
    super().perform_create(serializer)
    setattr(serializer.context["request"], "_instance", serializer.instance)
    self.on_create(serializer.instance)

  def perform_update(self, serializer):
    super().perform_update(serializer)
    self.on_update(serializer.instance)

class EconestyBaseViewset(CreateUpdateHookMixin,
                          ImpliedOwnershipMixin,
                          OptionalPaginationMixin,
                          viewsets.ModelViewSet):
  pagination_class = EconestyPagination
  permission_classes = (Sensitive,)

class WriteOnlyViewset(CreateUpdateHookMixin,
                       ImpliedOwnershipMixin,
                       mixins.CreateModelMixin,
                       mixins.DestroyModelMixin,
                       viewsets.GenericViewSet):
  pass

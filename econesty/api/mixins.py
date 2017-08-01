from rest_framework import viewsets, mixins, pagination
from .permissions import Sensitive

class EconestyPagination(pagination.PageNumberPagination):
  def get_next_link(self):
    if not self.page.has_next():
      return None
    return self.page.next_page_number()

  def get_previous_link(self):
    if not self.page.has_previous():
      return None
    return self.page.previous_page_number()

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

class WriteOnlyViewset(mixins.CreateModelMixin,
                       mixins.DestroyModelMixin,
                       viewsets.GenericViewSet):
  pass

class EconestyBaseViewset(PaginationHelperMixin,
                          viewsets.ModelViewSet):
  pagination_class = EconestyPagination
  permission_classes = (Sensitive,)
  pass

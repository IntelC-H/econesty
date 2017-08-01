from rest_framework import viewsets, mixins, pagination
from rest_framework.response import Response
from .permissions import Sensitive

class EconestyPagination(pagination.PageNumberPagination):
  def get_paginated_response(self, data):
    next_page = self.page.next_page_number() if self.page.has_next() else None
    previous_page = self.page.previous_page_number() if self.page.has_previous() else None
    if next_page is not None:
      current_page = next_page - 1
    elif previous_page is not None:
      current_page = previous_page + 1
    return Response({
      'next': next_page,
      'previous': previous_page,
      'page': current_page or 1,
      'count': self.page.paginator.count,
      'results': data
    })

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

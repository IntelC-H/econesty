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
    else:
      current_page = 1
    return Response({
      'next': next_page,
      'previous': previous_page,
      'page': current_page,
      'count': self.page.paginator.count,
      'results': data
    })

class PaginationHelperMixin(object):
  def paginated_response(self, queryset, serializer = None, transform = (lambda x: x)):
    serializer_p = serializer or getattr(type(self), "serializer_class")
    return self.get_paginated_response(
      serializer_p(
        transform(self.paginate_queryset(queryset) or queryset),
        many=True
      ).data
    )

# def set_keypath(kpath, value, aDict, separator = '.'):
#   splt = kpath.split(separator)
#   d = aDict
#   for k in splt[:-1]:
#     if hasattr(d, "__getitem__"):
#       d = d[k]
#     else:
#       d = getattr(d, k)

#   if hasattr(d, "__setitem__"):
#     d[splt[-1]] = value
#   else:
#     setattr(d, splt[-1], value)

# TODO: set nested
class AuthOwnershipMixin(object):
  def perform_create(self, serializer):
    user_fields = getattr(type(self), 'user_fields', None)
    u = self.request.user
    if not u.is_authenticated or user_fields is None:
      serializer.save()
    else:
      save_dict = serializer.validated_data
      for x in user_fields:
        if not '__' in x:
          save_dict[x] = u

      serializer.save(**save_dict)

class WriteOnlyViewset(mixins.CreateModelMixin,
                       mixins.DestroyModelMixin,
                       viewsets.GenericViewSet):
  pass

class EconestyBaseViewset(PaginationHelperMixin,
                          viewsets.ModelViewSet):
  pagination_class = EconestyPagination
  permission_classes = (Sensitive,)
  pass

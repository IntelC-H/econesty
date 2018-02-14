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
        many=True,
        context=self.get_serializer_context()
      ).data
    )

  def unpaginated_response(self, queryset, serializer = None, transform = (lambda x: x)):
    serializer_p = serializer or getattr(type(self), "serializer_class")
    queryset_p = transform(queryset)
    return Response({
      'count': queryset_p.count(),
      'results': serializer_p(
                   queryset_p,
                   many=True,
                   context=self.get_serializer_context()).data
    })

  def signleton_response(self, queryset, serializer = None):
    serializer_p = serializer or getattr(type(self), "serializer_class")
    return Response(
             serializer_p(
               queryset,
               many=False,
               context=self.get_serializer_context()).data)

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

  def on_update(self, request, obj, partial):
    pass

  def on_create(self, request, obj):
    pass
  
  def create(self, request):
    v = super().create(request)
    new_res = self.on_create(request, v.data["id"])
    return new_res or v

  def update(self, request, pk = None):
    v = super().update(request, pk)
    new_res = self.on_update(request, pk, False)
    return new_res or v

  def partial_update(self, request, pk = None):
    v = super().update(request, pk, partial=True)
    new_res = self.on_update(request, pk, True)
    return new_res or v


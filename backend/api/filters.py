from rest_framework import filters
from django.db.models import Q
from functools import reduce

class AuthVisibilityFilter(filters.BaseFilterBackend):
  """
  Filter a queryset by whether an object references the authenticated
  user. All objects in filtered querysets will have at least one field
  (whose name is in the `visible_to` attr) whose value will be the
  authenticated user.
  """
  def filter_queryset(self, request, queryset, view):
    if not request.user.is_authenticated:
      return queryset.none()

    uid = request.user.id
    visible_to = getattr(view, 'visible_to', [])

    def reduce_func(a, b):
      q = Q(**{(str(b) + "__id"): uid})
      return q if a is None else a | q

    return queryset.filter(reduce(reduce_func, visible_to, None))

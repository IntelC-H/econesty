from rest_framework import filters
from functools import reduce

class AuthOwnershipFilter(filters.BaseFilterBackend):
  def filter_queryset(self, request, queryset, view):
    if not request.user.is_authenticated:
      return queryset

    user_fields = getattr(view, 'user_fields', None)
    if user_fields is None:
      return queryset

    uid = request.user.id
    return reduce(
      lambda acc,qs: qs if acc is None else acc | qs,
      [queryset.filter(**{(str(fname) + "__id"): uid}) for fname in user_fields]
    )

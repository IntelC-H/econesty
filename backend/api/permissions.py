from django.contrib.auth.models import User, AnonymousUser
from rest_framework import permissions
from functools import reduce

def safe_getattr(obj, key):
  return getattr(obj, key, None)

class Sensitive(permissions.BasePermission):
  def has_permission(self, request, view):
    return getattr(request, "user", AnonymousUser()).is_authenticated

  def has_object_permission(self, request, view, obj):
    if obj is None:
      return True

    if type(obj) is User:
      return True

    for field in getattr(view, "user_fields", []):
      user = reduce(safe_getattr, field.split('__'), obj)
      if user and user.id is request.user.id:
        return True

    return False

def exempt_methods(perm_cls, methods):
  class Wrapped(perm_cls):
    def has_permission(self, request, view):
      return request.method in methods or super().has_permission(request, view)

    def has_object_permission(self, request, view, obj):
      return request.method in methods or super().has_object_permission(request, view, obj)

  return Wrapped

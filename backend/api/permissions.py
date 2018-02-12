from django.contrib.auth.models import User, AnonymousUser
from rest_framework import permissions
from functools import reduce

def safe_getattr(obj, key):
  return getattr(obj, key, None)

class Sensitive(permissions.BasePermission):
  def has_permission(self, request, view):
    u = getattr(request, "user", AnonymousUser())
    return u.is_authenticated

  def has_object_permission(self, request, view, obj):
    if type(obj) is User:
      return True
    if self.check_permission(request.user, obj, getattr(view, "user_fields", [])):
      return True
    return False

  def check_permission(self, authuser, obj, user_fields = []):
    if obj is None:
      return True

    for field in user_fields:
      user = reduce(safe_getattr, field.split('__'), obj)
      if user and user.id is authuser.id:
        return True

    return False

def exempt_methods(perm_cls, methods):
  class Wrapped(perm_cls):
    def has_permission(self, request, view):
      return request.method in methods or super().has_permission(request, view)

    def has_object_permission(self, request, view, obj):
      return request.method in methods or super().has_object_permission(request, view, obj)

  return Wrapped

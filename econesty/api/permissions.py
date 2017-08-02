from django.contrib.auth.models import User, AnonymousUser
from rest_framework import permissions
from functools import reduce

# TODO: Redact PaymentData from object?

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
      return False

    if obj.id == authuser.id:
      return True

    def f(acc, x):
      return acc or self.check_permission(authuser, reduce(getattr, x.split('__'), obj))

    return reduce(f, user_fields, False)

def exempt_methods(perm_cls, methods):
  class Wrapped(perm_cls):
    def has_permission(self, request, view):
      return request.method in methods or super().has_permission(request, view)

    def has_object_permission(self, request, view, obj):
      return request.method in methods or super().has_object_permission(request, view, obj)

  return Wrapped
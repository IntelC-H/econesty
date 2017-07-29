from django.http import JsonResponse, HttpResponseRedirect
import re
from . import models
from django.contrib.auth.models import AnonymousUser

REPLACE_ME_REGEX = re.compile(r'(?<=\/)(me)(?=\/)', re.U)

def RewriteMeToUserID(get_response):
  def middleware(request):
    user = getattr(request, "user", None)
    if re.search(REPLACE_ME_REGEX, request.path_info) is not None:
      if user.is_authenticated:
        print(user)
        return HttpResponseRedirect(re.sub(REPLACE_ME_REGEX, str(user.id), request.path_info))
      else:
        return JsonResponse({ "detail": "Authorization not provided." }, status=401)
    return get_response(request)
  return middleware

def TokenAuth(get_response):
  def middleware(request):
    request.user = AnonymousUser()
    if 'HTTP_AUTHORIZATION' in request.META:
      auth_header = request.META['HTTP_AUTHORIZATION']
      auth_method, token = re.split(re.compile(r'\s+', re.U), auth_header, 1)
      if auth_method == "Token":
        try:
          request.user = models.Token.objects.get(key=token).user
        except models.Token.DoesNotExist:
          pass
    return get_response(request)
  return middleware
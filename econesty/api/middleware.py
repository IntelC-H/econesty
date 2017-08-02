from django.http import JsonResponse, HttpResponseRedirect
import re
from . import models
from django.contrib.auth.models import AnonymousUser

def RewriteMeToUserID(get_response):
  REPLACE_ME_REGEX = re.compile(r'(?<=\/)(me)(?=\/)', re.U)
  def middleware(request):
    user = getattr(request, "user", None)
    if re.search(REPLACE_ME_REGEX, request.path_info) is not None:
      if user.is_authenticated:
        request.path_info = re.sub(REPLACE_ME_REGEX, str(user.id), request.path_info)
      else:
        return JsonResponse({ "detail": "Authentication credentials were not provided." }, status=401)
    return get_response(request)
  return middleware

# Resets auth state to reflect an unauthorized state.
def ResetAuth(get_response):
  def middleware(request):
    request.user = AnonymousUser()
    request.auth = None

    # DRF appeasement
    request._user = AnonymousUser()
    request._auth = None
    return get_response(request)
  return middleware

# Load authentication information for any "Authorization: Token *" headers.
def TokenAuth(get_response):
  def middleware(request):
    tok = models.Token.read_token(request)
    if tok is not None:
      request.user = tok.user
      request.auth = tok
      # DRF appeasement
      request._user = tok.user
      request._auth = tok
    return get_response(request)
  return middleware

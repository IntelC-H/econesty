import os
import mimetypes

from django.conf import settings
from django.http import StreamingHttpResponse

def file_exists(path):
  try:
    if os.path.isdir(path):
      return False
    os.stat(path)
    return True
  except os.error:
    return False

def frontend(request, path):
  full_path = os.path.join(settings.FRONTEND_PATH, path)

  if full_path.endswith("/"):
    full_path = full_path[:-1]

  if not file_exists(full_path):
    full_path = os.path.join(settings.FRONTEND_PATH, 'index.html')

  if file_exists(full_path + ".gz"):
    full_path += ".gz";

  response = StreamingHttpResponse((line for line in open(full_path, 'rb')))

  if full_path.endswith(".map"):
    mimetype, enctype = mimetypes.guess_type(os.path.splitext(full_path)[0])
  else:
    mimetype, enctype = mimetypes.guess_type(full_path)

  if full_path.endswith(".gz"):
    enctype = enctype or "gzip"

  response['Content-Length'] = os.path.getsize(full_path)
  if mimetype is not None:
    response['Content-Type'] = mimetype
  if enctype is not None:
    response['Content-Encoding'] = enctype
  return response
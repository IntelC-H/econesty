"""econesty URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.11/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import include, url
from django.conf import settings

from django.contrib.staticfiles.views import serve as serve_static
from django.contrib.staticfiles.finders import find as find_static

from . import api

# serves either a matching staticfile or the index page.
def serve_app(request, path):
  if len(path) > 0 and find_static(path) is not None:
    return serve_static(request, path)
  else:
    return serve_static(request, 'index.html')

urlpatterns = [
  url(r'^api/', include('econesty.api.urls')),
  url(r'^(?P<path>.*)\Z', serve_app, name="frontend")
]

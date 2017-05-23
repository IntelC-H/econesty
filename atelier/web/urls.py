from django.conf.urls import url
from . import views

urlpatterns = [
  url(r'^appraisals', views.appraisal, name="appraisal"),
  url(r'^', views.index, name="index"),
]

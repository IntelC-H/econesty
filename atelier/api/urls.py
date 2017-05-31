from django.conf.urls import url
from . import views

urlpatterns = [
  url(r'^transactions/$', views.transactions, name="transactions"),
  url(r'^transactions/new/$', views.new_transaction, name="new_transaction"),
  url(r'^transactions/countersign/$', views.csign_transaction, name="csign_transaction"),
  url(r'^', views.index, name="index"),
]

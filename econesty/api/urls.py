from django.conf.urls import url, include
from . import views
from rest_framework import routers
from rest_framework.exceptions import NotFound
from rest_framework.decorators import api_view

router = routers.SimpleRouter(trailing_slash=True)
router.register(r'user', views.UserViewSet, base_name=r'user')
router.register(r'transaction', views.TransactionViewSet, base_name=r'transaction')
router.register(r'requirement', views.RequirementViewSet, base_name=r'requirement')
router.register(r'signature', views.SignatureViewSet, base_name=r'signature')
router.register(r'payment_data', views.PaymentDataViewSet, base_name=r'payment_data')
router.register(r'token', views.TokenViewSet, base_name=r'token')

@api_view()
def not_found(request):
  raise NotFound('not found')

app_name = "api"

urlpatterns = [
  url(r'', include(router.urls)),
  url(r'', not_found, name='notfound'), # stop URL matching because this is a modular app.
]

from django.conf.urls import url, include
from . import views
from rest_framework import routers
import rest_framework.authtoken.views as aviews
from rest_framework.exceptions import NotFound
from rest_framework.decorators import api_view

router = routers.SimpleRouter(trailing_slash=True)
router.register(r'user', views.UserViewSet, base_name=r'user')
router.register(r'transaction', views.TransactionViewSet, base_name=r'transaction')
router.register(r'requirement', views.RequirementViewSet, base_name=r'requirement')
router.register(r'signature', views.SignatureViewSet, base_name=r'signature')
router.register(r'payment_data', views.PaymentDataViewSet, base_name=r'payment_data')

@api_view()
def not_found(request):
  raise NotFound('not found')

urlpatterns = [
  url(r'\A', include(router.urls)),
  url(r'\Atoken/', aviews.obtain_auth_token, name=r'token'),
  url(r'\A.*\Z', not_found, name=r'notfound') # stop URL matching because this is a modular app.
]

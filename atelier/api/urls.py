from django.conf.urls import url, include
from . import views
from rest_framework import routers
import rest_framework.authtoken.views as aviews

router = routers.DefaultRouter()
router.register(r'user', views.UserViewSet)
router.register(r'transaction', views.TransactionViewSet)
router.register(r'counter_signature', views.CounterSignatureViewSet)
router.register(r'payment_data', views.PaymentDataViewSet)

urlpatterns = [
  url(r'^', include(router.urls)),
  url(r'^token/', aviews.obtain_auth_token),
]

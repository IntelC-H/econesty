from django.test import TestCase
from . import models
from django.contrib.auth.models import User

# Test models

# Inserts two users into the database 
class APITestCase(TestCase):
  @classmethod
  def setUpClass(cls):
    super().setUpClass()
    cls.userA = User.create()
    cls.userApaymentData = models.PaymentData.create()

    cls.userB = User.create()
    cls.userBpaymentData = models.PaymentData.create()


class TransactionTestCase(TestCase):
  def setUp(self):
   # models.Transaction.create()
    pass

  def test_(self):
    pass
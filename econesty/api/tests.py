from django.test import TestCase, RequestFactory
from django.core.urlresolvers import reverse
from rest_framework.test import APIRequestFactory, APIClient
from django.contrib.auth.hashers import check_password

from django.contrib.auth.models import User, AnonymousUser
from . import models
from . import views
from . import serializers
from . import middleware
from . import fields

import json

# Test middleware.py
# Test fields.py
# test views.py: permissions & mixins mostly.

class BaseTestCase(TestCase):
  def setUp(self):
    self.username = "username"
    self.password = "password"
    u = User(
      username=self.username,
      first_name="first_name",
      last_name="last_name",
      email="email@foo.bar"
    )
    u.set_password(self.password)
    u.save()
    self.user = u

  def get_token(self, client, username, password):
    response = client.post(reverse("api:token-list"), { "username": username, "password": password }, format="json")
    self.assertEqual(response.status_code, 201)
  
    j = json.loads(str(response.rendered_content, encoding='utf8'))
    self.assertEqual(j["user"]["username"], username)
  
    return j["key"]

class MiddlewareTestCase(BaseTestCase):
  def test_me_redirection(self):
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION='Token ' + self.get_token(client, self.username, self.password))

    response = client.get(reverse("api:user-detail", args=["me"]), format="json")
    self.assertEqual(response.status_code, 200)

    user_data = json.loads(str(response.rendered_content, encoding='utf8'))
    self.assertEqual(int(user_data["id"]), self.user.id)

  def test_auth_reset(self):
    request = APIRequestFactory().get("/")
    request.user = "asdfasdfasdf"
    request.auth = "asdfasdf"

    id_mw = middleware.ResetAuth(lambda x: x)

    request_p = id_mw(request)
    self.assertEqual(request_p.auth, None)
    self.assertEqual(type(request_p.user), AnonymousUser)

class TokenTestCase(BaseTestCase):
  def test_read_token(self):
    request = APIRequestFactory().get("/")
    request.META["HTTP_AUTHORIZATION"] = "Token " + self.get_token(APIClient(), self.username, self.password)
    tok = models.Token.read_token(request)
    self.assertEqual(self.user.id, tok.user.id)

class UserSerializerTestCase(TestCase):
  def setUp(self):
    self.data = {
      "username": "foo",
      "password": "bar",
      "first_name": "Foo",
      "last_name": "Bar",
      "email": "foo@bar.com"
    }

  def test_creation(self):
    s = serializers.UserSerializer(many=False)
    u = s.create(self.data)
    self.assertEqual(check_password(self.data["password"], u.password), True)

    new_passwd = "ahhhhhh"

    u = s.update(u, { "password": new_passwd })

    self.assertEqual(check_password(new_passwd, u.password), True)

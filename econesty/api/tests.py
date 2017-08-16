from django.test import TestCase, RequestFactory
from django.core.urlresolvers import reverse
from rest_framework.test import APIRequestFactory, APIClient
from django.contrib.auth.hashers import check_password

import json
import uuid

from django.contrib.auth.models import User, AnonymousUser
from . import models
from . import views
from . import serializers
from . import middleware
from . import permissions
from . import mixins
from . import filters


# TODO:
# Test permissions.py
# Test mixins.py
# Test filters.py
# test views.py (custom routes)

# Test models.py -> Custom manager querysets

#
# Abstract
#

class APITestCase(object):
  """
  Runs each test with an APIClient.
  """
  def setUp(self):
    self.client = APIClient()

  def dummy_request(self, auth_token = None):
    r = APIRequestFactory().get("/")
    r.META["HTTP_AUTHORIZATION"] = "Token " + auth_token
    return r

class UserTestCase(APITestCase):
  """
  Runs each test with a new user object.
  """
  def setUp(self):
    super().setUp()
    self.username = str(uuid.uuid4())
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

  def get_token(self):
    """
    This returns an auth token (as in Authorization: Token <this>) for a given 
    username & password combination.
    If there's something wrong, this fails the test case it's running in.
    """
    post_body = {
      "username": self.username,
      "password": self.password
    }
    
    response = self.client.post(reverse("api:token-list"), post_body, format='json')
    self.assertEqual(response.status_code, 201)

    data = str(response.rendered_content, encoding='utf8')

    j = json.loads(data)
    self.assertEqual(j["user"]["username"], post_body["username"])

    return j["key"]

#
# Concrete
#

class MiddlewareTestCase(UserTestCase, TestCase):
  # TODO: test TokenAuth middleware!

  def test_me_redirection(self):
    # First, run the request without credentials. It should fail.
    response = self.client.get(reverse("api:user-detail", args=["me"]), format="json")
    self.assertEqual(response.status_code, 404)

    # Now run the request with credentials.
    self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.get_token())

    response = self.client.get(reverse("api:user-detail", args=["me"]), format="json")
    self.assertEqual(response.status_code, 200)

    user_data = json.loads(str(response.rendered_content, encoding='utf8'))
    self.assertEqual(int(user_data["id"]), self.user.id)

  def test_auth_reset(self):
    # let's make a spoof middleware that returns the request!
    id_mw = middleware.ResetAuth(lambda x: x)

    request = id_mw(self.dummy_request(self.get_token()))
    self.assertIsNone(getattr(request, "auth", ""))
    self.assertIsInstance(getattr(request, "user", ""), AnonymousUser)

  def test_auth_token(self):
    # let's make a spoof middleware that returns the request!
    id_mw = middleware.TokenAuth(lambda x: x)

    request = id_mw(self.dummy_request(self.get_token()))

    self.assertEqual(self.user, request.user)

    auth = getattr(request, "auth", None)
    self.assertIsNotNone(auth)
    self.assertEqual(self.user, getattr(auth, "user", None))

class TokenTestCase(UserTestCase, TestCase):
  def test_read_token(self):
    request = self.dummy_request(self.get_token())
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

class TokenSerializerTestCase(UserTestCase, TestCase):
  def test_creation(self):
    s = serializers.TokenSerializer(many=False)
    t = s.create({
      "username": self.username,
      "password": self.password
    })
    self.assertIsNotNone(t)
    self.assertIsNotNone(t.key)
    self.assertIsNotNone(t.user)
    self.assertEqual(t.user, self.user)

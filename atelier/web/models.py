from django.db import models
from django.utils import timezone

# IMPORTANT: Atelier could be a place for normal people to find where
#            their favorite artists are being shown.

#            New idea: transaction management for art sales

class Appraisal(models.Model):
  value = models.DecimalField(max_digits=11, decimal_places=2)
  value_currency = models.CharField(max_length=3)
  date = models.DateTimeField(default=timezone.now())
  appraiser_name = models.TextField()
  appraiser_phone = models.TextField()
  appraiser_email = models.TextField()
  signature_svg = models.TextField()

class Artwork(models.Model):
  artist_name = models.TextField()
  description = models.TextField()
  media = models.TextField()
  image_url = models.URLField()
  thumb_url = models.URLField()

class Ownership(models.Model):
  start_date = models.DateTimeField(default=timezone.now())
  end_date = models.DateTimeField(default=tiimezone.now())
  artwork = models.ForeignKey(Artwork, on_delete=models.CASCADE)

class Person(models.Model):
  name = models.TextField()
  phone_number = models.CharField(max_length=50)
  address = models.TextField()
  email = models.EmailField()

# Where a piece of artwork resides
class Location(models.Model):
  name = models.TextField()
  phone_number = models.CharField(max_length=50)
  email = models.EmailField()
  address = models.TextField()
  lat = models.DecimalField(max_digits=3, decimal_places=8)
  lon = models.DecimalField(max_digits=3, decimal_places=8)
  from_date = models.DateTimeField(default=timezone.now())
  until_date = models.DateTimeField()

class User(models.Model):
  username = models.TextField()
  password_hash = models.TextField()
  owner = models.ForeignKey(Owner, on_delete=models.RESTRICT) # TODO: check this


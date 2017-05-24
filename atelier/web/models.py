from django.db import models
from django.utils import timezone

# IMPORTANT: Atelier could be a place for normal people to find where
#            their favorite artists are being shown.

class Appraisal(models.Model):
  value = models.DecimalField(max_digits=11, decimal_places=2)
  value_currency = models.CharField(max_length=3)
  date = models.DateTimeField(default=timezone.now())
  appraiser_name = models.TextField()
  appraiser_phone = models.TextField()
  appraiser_email = models.TextField()
  signature_svg = models.TextField()

# This is a piece of art
class Artwork(models.Model):
  media = models.TextField()
  artist_name = models.TextField()
  owner = models.ForeignKey(Owner, on_delete=models.CASCADE) # TODO: make sure this relationship is accurate.
  image_url = models.TextField() # is there a URL field in Django?
  thumb_url = models.TextField() # is there a URL field in Django?

# This is the model representing artwork owners, the "users" of Atelier.
class Owner(models.Model):
  name = models.TextField()
  phone_number = models.CharField(max_length=50)
  address = models.TextField()
  email = models.TextField()
  avatar_url = models.TextField()
  thumb_url = models.TextField()

# Where a
class Location(models.Model):
  owner = models.ForeignKey(Owner, on_delete=models.CASCADE) # TODO: make sure this relationship is accurate
  name = models.TextField()
  phone_number = models.CharField(max_length=50)
  email = models.TextField()
  address = models.TextField()
  lat = models.DecimalField(max_digits=3, decimal_places=8)
  lon = models.DecimalField(max_digits=3, decimal_places=8)
 

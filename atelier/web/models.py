from django.db import models
from django.utils import timezone

# TODO: mark deleted instead of deleting.

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
  artist_name = models.TextField(null=True)
  description = models.TextField(null=True)
  media = models.TextField(null=True) # TODO: should this be done with Django's @choices@ field option?
  image_url = models.URLField()
  thumb_url = models.URLField()

class Ownership(models.Model):
  start_date = models.DateTimeField(default=timezone.now())
  end_date = models.DateTimeField(null=True)
  artwork = models.ForeignKey(Artwork, on_delete=models.CASCADE)

  def is_current(self):
    return self.end_date == None

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

  def is_temporary(self):
    return (self.from_date != None and self.until_date != None)

class User(models.Model):
  ARTIST = "ar"
  CONNOISSEUR = "cn"
  username = models.TextField()
  kind = models.CharField(max_length=2, default=CONNOISSEUR, choices=((ARTIST, "Artist"),(CONNOISSEUR, "Connoisseur")))
  password_hash = models.TextField()
  owner = models.ForeignKey(Owner, on_delete=models.RESTRICT) # TODO: check this

  def check_password(self, password):
    return False

  def is_artist(self):
    return self.kind == self.ARTIST

  def is_connoisseur(self):
    return self.kind == self.CONNOISSEUR

# TODO: this needs to be implemented better so including encrypted data works.
class PaymentMethod(models.Model):
  slug = models.TextField()
  name = models.TextField()

class Transaction(models.Model):
  artwork = models.ForeignKey(Artwork, on_delete=models.CASCADE)
  buyer = models.ForeignKey(User, on_delete=models.CASCADE)
  seller = models.ForeignKey(User, on_delete=models.CASCADE)
  required_witnesses = models.IntegerField(default=0)
  payment_method = models.ForeignKey(PaymentMethod, on_delete=models.CASCADE)
  offer = models.DecimalField(max_digits=11, decimal_places=2)
  offer_currency = models.CharField(max_length=3)

class Witnessing(models.Model):
  witness = models.ForeignKey(User, on_delete=models.CASCADE)
  transaction = models.ForeignKey(Transaction, on_delete=models.CASCADE)


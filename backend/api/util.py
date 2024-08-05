from rest_framework.fields import BooleanField

def truthy(s):
  return s in BooleanField.TRUE_VALUES

def falsey(s):
  return s in BooleanField.FALSE_VALUES
  

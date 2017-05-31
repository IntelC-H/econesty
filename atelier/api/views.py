from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader

# Create your views here.

def index(request):
  return HttpResponse("index page")

def transaction(request):
  template = loader.get_template('web/transaction.html')
  return HttpResponse(template.render({}, request))


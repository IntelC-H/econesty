from django.shortcuts import render

def spa_page(request):
  return render(request, 'web/spa_page.html', {}) 

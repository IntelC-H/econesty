from rest_framework import pagination
from rest_framework.response import Response

class EconestyPagination(pagination.PageNumberPagination):
  page_size = 10
  page_query_param = "page"
  page_size_query_param = "page_size"
  max_page_size = 100
  last_page_strings = ('last', '-1',)

  def get_next_page_num(self):
    if not self.page.has_next():
      return None
    return self.page.next_page_number()

  def get_previous_page_num(self):
    if not self.page.has_previous():
      return None
    return self.page.previous_page_number()

  def get_paginated_response(self, data):
    return Response({
      'next': self.get_next_page_num(),
      'previous': self.get_previous_page_num(),
      'count': self.page.paginator.count,
      'results': data
    })

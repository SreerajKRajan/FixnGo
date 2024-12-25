# service/urls.py
from django.urls import path
from .views import ServiceListCreateAPIView, ServiceDetailAPIView

urlpatterns = [
    path('services/', ServiceListCreateAPIView.as_view(), name='service-list-create'),
    path('services/<int:pk>/', ServiceDetailAPIView.as_view(), name='service-detail'),
]

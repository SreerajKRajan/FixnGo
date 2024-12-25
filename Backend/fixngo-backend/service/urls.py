# service/urls.py
from django.urls import path
from .views import ServiceListCreateAPIView, ServiceDetailAPIView, AdminApproveWorkshopServiceAPIView

urlpatterns = [
    path('services/', ServiceListCreateAPIView.as_view(), name='service-list-create'),
    path('services/<int:pk>/', ServiceDetailAPIView.as_view(), name='service-detail'),
    path('services/<int:pk>/', ServiceDetailAPIView.as_view(), name='service-detail'),
    path('workshop/<int:pk>/approve/', AdminApproveWorkshopServiceAPIView.as_view(), name='admin-service-approve'),
    path('workshop/<int:pk>/reject/', AdminApproveWorkshopServiceAPIView.as_view(), name='admin-service-reject'),
]

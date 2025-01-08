# service/urls.py
from django.urls import path
from .views import ServiceListCreateAPIView, ServiceDetailAPIView, AdminApproveWorkshopServiceAPIView, PendingWorkshopServicesAPIView, WorkshopsWithPendingServicesAPIView

urlpatterns = [
    path('services/', ServiceListCreateAPIView.as_view(), name='service-list-create'),
    path('services/<int:pk>/', ServiceDetailAPIView.as_view(), name='service-detail'),
    path('workshop/<int:pk>/approve/', AdminApproveWorkshopServiceAPIView.as_view(), name='admin-service-approve'),
    path('workshop/<int:pk>/reject/', AdminApproveWorkshopServiceAPIView.as_view(), name='admin-service-reject'),
    path('workshop-services/pending/<int:workshop_id>/', PendingWorkshopServicesAPIView.as_view(), name='pending-workshop-services'),
    path('workshops-with-pending-services/', WorkshopsWithPendingServicesAPIView.as_view(), name='workshops-with-pending-services'),
]

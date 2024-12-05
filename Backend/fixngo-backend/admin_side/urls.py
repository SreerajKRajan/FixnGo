from django.urls import path
from .views import ApproveWorkshopView, AdminLoginView

urlpatterns = [
    path('approve-workshop/', ApproveWorkshopView.as_view(), name='approve_workshop'),
    path('login/', AdminLoginView.as_view(), name='admin_login'),
]

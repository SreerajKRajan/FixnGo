from django.urls import path
from .views import ApproveWorkshopView, AdminLoginView, WorkshopListView, RejectWorkhsopView

urlpatterns = [
    path('approve-workshop/', ApproveWorkshopView.as_view(), name='approve_workshop'),
    path('reject-workshop/', RejectWorkhsopView.as_view(), name='reject_workshop'),
    path('workshop-list/', WorkshopListView.as_view(), name='workshop_list'),
    path('login/', AdminLoginView.as_view(), name='admin_login'),
]

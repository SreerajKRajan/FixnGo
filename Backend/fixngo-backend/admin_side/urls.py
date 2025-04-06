from django.urls import path
from .views import ApproveWorkshopView, AdminLoginView, WorkshopListView, RejectWorkhsopView, AdminLogoutView, UserListView, ToggleUserStatusView, ToggleWorkshopStatusView, DashboardAPIView

urlpatterns = [
    path('dashboard/', DashboardAPIView.as_view(), name='admin-dashboard'),
    path('approve-workshop/', ApproveWorkshopView.as_view(), name='approve_workshop'),
    path('reject-workshop/', RejectWorkhsopView.as_view(), name='reject_workshop'),
    path('workshop-list/', WorkshopListView.as_view(), name='workshop_list'),
    path('user-list/', UserListView.as_view(), name='user_list'),
    path('toggle-user-status/', ToggleUserStatusView.as_view(), name='toggle-user-status'),
    path('toggle-workshop-status/', ToggleWorkshopStatusView.as_view(), name='toggle-workshop-status'),
    path('login/', AdminLoginView.as_view(), name='admin_login'),
    path('logout/', AdminLogoutView.as_view(), name='admin_logout'),
]

from django.urls import path
from .views import WorkshopSignupView, WorkshopOtpVerificationView, WorkshopLoginView, WorkshopLogoutView

urlpatterns = [
    path('signup/', WorkshopSignupView.as_view(), name='workshop-signup'),
    path('otp_verification/', WorkshopOtpVerificationView.as_view(), name='workshop-otp-verification'),
    path('login/', WorkshopLoginView.as_view(), name='workshop-login'),
    path('logout/', WorkshopLogoutView.as_view(), name='workshop-logout'),
]

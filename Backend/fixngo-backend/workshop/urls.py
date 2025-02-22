from django.urls import path
from .views import (
    WorkshopSignupView, 
    WorkshopOtpVerificationView, 
    WorkshopLoginView, 
    WorkshopLogoutView, 
    WorkshopServiceCreateAPIView, 
    WorkshopServiceListAPIView, 
    WorkshopServiceAvailabilityUpdateAPIView, 
    WorkshopForgotPasswordView, 
    WorkshopResetPasswordView,
    WorkshopServiceRequestsListAPIView,
    UpdateServiceRequestStatusAPIView,
    SendPaymentRequestView,
)

urlpatterns = [
    path('signup/', WorkshopSignupView.as_view(), name='workshop-signup'),
    path('otp_verification/', WorkshopOtpVerificationView.as_view(), name='workshop-otp-verification'),
    path('login/', WorkshopLoginView.as_view(), name='workshop-login'),
    path('logout/', WorkshopLogoutView.as_view(), name='workshop-logout'),
    path('forgot-password/', WorkshopForgotPasswordView.as_view(), name='workshop-forgot-password'),
    path('reset-password/<uidb64>/<token>/', WorkshopResetPasswordView.as_view(), name='workshop-reset-password'),
    
    path('services/', WorkshopServiceCreateAPIView.as_view(), name='workshop-service-create'),
    path('services/list/', WorkshopServiceListAPIView.as_view(), name='workshop-service-list'),
    path('services/<int:pk>/availability/', WorkshopServiceAvailabilityUpdateAPIView.as_view(), name='service-availability-update'),
    path('service-requests/list/', WorkshopServiceRequestsListAPIView.as_view(), name='service-requests-list'),
    path('service-requests/<int:request_id>/update/', UpdateServiceRequestStatusAPIView.as_view(), name='service-requests-update'),
    path('send-payment-request/', SendPaymentRequestView.as_view(), name='send-payment-request'),

]

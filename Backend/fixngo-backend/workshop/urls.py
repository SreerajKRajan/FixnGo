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
    WorkshopDashboardAPIView,
    ServiceRequestTrendsAPIView,
    RecentActivityAPIView,
    WorkshopServicesAPIView,
    WorkshopRatingDistributionAPIView,
    WorkshopProfileView,
    WorkshopChatThreadsAPIView,
    WorkshopChatHistoryAPIView,
    WorkshopMarkMessagesReadView,
    WorkshopVerifyEmailOTPView,
    WorkshopResendEmailOTPView,
)

urlpatterns = [
    path('signup/', WorkshopSignupView.as_view(), name='workshop-signup'),
    path('otp_verification/', WorkshopOtpVerificationView.as_view(), name='workshop-otp-verification'),
    path('login/', WorkshopLoginView.as_view(), name='workshop-login'),
    path('logout/', WorkshopLogoutView.as_view(), name='workshop-logout'),
    path('forgot-password/', WorkshopForgotPasswordView.as_view(), name='workshop-forgot-password'),
    path('reset-password/<uidb64>/<token>/', WorkshopResetPasswordView.as_view(), name='workshop-reset-password'),
    path('profile/', WorkshopProfileView.as_view(), name='workshop-profile'),
    path('verify-email-otp/', WorkshopVerifyEmailOTPView.as_view(), name='workshop-verify-email-otp'),
    path('resend-email-otp/', WorkshopResendEmailOTPView.as_view(), name='workshop-resend-email-otp'),
    
    path('services/', WorkshopServiceCreateAPIView.as_view(), name='workshop-service-create'),
    path('services/list/', WorkshopServiceListAPIView.as_view(), name='workshop-service-list'),
    path('services/<int:pk>/availability/', WorkshopServiceAvailabilityUpdateAPIView.as_view(), name='service-availability-update'),
    path('service-requests/list/', WorkshopServiceRequestsListAPIView.as_view(), name='service-requests-list'),
    path('service-requests/<int:request_id>/update/', UpdateServiceRequestStatusAPIView.as_view(), name='service-requests-update'),
    path('send-payment-request/', SendPaymentRequestView.as_view(), name='send-payment-request'),
    
    path('dashboard/', WorkshopDashboardAPIView.as_view(), name='workshop-dashboard'),
    path('dashboard/service-requests/trends/', ServiceRequestTrendsAPIView.as_view(), name='service-request-trends'),
    path('dashboard/recent-activity/', RecentActivityAPIView.as_view(), name='recent-activity'),
    path('dashboard/services/', WorkshopServicesAPIView.as_view(), name='workshop-services'),
    path('dashboard/rating-distribution/', WorkshopRatingDistributionAPIView.as_view(), name='rating-distribution'),
    
    path('chat/threads/', WorkshopChatThreadsAPIView.as_view(), name='workshop-chat-threads'),
    path('chat/history/<str:user_id>/', WorkshopChatHistoryAPIView.as_view(), name='workshop-chat-history'),
    path('chat/mark-read/<str:room_id>/', WorkshopMarkMessagesReadView.as_view(), name='workshop-mark-messages-read'),


]


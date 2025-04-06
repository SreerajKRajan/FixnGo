from django.urls import path
from .views import (
    UserSignupView, 
    UserLoginView, 
    UserLogoutView, 
    OtpVerificationView, 
    UserProfileView, 
    UserForgotPasswordView, 
    ResetPasswordView, 
    NearbyWorkshopsView, 
    UserWorkshopsListView, 
    UserWorkshopDetailView, 
    ServiceRequestAPIView,
    WorkshopPaymentRequests,
    CreateOrderAPIView,
    VerifyPaymentAPIView,
    google_signup,
)

urlpatterns = [
    path("google-signup/", google_signup, name="google-signup"),
    path('signup/', UserSignupView.as_view(), name='user-signup'),
    path('otp_verification/', OtpVerificationView.as_view(), name='user-otp-verification'),
    path('login/', UserLoginView.as_view(), name='user-login'),
    path('logout/', UserLogoutView.as_view(), name='user-logout'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('workshops/nearby/', NearbyWorkshopsView.as_view(), name='nearby-workshops'),
    path('forgot-password/', UserForgotPasswordView.as_view(), name='user-forgot-password'),
    path('reset-password/<uidb64>/<token>/', ResetPasswordView.as_view(), name='reset-password'),
    path('workshops/list/', UserWorkshopsListView.as_view(), name='user-workshops-list'),
    path('workshops/<int:id>/', UserWorkshopDetailView.as_view(), name='user-workshops-details'),
    path('workshops/<int:workshop_id>/services/<int:service_id>/request/', ServiceRequestAPIView.as_view(), name='user-request-service'),
    path('workshops/payment-requests/', WorkshopPaymentRequests.as_view(), name='user-workshop-payment-request'),
    
    path('create-order/', CreateOrderAPIView.as_view(), name='create_order'),
    path('verify-payment/', VerifyPaymentAPIView.as_view(), name='verify_payment'),
]

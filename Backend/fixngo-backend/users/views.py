from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView, RetrieveAPIView
from .serializers import UserSignupSerializer, UserLoginSerializer, UserSerializer, ServiceRequestSerializer, PaymentSerializer
from rest_framework_simplejwt.tokens import RefreshToken
import random
from django.utils import timezone
from .models import User, Otp, ServiceRequest, Payment
from datetime import timedelta
from utils.s3_utils import upload_to_s3
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from math import radians, sin, cos, sqrt, atan2
from django.http import JsonResponse
from workshop.models import Workshop, WorkshopService
from .tasks import send_otp_email
from django.utils.http import urlsafe_base64_decode
from workshop.utils import haversine
from workshop.serializers import WorkshopSerializer, WorkshopServiceSerializer
from datetime import datetime
from itertools import chain
import razorpay
from django.views.decorators.csrf import csrf_exempt
import json
from django.shortcuts import get_object_or_404
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from google.auth.transport import requests
from google.oauth2 import id_token
from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view
from rest_framework import status
from django.conf import settings
from utils.s3_utils import get_s3_file_url
from math import radians, cos
from rest_framework.pagination import PageNumberPagination
from django.db.models import F, Q
from django.db.models.expressions import RawSQL
import math

# Create your views here.

@api_view(["POST"])
def google_signup(request):
    try:
        # Get the token from the request
        token = request.data.get("credential")
        
        # Verify the token
        idinfo = id_token.verify_oauth2_token(
            token, 
            requests.Request(), 
            settings.GOOGLE_CLIENT_ID
        )
        
        # Extract user information
        email = idinfo.get('email')
        username = idinfo.get('name')
        google_id = idinfo.get('sub')
        profile_image_url = idinfo.get('picture', '')

        # Check if user exists
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'username': username, 
                'google_id': google_id, 
                'profile_image_url': profile_image_url
            }
        )

        # If existing user, update google_id if not set
        if not created and not user.google_id:
            user.google_id = google_id
            user.save()

        # Generate tokens (assuming you're using JWT)
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)

        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email
            },
            'message': 'Google Signup Successful'
        }, status=status.HTTP_200_OK)

    except ValueError as e:
        # Invalid token
        return Response(
            {'error': 'Invalid Google token'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_400_BAD_REQUEST
        )


class UserSignupView(APIView):
    def post(self, request):
        serializer = UserSignupSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save(is_verified=False)

            otp_code = random.randint(1000, 9999)
            otp = Otp.objects.create(user=user, otp_code=otp_code)

            subject = "Your FixnGo OTP Code"
            text_content = f"""
            Hello {user.username},

            Thank you for signing up with FixnGo! 

            Your OTP code is: {otp_code}
            It will expire in 10 minutes. Please use this code to complete your registration.

            If you didn’t request this email, please ignore it.

            Best regards,  
            The FixnGo Team
            """

            html_content = f"""
            <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <div style="max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
                        <h2 style="color: #4CAF50; text-align: center;">Welcome to FixnGo!</h2>
                        <p>Hello <strong>{user.username}</strong>,</p>
                        <p>Thank you for signing up with <strong>FixnGo</strong>!</p>
                        <p style="font-size: 18px;">Your OTP code is:</p>
                        <div style="text-align: center; margin: 20px 0;">
                            <span style="
                                display: inline-block;
                                font-size: 24px;
                                font-weight: bold;
                                color: #ffffff;
                                background-color: #4CAF50;
                                padding: 10px 20px;
                                border-radius: 5px;
                                border: 1px solid #3e8e41;
                            ">
                                {otp_code}
                            </span>
                        </div>
                        <p style="color: #777;">This OTP is valid for <strong>10 minutes</strong>.</p>
                        <hr>
                        <p>If you didn’t request this email, please ignore it.</p>
                        <p>Best regards,</p>
                        <p style="font-weight: bold;">The FixnGo Team</p>
                    </div>
                </body>
            </html>
            """

            # Call the Celery task for sending the email
            send_otp_email.delay(subject, text_content, html_content, user.email)

            return Response({"message": "User created successfully. An OTP has been sent to your email for verification.", "email": user.email}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class OtpVerificationView(APIView):
    def post(self, request):
        print("datafromfront", request.data)
        email = request.data.get('email')
        otp_code = request.data.get('otp')

        user = User.objects.filter(email=email).first()
        if not user:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        otp_entry = Otp.objects.filter(user=user).order_by('-otp_created_at').first()
        
        if otp_entry and int(otp_entry.otp_code) == int(otp_code):
            if timezone.now() < otp_entry.otp_created_at + timedelta(minutes=10):
                user.is_verified = True
                user.save()
                otp_entry.delete()
                return Response({"message": "OTP verified successfully. You can now log in."}, status=status.HTTP_200_OK)
            else:
                return Response({"message": "OTP has expired"}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"error": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST)



class UserLoginView(APIView):
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data["user"]

            if not user.is_verified:
               return Response({"error": "User is not verified. Please verify your email OTP to proceed with login."}, status=status.HTTP_403_FORBIDDEN)
            
            refresh = RefreshToken.for_user(user)
            return Response({
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "message": "Login successful",
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "username": user.username,
                }
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class UserLogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh_token')
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Logout successful"}, status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        
class UserForgotPasswordView(APIView):
    def post(self, request):
        email = request.data.get("email")
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "User with this email does not exist."}, status=status.HTTP_404_NOT_FOUND)

        # Generate password reset token and URL
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        reset_url = f"{request.build_absolute_uri('http://localhost:5173/reset-password/')}{uid}/{token}/"

        # Email content
        subject = "FixnGo Password Reset Request"
        text_content = f"""
        Hello {user.username},

        We received a request to reset your password for your FixnGo account.

        You can reset your password using the link below:
        {reset_url}

        If you did not request this, please ignore this email.

        Best regards,
        The FixnGo Team
        """
        html_content = f"""
        <html>
            <body>
                <h2>Password Reset Request</h2>
                <p>Hello <strong>{user.username}</strong>,</p>
                <p>We received a request to reset your password for your FixnGo account.</p>
                <p>You can reset your password using the link below:</p>
                <a href="{reset_url}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
                <p>If you did not request this, please ignore this email.</p>
                <p>Best regards,</p>
                <p>The FixnGo Team</p>
            </body>
        </html>
        """

        # Trigger Celery task
        send_otp_email.delay(subject, text_content, html_content, user.email)

        return Response({"message": "Password reset email sent successfully."}, status=status.HTTP_200_OK)
    
        
class ResetPasswordView(APIView):
    def post(self, request, uidb64, token):
        try:
            # Decode the user ID
            uid = urlsafe_base64_decode(uidb64).decode()
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({"error": "Invalid user ID."}, status=status.HTTP_400_BAD_REQUEST)

        # Validate the token
        if not default_token_generator.check_token(user, token):
            return Response({"error": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)

        # Get the new password from the request
        new_password = request.data.get("password")
        confirm_password = request.data.get("confirm_password")

        if not new_password or not confirm_password:
            return Response({"error": "Password fields are required."}, status=status.HTTP_400_BAD_REQUEST)

        if new_password != confirm_password:
            return Response({"error": "Passwords do not match."}, status=status.HTTP_400_BAD_REQUEST)

        # Update the password
        user.set_password(new_password)
        user.save()

        return Response({"message": "Password reset successfully."}, status=status.HTTP_200_OK)

class UserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data)

    def put(self, request):
        user = request.user

        # Handle profile image upload
        if 'profile_image' in request.FILES:
            profile_image = request.FILES['profile_image']

            # Validate it's an image
            if not profile_image.content_type.startswith('image/'):
                return Response({"error": "Only image files are allowed."}, status=400)

            try:
                s3_file_path = f"media/profile_images/{user.id}/"
                s3_key = upload_to_s3(profile_image, s3_file_path)
                image_url = get_s3_file_url(profile_image.name, s3_file_path)

                # Save the full S3 image URL to user model
                user.profile_image_url = image_url
                user.save()
            except Exception as e:
                return Response({"error": f"Failed to upload image: {str(e)}"}, status=500)

        # Update other fields
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Profile updated successfully!"})

        return Response(serializer.errors, status=400)




class NearbyWorkshopsView(APIView):
     def get(self, request):
         user_lat = request.GET.get('latitude')
         user_lon = request.GET.get('longitude')
         print(f"lat {user_lat} and lon {user_lon}")
         
 
         if not user_lat or not user_lon:
             return Response({"error": "Latitude or longitude are required."}, status=400)
         
 
         try:
             # Get user's latitude and longitude from query parameters
             user_lat = float(user_lat)
             user_lon = float(user_lon)
 
         except (TypeError, ValueError):
             return Response({"error": "Invalid latitude or longitude"}, status=400)
 
         # Define a radius (in km)
         radius_km = 10
 
         # Approximate calculation for bounding box (more efficient)
         lat_delta = radius_km / 111  # ~111 km per degree of latitude
         lon_delta = radius_km / (111 * cos(radians(user_lat)))
 
         min_lat = user_lat - lat_delta
         max_lat = user_lat + lat_delta
         min_lon = user_lon - lon_delta
         max_lon = user_lon + lon_delta
 
         # Filter in DB using bounding box
         workshops = Workshop.objects.filter(
             is_active=True,
             is_approved=True,
             latitude__range=(min_lat, max_lat),
             longitude__range=(min_lon, max_lon)
         )
 
         # Calculate distances using the Haversine formula
         nearby_workshops = []
         for workshop in workshops:
             if workshop.latitude is not None and workshop.longitude is not None:
                 try:
                     distance = haversine(user_lat, user_lon, workshop.latitude, workshop.longitude)
                     if distance <= radius_km:  # Only include if truly within radius
                         nearby_workshops.append({
                             "id": workshop.id,
                             "name": workshop.name,
                             "email": workshop.email,
                             "phone": workshop.phone,
                             "location": workshop.location,
                             "latitude": workshop.latitude,
                             "longitude": workshop.longitude,
                             "distance": round(distance, 2),
                             "document": workshop.document.url if workshop.document else None,
                         })
                 except ValueError:
                     continue
 
         # Sort workshops by distance within 10km
         sorted_workshops = sorted(nearby_workshops, key=lambda x: x["distance"])
 
         return Response(sorted_workshops, status=200)


class UserWorkshopPagination(PageNumberPagination):
    page_size = 6  # Show 6 items per page
    page_size_query_param = 'page_size'
    max_page_size = 100

class UserWorkshopsListView(ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = WorkshopSerializer
    pagination_class = UserWorkshopPagination
    
    def get_queryset(self):
        # Base queryset
        queryset = Workshop.objects.filter(
            is_active=True, 
            is_approved=True, 
            approval_status="approved"
        )
       
        # Handle search parameter
        search_query = self.request.query_params.get('search', None)
        if search_query:
            # Combine fields for search
            queryset = queryset.filter(
                Q(name__icontains=search_query) | 
                Q(location__icontains=search_query)
            )
       
        # Get sort parameter
        sort_param = self.request.query_params.get('sort', None)
        
        # Handle custom sorting options
        if sort_param == 'name':
            return queryset.order_by('name')
        elif sort_param == '-created_at':
            return queryset.order_by('-created_at')
        
        return queryset
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        
        # Handle distance-based sorting if needed
        sort_param = self.request.query_params.get('sort', None)
        user_lat = self.request.query_params.get('latitude')
        user_lng = self.request.query_params.get('longitude')
        
        # If sorting by distance and coordinates are provided
        if sort_param == 'distance' and user_lat and user_lng:
            try:
                user_lat = float(user_lat)
                user_lng = float(user_lng)
                
                # Filter out workshops without coordinates
                valid_workshops = []
                for workshop in queryset:
                    if workshop.latitude is None or workshop.longitude is None:
                        continue
                        
                    try:
                        # Calculate distance using Haversine formula from utils
                        distance = haversine(user_lat, user_lng, workshop.latitude, workshop.longitude)
                        # Create a dictionary with workshop data and distance
                        workshop_dict = self.get_serializer(workshop).data
                        workshop_dict['distance'] = round(distance, 2)
                        valid_workshops.append(workshop_dict)
                    except ValueError:
                        continue
                
                # Sort by distance
                sorted_workshops = sorted(valid_workshops, key=lambda x: x["distance"])
                
                # Handle pagination manually
                page = self.paginate_queryset(sorted_workshops)
                if page is not None:
                    return self.get_paginated_response(page)
                    
                return Response(sorted_workshops)
            except (ValueError, TypeError):
                pass
        
        # If not sorting by distance or coordinates are invalid, use regular pagination
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
            
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
class UserWorkshopDetailView(RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Workshop.objects.filter(is_active=True, is_approved=True, approval_status="approved")
    serializer_class = WorkshopSerializer
    lookup_field = "id"

    def retrieve(self, request, *args, **kwargs):
        workshop = self.get_object()
        workshop_data = self.get_serializer(workshop).data

        # Fetch workshop services approved
        workshop_services_approved = WorkshopService.objects.filter(
            workshop=workshop, service_type="workshop", is_approved=True, is_available=True
        ).order_by("-created_at")
        workshop_services_approved_serialized = WorkshopServiceSerializer(workshop_services_approved, many=True).data

        # Fetch admin services added
        admin_services_added = WorkshopService.objects.filter(
            workshop=workshop, service_type="admin", is_available=True
        ).order_by("-created_at")
        admin_services_added_serialized = WorkshopServiceSerializer(admin_services_added, many=True).data

        # Combine and sort services
        combined_services = sorted(
            chain(workshop_services_approved_serialized, admin_services_added_serialized),
            key=lambda service: datetime.strptime(service['created_at'], '%Y-%m-%dT%H:%M:%S.%fZ'),
            reverse=True
        )

        return Response({
            "workshop": workshop_data,
            "services": combined_services
        })
        
        
class ServiceRequestAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        workshop_id = kwargs.get('workshop_id')
        service_id = kwargs.get('service_id')
        
        try:
            workshop = Workshop.objects.get(id=workshop_id)
            workshop_service = WorkshopService.objects.get(id=service_id)
        except (Workshop.DoesNotExist, WorkshopService.DoesNotExist):
            return Response({"detail": "Workshop or WorkshopService not found."}, status=status.HTTP_404_NOT_FOUND)
        
        data = request.data.copy()
        data['user'] = request.user.id
        data['workshop'] = workshop.id
        data['workshop_service'] = workshop_service.id
         
        serializer = ServiceRequestSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    
class WorkshopPaymentRequests(ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = ServiceRequest.objects.filter(status='IN_PROGRESS').order_by('-created_at')
    serializer_class = ServiceRequestSerializer
    

# Initialize Razorpay Client
client = razorpay.Client(auth=("rzp_test_Vunq6st6Uq4zxb", "KnmtN51B9ANVS78ly2ZxGWoI"))


class CreateOrderAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            print("dataaa: ", data)
            user_id = request.user.id  # Use the authenticated user's ID
            service_request_id = data.get("service_request_id")
            amount = data.get("amount")  # Amount in paise

            if not all([user_id, service_request_id, amount]):
                return Response({"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)

            service_request = get_object_or_404(ServiceRequest, id=service_request_id)

            # Create Razorpay Order
            order = client.order.create({
                "amount": int(amount),
                "currency": "INR",
                "payment_capture": 1
            })

            # Save payment record in the database
            Payment.objects.create(
                user_id=user_id,
                service_request=service_request,
                razorpay_order_id=order["id"],
                amount=float(amount) / 100,  # Store in rupees
                status="PENDING",
            )

            return Response({"order_id": order["id"]}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class VerifyPaymentAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        """
        Verify Razorpay payment and update the Payment model.
        """
        try:
            data = request.data
            razorpay_order_id = data.get("razorpay_order_id")
            razorpay_payment_id = data.get("razorpay_payment_id")
            razorpay_signature = data.get("razorpay_signature")

            if not all([razorpay_order_id, razorpay_payment_id, razorpay_signature]):
                return Response({"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)

            payment = get_object_or_404(Payment, razorpay_order_id=razorpay_order_id)

            # Verify the payment signature
            client.utility.verify_payment_signature({
                "razorpay_order_id": razorpay_order_id,
                "razorpay_payment_id": razorpay_payment_id,
                "razorpay_signature": razorpay_signature,
            })

            # Payment is verified
            payment.razorpay_payment_id = razorpay_payment_id
            payment.razorpay_signature = razorpay_signature
            payment.status = "SUCCESS"
            payment.save()
            
            # Remove the service request associated with this payment
            service_request = payment.service_request
            service_request.status = "COMPLETED"
            service_request.payment_status = "PAID"
            service_request.save()

            return Response({"message": "Payment verified successfully."}, status=status.HTTP_200_OK)
        except Exception as e:
            # Update payment status to FAILED if an error occurs
            if 'payment' in locals():
                payment.status = "FAILED"
                payment.save()
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class UserServiceRequestsHistoryView(ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ServiceRequestSerializer
    pagination_
    
    def get_queryset(self):
        user = self.request.user
        return ServiceRequest.objects.filter(user=user).order_by('-created_at')


class UserPaymentsHistoryView(ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = PaymentSerializer
    
    def get_queryset(self):
        user = self.request.user
        # Use select_related to fetch related objects in a single query
        return Payment.objects.filter(user=user).order_by('-created_at').select_related(
            'service_request', 
            'service_request__workshop', 
            'service_request__workshop_service'
        )
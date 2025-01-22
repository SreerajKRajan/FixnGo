from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView, RetrieveAPIView
from .serializers import UserSignupSerializer, UserLoginSerializer, UserSerializer, ServiceRequestSerializer
from rest_framework_simplejwt.tokens import RefreshToken
import random
from django.utils import timezone
from .models import User, Otp
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



# Create your views here.

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
        if 'profile_image' in request.FILES:
            profile_image = request.FILES['profile_image']
            user = request.user
    
            try:
                s3_file_path = f"media/profile_images/{user.id}/"
                image_url = upload_to_s3(profile_image, s3_file_path)
    
                # Save the S3 URL to the user's profile
                user.profile_image_url = image_url
                user.save()
            except Exception as e:
                return Response({"error": f"Failed to upload image: {str(e)}"}, status=500)
    
        serializer = UserSerializer(request.user, data=request.data, partial=True)
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

        # Fetch all workshops
        workshops = Workshop.objects.filter(is_active=True, is_approved=True)

        # Calculate distances using the Haversine formula
        workshop_distances = []
        for workshop in workshops:
            if workshop.latitude is None or workshop.longitude is None:
                continue
            try:
                distance = haversine(user_lat, user_lon, workshop.latitude, workshop.longitude)
                workshop_distances.append({
                    "name": workshop.name,
                    "email": workshop.email,
                    "phone": workshop.phone,
                    "location": workshop.location,
                    "latitude": workshop.latitude,
                    "longitude": workshop.longitude,
                    "distance": round(distance, 2),  # Round distance to 2 decimal places
                })
            except ValueError:
                continue

        # Sort workshops by distance and limit to nearest 10
        sorted_workshops = sorted(workshop_distances, key=lambda x: x["distance"])[:10]

        return Response(sorted_workshops, status=200)

class UserWorkshopsListView(ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Workshop.objects.filter(is_active=True, is_approved=True, approval_status="approved")
    serializer_class = WorkshopSerializer
    
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
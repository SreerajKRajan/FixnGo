from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import UserSignupSerializer, UserLoginSerializer, UserSerializer
from rest_framework_simplejwt.tokens import RefreshToken
import random
from django.core.mail import EmailMultiAlternatives
from django.utils import timezone
from .models import User, Otp
from datetime import timedelta
import boto3
from utils.s3_utils import upload_to_s3


# Create your views here.

class UserSignupView(APIView):
    def post(self, request):
        serializer = UserSignupSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save(is_verified=False)

            otp_code = random.randint(1000, 9999)
            otp = Otp.objects.create(user=user,otp_code=otp_code)

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

            # Create email message
            email = EmailMultiAlternatives(
                subject=subject,
                body=text_content,  # Plain text content as fallback
                from_email="FixnGo Team <sreerajkrajan03@gmail.com>",
                to=[user.email],  # Recipient's email
            )

            # Attach HTML content
            email.attach_alternative(html_content, "text/html")
            email.send()
            
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




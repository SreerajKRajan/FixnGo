from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import UserSignupSerializer, UserLoginSerializer
from rest_framework_simplejwt.tokens import RefreshToken
import random
from django.core.mail import send_mail
from django.utils import timezone
from .models import User, Otp
from datetime import timedelta


# Create your views here.

class UserSignupView(APIView):
    def post(self, request):
        serializer = UserSignupSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save(is_verified=False)

            otp_code = random.randint(1000, 9999)
            otp = Otp.objects.create(user=user,otp_code=otp_code)

            send_mail(
                'Your otp code',
                f'Your otp code is {otp_code}. It will expire in 10 minutes,',
                'sreerajkrajan03@gmail.com',
                [user.email],
                fail_silently=False,
            )
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
    def post(sef, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data["user"]

            if not user.is_verified:
               return Response({"error": "User is not verified. Please verify your email OTP to proceed with login."}, status=status.HTTP_403_FORBIDDEN)
            
            refresh = RefreshToken.for_user(user)
            return Response({
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "message": "Login successful"
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class UserLogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Logout successful"}, status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


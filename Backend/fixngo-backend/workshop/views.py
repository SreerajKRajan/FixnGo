from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import WorkshopSignupSerializer, WorkshopLoginSerializer, WorkshopServiceSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Workshop, WorkshopOtp, WorkshopService
from datetime import timedelta
from django.utils import timezone
import random
from django.core.mail import EmailMultiAlternatives
from .tokens import WorkshopToken
from utils.s3_utils import upload_to_s3
from .authentication import WorkshopJWTAuthentication
from .permissions import IsWorkshopUser
from service.models import Service
from itertools import chain
from service.serializers import ServiceSerializer


class WorkshopSignupView(APIView):
    def post(self, request):
        serializer = WorkshopSignupSerializer(data=request.data)
        if serializer.is_valid():
            validated_data = serializer.validated_data
            document = validated_data.get('document')
            if document:
                try:
                    # Define S3 path for documents
                    s3_file_path = f"media/workshop_documents/{validated_data['email']}/"
                    document_url = upload_to_s3(document, s3_file_path)
                    
                    # Replace the local document path with the S3 URL
                    validated_data['document'] = document_url
                except Exception as e:
                    return Response({"error": f"Failed to upload document: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Save the workshop instance with the S3 document URL
            workshop = serializer.save()

            otp_code = random.randint(1000, 9999)
            WorkshopOtp.objects.create(workshop=workshop, otp_code=otp_code)

            # Email content (same as your existing implementation)
            subject = "Your FixnGo Workshop OTP Code"
            text_content = f"""
            Hello {workshop.name},

            Thank you for registering your workshop with FixnGo!

            Your OTP code is: {otp_code}
            It will expire in 10 minutes. Please use this code to complete your registration.

            Please wait for admin approval after verifying your OTP.

            If you didn’t request this email, please ignore it.

            Best regards,  
            The FixnGo Team
            """

            html_content = f"""
            <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <div style="max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
                        <h2 style="color: #4CAF50; text-align: center;">Welcome to FixnGo!</h2>
                        <p>Hello <strong>{workshop.name}</strong>,</p>
                        <p>Thank you for registering your workshop with <strong>FixnGo</strong>!</p>
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
                        <p>Please wait for admin approval after verifying your OTP.</p>
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
                to=[workshop.email],  # Recipient's email
            )

            # Attach HTML content
            email.attach_alternative(html_content, "text/html")
            email.send()

            return Response({
                "message": "Workshop created successfully. An OTP has been sent to your email for verification. "
                           "Please wait for admin approval after verifying your OTP.",
                "email": workshop.email,
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




class WorkshopOtpVerificationView(APIView):
    def post(self, request):
        email = request.data.get('email')
        otp_code = request.data.get('otp')

        workshop = Workshop.objects.filter(email=email).first()
        if not workshop:
            return Response({"error": "Workshop not found"}, status=status.HTTP_404_NOT_FOUND)

        otp_entry = WorkshopOtp.objects.filter(workshop=workshop).order_by('-otp_created_at').first()
        
        if otp_entry and int(otp_entry.otp_code) == int(otp_code):
            if timezone.now() < otp_entry.otp_created_at + timedelta(minutes=10):
                workshop.is_verified = True
                workshop.save()
                otp_entry.delete()
                return Response({"message": "OTP verified successfully."
                                 "Your account is awaiting admin approval."
                                 }, status=status.HTTP_200_OK)
            else:
                return Response({"message": "OTP has expired"}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({"error": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST)


class WorkshopLoginView(APIView):
    def post(self, request):
        serializer = WorkshopLoginSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data["email"]
            password = serializer.validated_data["password"]
            workshop = Workshop.objects.filter(email=email).first()
            if workshop and workshop.check_password(password):
                if not workshop.is_verified:
                    return Response({"message": "Workshop is not verified."}, status=status.HTTP_403_FORBIDDEN)
                if not workshop.is_approved:
                    rejection_message = (
                        f"Your account was not approved. Reason: {workshop.rejection_reason}"
                        if workshop.rejection_reason else
                        "Your account is awaiting admin approval."
                    )
                    return Response(
                        {"message": rejection_message},
                        status=status.HTTP_403_FORBIDDEN
                    )
                    
                token = WorkshopToken(workshop)
                return Response({
                    "refresh": str(token),
                    "access": str(token.access_token),
                    "message": "Login successful"
                }, status=status.HTTP_200_OK)
            return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class WorkshopLogoutView(APIView):
    def post(self, request):
        refresh_token = request.data.get('refresh_token')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Logout successful"}, status=status.HTTP_205_RESET_CONTENT)
        return Response({"error": "No refresh token provided"}, status=status.HTTP_400_BAD_REQUEST)
    
    
class WorkshopServiceCreateAPIView(APIView):
    authentication_classes = [WorkshopJWTAuthentication]
    permission_classes = [IsWorkshopUser]
    
    def post(self, request):
        workshop = request.user  # The workshop making the request
        admin_service_id = request.data.get('admin_service_id')        
        name = request.data.get('name')
        description = request.data.get('description')
        base_price = request.data.get('base_price')
        
        if admin_service_id:
            try:
                admin_service = Service.objects.get(id=admin_service_id)    
                workshop_service = WorkshopService.objects.create(
                    workshop=workshop,
                    admin_service=admin_service,
                    name=admin_service.name,
                    description=admin_service.description,
                    base_price=base_price,
                    service_type='admin',
                )
            except Service.DoesNotExist:
                return Response({"error": "Selected admin service does not exist."}, status=status.HTTP_404_NOT_FOUND)
        else:
            workshop_service = WorkshopService.objects.create(
            workshop=workshop,
            name=name,
            description=description,
            base_price=base_price,
            service_type='workshop',
        )
        
        return Response({"message": "Service added successfully, awaiting admin approval."}, status=status.HTTP_201_CREATED)


class WorkshopServiceListAPIView(APIView):
    authentication_classes = [WorkshopJWTAuthentication]
    permission_classes = [IsWorkshopUser]
    
    def get(self, request):
        # Fetch admin-created services
        admin_services = Service.objects.all()
        admin_services_serialized = ServiceSerializer(admin_services, many=True).data

        # Fetch approved workshop services
        workshop_services = WorkshopService.objects.filter(workshop=request.user)
        workshop_services_serialized = WorkshopServiceSerializer(workshop_services, many=True).data

        return Response({
                "admin_services": admin_services_serialized,
                "workshop_services": workshop_services_serialized
            }, status=status.HTTP_200_OK)

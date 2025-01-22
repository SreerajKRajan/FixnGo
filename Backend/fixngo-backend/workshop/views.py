from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import WorkshopSignupSerializer, WorkshopLoginSerializer, WorkshopServiceSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Workshop, WorkshopOtp, WorkshopService
from datetime import timedelta
from django.utils import timezone
import random
from .tokens import WorkshopToken
from utils.s3_utils import upload_to_s3
from .authentication import WorkshopJWTAuthentication
from .permissions import IsWorkshopUser
from service.models import Service
from itertools import chain
from service.serializers import ServiceSerializer
from users.tasks import send_otp_email
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_decode
from rest_framework.generics import ListAPIView
from users.models import ServiceRequest
from users.serializers import ServiceRequestSerializer
import socketio
import requests


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

            # Call the Celery task to send OTP email
            send_otp_email.delay(subject, text_content, html_content, workshop.email)

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
    
    
class WorkshopForgotPasswordView(APIView):
    def post(self, request):
        email = request.data.get("email")
        try:
            workshop = Workshop.objects.get(email=email)
        except Workshop.DoesNotExist:
            return Response({"error": "Workshop with this email does not exist."}, status=status.HTTP_404_NOT_FOUND)

        # Generate password reset token and URL
        token = default_token_generator.make_token(workshop)
        uid = urlsafe_base64_encode(force_bytes(workshop.pk))
        reset_url = f"{request.build_absolute_uri('http://localhost:5173/workshop/reset-password/')}{uid}/{token}/"

        # Email content
        subject = "FixnGo Workshop Password Reset Request"
        text_content = f"""
        Hello {workshop.name},

        We received a request to reset your password for your FixnGo workshop account.

        You can reset your password using the link below:
        {reset_url}

        If you did not request this, please ignore this email.

        Best regards,
        The FixnGo Team
        """
        html_content = f"""
        <html>
            <body>
                <h2>Workshop Password Reset Request</h2>
                <p>Hello <strong>{workshop.name}</strong>,</p>
                <p>We received a request to reset your password for your FixnGo workshop account.</p>
                <p>You can reset your password using the link below:</p>
                <a href="{reset_url}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
                <p>If you did not request this, please ignore this email.</p>
                <p>Best regards,</p>
                <p>The FixnGo Team</p>
            </body>
        </html>
        """

        # Trigger Celery task
        send_otp_email.delay(subject, text_content, html_content, workshop.email)

        return Response({"message": "Password reset email sent successfully."}, status=status.HTTP_200_OK)


class WorkshopResetPasswordView(APIView):
    def post(self, request, uidb64, token):
        try:
            # Decode the workshop ID
            uid = urlsafe_base64_decode(uidb64).decode()
            workshop = Workshop.objects.get(pk=uid)  # Adjust to your Workshop model
        except (TypeError, ValueError, OverflowError, Workshop.DoesNotExist):
            return Response({"error": "Invalid workshop ID."}, status=status.HTTP_400_BAD_REQUEST)

        # Validate the token
        if not default_token_generator.check_token(workshop, token):
            return Response({"error": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)

        # Get the new password from the request
        new_password = request.data.get("password")
        confirm_password = request.data.get("confirm_password")

        if not new_password or not confirm_password:
            return Response({"error": "Password fields are required."}, status=status.HTTP_400_BAD_REQUEST)

        if new_password != confirm_password:
            return Response({"error": "Passwords do not match."}, status=status.HTTP_400_BAD_REQUEST)

        # Update the password
        workshop.set_password(new_password)  # Assuming Workshop uses the same auth methods as User
        workshop.save()

        return Response({"message": "Password reset successfully."}, status=status.HTTP_200_OK)

    
    
class WorkshopServiceCreateAPIView(APIView):
    authentication_classes = [WorkshopJWTAuthentication]
    permission_classes = [IsWorkshopUser]
    
    def post(self, request):
        workshop = request.user
        admin_service_id = request.data.get('admin_service_id')
        name = request.data.get('name')
        description = request.data.get('description')
        base_price = request.data.get('base_price')

        if admin_service_id:
            try:
                admin_service = Service.objects.get(id=admin_service_id)
                # Prevent duplicate addition of the same admin service
                if WorkshopService.objects.filter(workshop=workshop, admin_service=admin_service).exists():
                    return Response({"error": "This admin service is already added."}, status=status.HTTP_400_BAD_REQUEST)
                
                workshop_service = WorkshopService.objects.create(
                    workshop=workshop,
                    admin_service=admin_service,
                    name=admin_service.name,
                    description=admin_service.description,
                    base_price=base_price,
                    service_type='admin',
                )
                return Response({
                    "message": "Admin service added successfully.",
                    "service": WorkshopServiceSerializer(workshop_service).data,
                }, status=status.HTTP_201_CREATED)
            except Service.DoesNotExist:
                return Response({"error": "Selected admin service does not exist."}, status=status.HTTP_404_NOT_FOUND)
        else:
            # Validate custom service creation fields
            if not all([name, description, base_price]):
                return Response({"error": "Name, description, and base price are required."}, status=status.HTTP_400_BAD_REQUEST)

            workshop_service = WorkshopService.objects.create(
                workshop=workshop,
                name=name,
                description=description,
                base_price=base_price,
                service_type='workshop',
            )
            return Response({
                "message": "Workshop service created successfully, awaiting admin approval.",
                "service": WorkshopServiceSerializer(workshop_service).data,
            }, status=status.HTTP_201_CREATED)



class WorkshopServiceListAPIView(APIView):
    authentication_classes = [WorkshopJWTAuthentication]
    permission_classes = [IsWorkshopUser]

    def get(self, request):
        workshop = request.user
        search_query = request.query_params.get("search", "").lower()

        # Admin services available to add (status = 'available')
        admin_services_available = Service.objects.filter(
            status="available"
        ).exclude(
            id__in=WorkshopService.objects.filter(
                workshop=workshop, admin_service__isnull=False
            ).values_list("admin_service_id", flat=True)
        ).order_by("-created_at")

        if search_query:
            admin_services_available = admin_services_available.filter(name__icontains=search_query)

        admin_services_available_serialized = ServiceSerializer(admin_services_available, many=True).data

        # Admin services already added by workshop
        admin_services_added = WorkshopService.objects.filter(
            workshop=workshop, service_type="admin"
        ).order_by("-created_at")
        admin_services_added_serialized = WorkshopServiceSerializer(admin_services_added, many=True).data

        # Custom workshop services (approved and pending separately)
        workshop_services_approved = WorkshopService.objects.filter(
            workshop=workshop, service_type="workshop", is_approved=True
        ).order_by("-created_at")
        workshop_services_pending = WorkshopService.objects.filter(
            workshop=workshop, service_type="workshop", is_approved=False
        ).order_by("-created_at")

        workshop_services_approved_serialized = WorkshopServiceSerializer(workshop_services_approved, many=True).data
        workshop_services_pending_serialized = WorkshopServiceSerializer(workshop_services_pending, many=True).data

        return Response(
            {
                "message": "All services retrieved successfully.",
                "admin_services_available": admin_services_available_serialized,
                "admin_services_added": admin_services_added_serialized,
                "workshop_services_approved": workshop_services_approved_serialized,
                "workshop_services_pending": workshop_services_pending_serialized,
            },
            status=status.HTTP_200_OK,
        )



class WorkshopServiceAvailabilityUpdateAPIView(APIView):
    authentication_classes = [WorkshopJWTAuthentication]
    permission_classes = [IsWorkshopUser]

    def patch(self, request, pk):
        try:
            # Fetch the service associated with the workshop
            service = WorkshopService.objects.get(id=pk, workshop=request.user)
            is_available = request.data.get("is_available")
            
            # Update service availability if valid data is provided
            if is_available is not None:
                service.is_available = is_available
                service.save()

                # Serialize the updated service data
                updated_service_data = WorkshopServiceSerializer(service).data

                return Response({
                    "message": "Service availability updated successfully.",
                    "service": updated_service_data,  # Return only the updated service
                }, status=status.HTTP_200_OK)

            return Response({"error": "Invalid data."}, status=status.HTTP_400_BAD_REQUEST)

        except WorkshopService.DoesNotExist:
            return Response({"error": "Service not found."}, status=status.HTTP_404_NOT_FOUND)


class WorkshopServiceRequestsListAPIView(ListAPIView):
    authentication_classes = [WorkshopJWTAuthentication]
    permission_classes = [IsWorkshopUser]
    serializer_class = ServiceRequestSerializer

    def get_queryset(self):
        # Fetch only the service requests for the authenticated workshop
        workshop = self.request.user
        return ServiceRequest.objects.filter(workshop_service__workshop=workshop).order_by('-created_at')


class UpdateServiceRequestStatusAPIView(APIView):
    authentication_classes = [WorkshopJWTAuthentication]
    permission_classes = [IsWorkshopUser]

    def post(self, request, request_id):
        workshop = request.user
        try:
            service_request = ServiceRequest.objects.get(id=request_id, workshop=workshop)
        except ServiceRequest.DoesNotExist:
            return Response({"error": "Request not found or not authorized"}, status=404)

        status = request.data.get("status")
        if status not in ["accepted", "rejected"]:
            return Response({"error": "Invalid status"}, status=400)

        # Update the status
        service_request.status = status
        service_request.save()

        # Send a real-time notification to the user
        user_id = service_request.user.id
        message = f"Your service request for {service_request.workshop_service.name} has been {status}."
        
        try:
            response = requests.post(
                "http://localhost:5000/notification",
                json={"user_id": user_id, "message": message},
                headers={"Content-Type": "application/json"}
            )
            print(f"Notification response: {response.status_code}, {response.text}")  # Add this debug log
            if response.status_code != 200:
                print(f"Error sending notification: {response.text}")
        except Exception as e:
            print(f"Error notifying user {user_id}: {str(e)}")

        return Response({"message": f"Request {status} successfully"})



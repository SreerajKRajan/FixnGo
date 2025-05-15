from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import WorkshopSignupSerializer, WorkshopLoginSerializer, WorkshopServiceSerializer, WorkshopSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Workshop, WorkshopOtp, WorkshopService
from datetime import timedelta
from django.utils import timezone
import random
from .tokens import WorkshopToken
from utils.s3_utils import upload_to_s3, get_s3_file_url
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
from users.models import ServiceRequest, Payment, Review
from users.serializers import ServiceRequestSerializer
import socketio
import requests
from admin_side.views import CommonPagination
from django.db.models import Sum, Count, Avg
from dateutil.relativedelta import relativedelta
from django.db.models.functions import ExtractMonth, TruncMonth
import logging


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
                    "message": "Login successful",
                    "workshop": {
                        "id": workshop.id,
                        "email": workshop.email,
                        "name": workshop.name,
                    }
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
    pagination_class = CommonPagination

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


class SendPaymentRequestView(APIView):
    authentication_classes = [WorkshopJWTAuthentication]
    permission_classes = [IsWorkshopUser]
    
    def post(self, request):
        # Extract data from the request
        request_id = request.data.get('requestId')
        total_cost = request.data.get('totalCost')
        
        if not request_id or not total_cost:
            return Response(
                {"error": "Both 'requestId' and 'totalCost' are required."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Fetch the service request object
            service_request = ServiceRequest.objects.get(id=request_id)
            
            # Update the total cost and set payment status
            service_request.total_cost = total_cost
            service_request.status = 'IN_PROGRESS'
            service_request.payment_status = 'PENDING'
            service_request.save()
            
            # Additional logic: send notifications or emails (optional)
            
            return Response(
                {"message": "Payment request sent successfully.", 
                 "requestId": service_request.id, 
                 "totalCost": service_request.total_cost},
                status=status.HTTP_200_OK
            )
        except ServiceRequest.DoesNotExist:
            return Response(
                {"error": "Service request not found."}, 
                status=status.HTTP_404_NOT_FOUND
            )


class WorkshopDashboardAPIView(APIView):
    authentication_classes = [WorkshopJWTAuthentication]
    permission_classes = [IsWorkshopUser]
    
    def get(self, request):
        workshop = request.user
        
        # Get all service requests for this workshop
        service_requests = ServiceRequest.objects.filter(workshop=workshop)
        
        # Total number of service requests
        total_requests = service_requests.count()
        
        # Total pending service requests
        total_pending = service_requests.filter(status='PENDING').count()
        
        # Total completed service requests
        total_completed = service_requests.filter(status='COMPLETED').count()
        
        # Total earnings (Sum of successful payments for this workshop)
        successful_payments = Payment.objects.filter(
            service_request__workshop=workshop,
            status="SUCCESS"
        )
        total_earnings = successful_payments.aggregate(total=Sum('amount'))['total'] or 0
        
        # Calculate changes from previous periods for context
        # Last month's service requests
        last_month = timezone.now() - timedelta(days=30)
        last_month_requests = service_requests.filter(created_at__gte=last_month).count()
        previous_month_requests = service_requests.filter(
            created_at__lt=last_month,
            created_at__gte=last_month - timedelta(days=30)
        ).count()
        
        # Calculate percentage change
        req_percent_change = 0
        if previous_month_requests > 0:
            req_percent_change = ((last_month_requests - previous_month_requests) / previous_month_requests) * 100
        
        # Last week's pending requests
        last_week = timezone.now() - timedelta(days=7)
        last_week_pending = service_requests.filter(
            status='PENDING', 
            created_at__gte=last_week
        ).count()
        previous_week_pending = service_requests.filter(
            status='PENDING',
            created_at__lt=last_week,
            created_at__gte=last_week - timedelta(days=7)
        ).count()
        
        # Calculate percentage change for pending
        pending_percent_change = 0
        if previous_week_pending > 0:
            pending_percent_change = ((last_week_pending - previous_week_pending) / previous_week_pending) * 100
        
        # Last month's completed requests
        last_month_completed = service_requests.filter(
            status='COMPLETED', 
            created_at__gte=last_month
        ).count()
        previous_month_completed = service_requests.filter(
            status='COMPLETED',
            created_at__lt=last_month,
            created_at__gte=last_month - timedelta(days=30)
        ).count()
        
        # Calculate percentage change for completed
        completed_percent_change = 0
        if previous_month_completed > 0:
            completed_percent_change = ((last_month_completed - previous_month_completed) / previous_month_completed) * 100
        
        # Last month's earnings
        last_month_earnings = successful_payments.filter(created_at__gte=last_month).aggregate(total=Sum('amount'))['total'] or 0
        previous_month_earnings = successful_payments.filter(
            created_at__lt=last_month,
            created_at__gte=last_month - timedelta(days=30)
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        # Calculate percentage change for earnings
        earnings_percent_change = 0
        if previous_month_earnings > 0:
            earnings_percent_change = ((last_month_earnings - previous_month_earnings) / previous_month_earnings) * 100
        
        return Response({
            "total_requests": total_requests,
            "total_pending": total_pending,
            "total_completed": total_completed,
            "total_earnings": total_earnings,
            "req_percent_change": round(req_percent_change, 1),
            "pending_percent_change": round(pending_percent_change, 1),
            "completed_percent_change": round(completed_percent_change, 1),
            "earnings_percent_change": round(earnings_percent_change, 1)
        })


class ServiceRequestTrendsAPIView(APIView):
    authentication_classes = [WorkshopJWTAuthentication]
    permission_classes = [IsWorkshopUser]
    
    def get(self, request):
        workshop = request.user
        
        # Get the current date and calculate the date one year ago
        today = timezone.now().date()
        one_year_ago = today - relativedelta(years=1)
        
        # Query to get service requests grouped by month
        service_requests = ServiceRequest.objects.filter(
            workshop=workshop,
            created_at__date__gte=one_year_ago,
            created_at__date__lte=today
        ).annotate(
            month=TruncMonth('created_at')
        ).values('month').annotate(
            requests=Count('id')
        ).order_by('month')
        
        # Map month numbers to month names
        month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        
        # Prepare data for all months in the past year
        all_months = {}
        for i in range(12):
            month_date = today - relativedelta(months=i)
            month_name = month_names[month_date.month - 1]
            all_months[month_date.strftime('%Y-%m')] = {
                "month": month_name,
                "requests": 0
            }
        
        # Fill in actual data where available
        for entry in service_requests:
            month_key = entry['month'].strftime('%Y-%m')
            month_name = month_names[entry['month'].month - 1]
            all_months[month_key] = {
                "month": month_name,
                "requests": entry['requests']
            }
        
        # Convert to list and sort by month
        trends = list(all_months.values())
        
        # Reverse to get chronological order (oldest to newest)
        trends.reverse()
        
        return Response({
            "trends": trends
        })


class WorkshopRatingDistributionAPIView(APIView):
    authentication_classes = [WorkshopJWTAuthentication]
    permission_classes = [IsWorkshopUser]
    
    def get(self, request):
        workshop = request.user
        
        # Get the rating distribution
        rating_distribution = Review.objects.filter(
            workshop=workshop
        ).values('rating').annotate(
            count=Count('rating')
        ).order_by('rating')
        
        # Calculate average rating
        avg_rating = Review.objects.filter(
            workshop=workshop
        ).aggregate(
            average_rating=Avg('rating')
        )['average_rating'] or 0
        
        # Initialize all ratings with 0 count
        distribution = {
            'one_star': 0,
            'two_star': 0,
            'three_star': 0,
            'four_star': 0,
            'five_star': 0,
            'average_rating': round(avg_rating, 1),
            'total_reviews': 0,
        }
        
        # Update counts based on actual data
        total_reviews = 0
        for item in rating_distribution:
            rating = item['rating']
            count = item['count']
            total_reviews += count
            
            if rating == 1:
                distribution['one_star'] = count
            elif rating == 2:
                distribution['two_star'] = count
            elif rating == 3:
                distribution['three_star'] = count
            elif rating == 4:
                distribution['four_star'] = count
            elif rating == 5:
                distribution['five_star'] = count
        
        distribution['total_reviews'] = total_reviews
        
        return Response(distribution)

class RecentActivityAPIView(APIView):
    authentication_classes = [WorkshopJWTAuthentication]
    permission_classes = [IsWorkshopUser]
    
    def get(self, request):
        workshop = request.user
        
        # Get the most recent service requests (last 10)
        recent_requests = ServiceRequest.objects.filter(
            workshop=workshop
        ).order_by('-created_at')[:10]
        
        activities = []
        for req in recent_requests:
            # Map the status to a user-friendly format
            status_map = {
                'PENDING': 'Pending',
                'ACCEPTED': 'In Progress',
                'REJECTED': 'Rejected',
                'IN_PROGRESS': 'In Progress',
                'COMPLETED': 'Completed'
            }
            
            activities.append({
                'id': req.id,
                'user_name': req.user.username,
                'status': status_map.get(req.status, req.status),
                'service_name': req.workshop_service.name,
                'created_at': req.created_at.isoformat(),
                'vehicle_type': req.vehicle_type
            })
        
        return Response({
            "activities": activities
        })


class WorkshopServicesAPIView(APIView):
    authentication_classes = [WorkshopJWTAuthentication]
    permission_classes = [IsWorkshopUser]
    
    def get(self, request):
        workshop = request.user
        
        # Get all services for this workshop
        services = WorkshopService.objects.filter(workshop=workshop)
        
        # For each service, get the number of bookings
        result = []
        for service in services:
            bookings_count = ServiceRequest.objects.filter(
                workshop_service=service
            ).count()
            
            result.append({
                'id': service.id,
                'name': service.name,
                'description': service.description,
                'base_price': service.base_price,
                'is_approved': service.is_approved,
                'is_available': service.is_available,
                'service_type': service.service_type,
                'created_at': service.created_at.isoformat(),
                'bookings_count': bookings_count
            })
        
        return Response(result)
    
    
class WorkshopProfileView(APIView):
    authentication_classes = [WorkshopJWTAuthentication]
    permission_classes = [IsWorkshopUser]
    
    def get(self, request):
        workshop = request.user

        # Check if the workshop is approved
        if not workshop.is_approved:
            return Response({
                "error": "Your workshop account is not approved yet or has been rejected.",
                "status": workshop.approval_status,
                "rejection_reason": workshop.rejection_reason
            }, status=status.HTTP_403_FORBIDDEN)

        serializer = WorkshopSerializer(workshop)
        return Response(serializer.data)

    def put(self, request):
        workshop = request.user

        # Check if the workshop is approved before allowing updates
        if not workshop.is_approved:
            return Response({
                "error": "Your workshop account is not approved yet or has been rejected.",
                "status": workshop.approval_status,
                "rejection_reason": workshop.rejection_reason
            }, status=status.HTTP_403_FORBIDDEN)

        # Handle profile image upload
        if 'profile_image' in request.FILES:
            profile_image = request.FILES['profile_image']

            # Validate it's an image
            if not profile_image.content_type.startswith('image/'):
                return Response({"error": "Only image files are allowed for profile image."}, status=400)

            try:
                s3_file_path = f"media/workshop_profile_images/{workshop.id}/"
                s3_key = upload_to_s3(profile_image, s3_file_path)
                image_url = get_s3_file_url(profile_image.name, s3_file_path)

                # Save the full S3 image URL to workshop model
                workshop.profile_image = image_url
                workshop.save()
            except Exception as e:
                return Response({"error": f"Failed to upload profile image: {str(e)}"}, status=500)

        # Handle document upload if provided
        if 'document' in request.FILES:
            document = request.FILES['document']
            
            # Validate allowed document types
            allowed_types = ['application/pdf', 'application/msword', 
                            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                            'image/jpeg', 'image/png']
            
            if document.content_type not in allowed_types:
                return Response({"error": "Only PDF, DOC, DOCX, JPG, JPEG or PNG files are allowed for documents."}, status=400)
                
            try:
                s3_file_path = f"media/workshop_documents/{workshop.id}/"
                s3_key = upload_to_s3(document, s3_file_path)
                document_url = get_s3_file_url(document.name, s3_file_path)
                
                # Save the document to the workshop model
                workshop.document = document_url
                workshop.save()
            except Exception as e:
                return Response({"error": f"Failed to upload document: {str(e)}"}, status=500)
        
        serializer = WorkshopSerializer(workshop, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Workshop profile updated successfully!"})

        return Response(serializer.errors, status=400)
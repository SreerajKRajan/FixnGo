from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from rest_framework import status
from workshop.models import Workshop, WorkshopService
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from workshop.serializers import WorkshopSerializer
from users.models import User, Payment, ServiceRequest
from users.serializers import UserSerializer
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework.pagination import PageNumberPagination
from django.db.models import Count, Sum, F, Value, IntegerField, Q, Case, When, DecimalField
from django.db.models.functions import TruncMonth, ExtractMonth, Now, Coalesce
from django.utils import timezone
from datetime import timedelta

class CommonPagination(PageNumberPagination):
    page_size = 5  # Default number of items per page
    page_size_query_param = 'page_size'
    max_page_size = 100  # Maximum number of items per page


class WorkshopListView(ListAPIView):
    permission_classes = [IsAdminUser]
    queryset = Workshop.objects.filter(is_verified=True).order_by("-created_at")
    serializer_class = WorkshopSerializer
    pagination_class = CommonPagination


class UserListView(ListAPIView):
    permission_classes = [IsAdminUser]
    queryset = User.objects.filter(is_superuser=False, is_verified=True)
    serializer_class = UserSerializer
    pagination_class = CommonPagination
    
    
class ToggleUserStatusView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        user_id = request.data.get("user_id")
        new_status = request.data.get("status")

        if not user_id or not new_status:
            return Response(
                {"error": "User ID and status are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found."}, status=status.HTTP_404_NOT_FOUND
            )

        if new_status not in ["Active", "Blocked"]:
            return Response(
                {"error": "Invalid status value."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Update the user's status
        user.is_active = new_status == "Active"
        user.save()

        return Response(
            {
                "message": f"User status updated to {new_status}.",
                "is_active": user.is_active,
            },
            status=status.HTTP_200_OK,
        )
        
        
class ToggleWorkshopStatusView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        workshop_id = request.data.get("workshop_id")
        new_status = request.data.get("status")

        if not workshop_id or not new_status:
            return Response(
                {"error": "Workshop ID and status are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            workshop = Workshop.objects.get(id=workshop_id)
        except Workshop.DoesNotExist:
            return Response(
                {"error": "Workshop not found."}, status=status.HTTP_404_NOT_FOUND
            )

        if new_status not in ["Active", "Blocked"]:
            return Response(
                {"error": "Invalid status value."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Update the user's status
        workshop.is_active = new_status == "Active"
        workshop.save()

        return Response(
            {
                "message": f"Workshop status updated to {new_status}.",
                "is_active": workshop.is_active,
            },
            status=status.HTTP_200_OK,
        )


class ApproveWorkshopView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        workshop_id = request.data.get('workshop_id')
        workshop = Workshop.objects.filter(id=workshop_id).first()

        if not workshop:
            return Response({"error": "Workshop not found"}, status=status.HTTP_404_NOT_FOUND)
        
        if not workshop.is_verified:
            return Response({"error": "Workshop is not verified"}, status=status.HTTP_400_BAD_REQUEST)
        
        if workshop.is_approved:
            return Response({"message": "Workshop is already approved."}, status=status.HTTP_400_BAD_REQUEST)

        workshop.is_approved = True
        workshop.approval_status = "approved"
        workshop.save()
        return Response({"message": "Workshop approved successfully."}, status=status.HTTP_200_OK)

class RejectWorkhsopView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        print("Payload received:", request.data)
        workshop_id = request.data.get('workshop_id')
        rejection_reason = request.data.get('rejection_reason') 
        
        if not workshop_id or not rejection_reason:
            return Response(
                {"error": "Workshop ID and rejection reason are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
            
        workshop = Workshop.objects.filter(id=workshop_id).first()
        
        if not workshop:
            return Response({"error": "Workshop not found"}, status=status.HTTP_404_NOT_FOUND)
    
        if not workshop.is_verified:
            return Response({"error": "Workshop is not verified"}, status=status.HTTP_400_BAD_REQUEST)
        
        workshop.is_approved = False
        workshop.approval_status = 'rejected'
        workshop.rejection_reason = rejection_reason
        workshop.save()
        return Response({"message": "Workshop rejected successfully."}, status=status.HTTP_200_OK)
    
    
        
class AdminLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response({"detail": "Email and password are required."}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(request, username=email, password=password)
        if user and user.is_superuser:  # Ensure only superusers can log in as admin
            refresh = RefreshToken.for_user(user)
            return Response({
                "token": str(refresh.access_token),
                "refresh": str(refresh),
                "admin": {
                    "id": user.id,
                    "email": user.email,
                    "username": user.username,
                }
            }, status=status.HTTP_200_OK)

        return Response({"detail": "Invalid credentials or not an admin."}, status=status.HTTP_401_UNAUTHORIZED)
    
class AdminLogoutView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()  # Blacklist the refresh token
            return Response({"message": "Logout successful"}, status=status.HTTP_200_OK)
        except TokenError:
            return Response({"detail": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)

class DashboardAPIView(APIView):
    """API endpoint to provide dashboard data for the admin dashboard"""
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        today = timezone.now()
        last_month = today - timedelta(days=30)
        last_week = today - timedelta(days=7)
        
        # Get user statistics
        total_users = User.objects.filter(is_active=True).count()
        last_month_users = User.objects.filter(created_at__lt=last_month, is_active=True).count()
        user_growth_pct = round(((total_users - last_month_users) / max(last_month_users, 1)) * 100, 1)
        
        # Get workshop statistics
        total_workshops = Workshop.objects.filter(is_active=True).count()
        new_workshops = Workshop.objects.filter(created_at__gte=last_week).count()
        pending_workshops = Workshop.objects.filter(approval_status='pending').count()
        
        # Get service request statistics
        total_service_requests = ServiceRequest.objects.count()
        last_month_requests = ServiceRequest.objects.filter(created_at__lt=last_month).count()
        request_growth_pct = round(((total_service_requests - last_month_requests) / max(last_month_requests, 1)) * 100, 1)
        
        new_requests = ServiceRequest.objects.filter(status='PENDING').count()
        in_progress_requests = ServiceRequest.objects.filter(status='IN_PROGRESS').count()
        completed_requests = ServiceRequest.objects.filter(status='COMPLETED').count()
        
        # Get revenue statistics - FIX: Specify the output_field as DecimalField
        successful_payments = Payment.objects.filter(status='SUCCESS')
        total_revenue = successful_payments.aggregate(
            total=Coalesce(Sum('amount'), Value(0), output_field=DecimalField())
        )['total']
        
        # Calculate last month's revenue - FIX: Specify the output_field as DecimalField
        last_month_revenue = successful_payments.filter(created_at__lt=last_month).aggregate(
            total=Coalesce(Sum('amount'), Value(0), output_field=DecimalField())
        )['total']
        
        # Handle division by zero and calculate growth
        if float(last_month_revenue) > 0:
            revenue_growth_pct = round(((float(total_revenue) - float(last_month_revenue)) / float(last_month_revenue)) * 100, 1)
        else:
            revenue_growth_pct = 100.0 if float(total_revenue) > 0 else 0.0
        
        # Pending revenue - FIX: Specify the output_field as DecimalField
        pending_revenue = Payment.objects.filter(status='PENDING').aggregate(
            total=Coalesce(Sum('amount'), Value(0), output_field=DecimalField())
        )['total']
        
        # Get service distribution data
        service_distribution = []
        
        # First try to get data from ServiceRequest
        top_services = ServiceRequest.objects.values(
            'workshop_service__name'
        ).annotate(
            count=Count('id')
        ).order_by('-count')[:5]
        
        for service in top_services:
            service_distribution.append({
                'name': service['workshop_service__name'] or 'Unknown Service',  # Handle potential None values
                'count': service['count']
            })
        
        # If no service requests yet, show available services
        if not service_distribution:
            top_services = WorkshopService.objects.filter(
                is_approved=True
            ).values('name').annotate(
                count=Count('workshop')
            ).order_by('-count')[:5]
            
            for service in top_services:
                service_distribution.append({
                    'name': service['name'] or 'Unknown Service',  # Handle potential None values
                    'count': service['count']
                })
        
        # Get payment distribution - FIX: Specify the output_field as DecimalField
        payment_distribution = []
        # Check if STATUS_CHOICES is defined in Payment model
        try:
            status_choices = Payment.STATUS_CHOICES
        except AttributeError:
            # Fallback to hardcoded values if not defined
            status_choices = [
                ('SUCCESS', 'Success'),
                ('PENDING', 'Pending'),
                ('FAILED', 'Failed')
            ]
            
        for status_code, label in status_choices:
            amount = Payment.objects.filter(status=status_code).aggregate(
                total=Coalesce(Sum('amount'), Value(0), output_field=DecimalField())
            )['total']
            
            payment_distribution.append({
                'name': label,
                'status': status_code,
                'value': float(amount)
            })
        
        # Get user growth data (monthly for the last 6 months)
        user_growth = []
        for i in range(5, -1, -1):
            month_date = today - timedelta(days=30 * i)
            month_name = month_date.strftime('%b')
            
            user_count = User.objects.filter(
                created_at__lte=month_date
            ).count()
            
            user_growth.append({
                'month': month_name,
                'count': user_count
            })
        
        # Get recent service requests - use more defensive coding to handle potential missing relationships
        recent_requests = []
        for req in ServiceRequest.objects.select_related(
            'user', 'workshop', 'workshop_service'
        ).order_by('-created_at')[:10]:
            # Handle potential None values or missing attributes
            try:
                time_diff = timezone.now() - req.created_at
                
                if time_diff.days > 0:
                    time_ago = f"{time_diff.days} {'day' if time_diff.days == 1 else 'days'} ago"
                elif time_diff.seconds // 3600 > 0:
                    hours = time_diff.seconds // 3600
                    time_ago = f"{hours} {'hour' if hours == 1 else 'hours'} ago"
                else:
                    minutes = time_diff.seconds // 60
                    time_ago = f"{minutes} {'minute' if minutes == 1 else 'minutes'} ago"
                
                username = req.user.username if req.user else "Unknown User"
                service_name = req.workshop_service.name if req.workshop_service else "Unknown Service"
                workshop_name = req.workshop.name if req.workshop else "Unknown Workshop"
                
                recent_requests.append({
                    'id': req.id,
                    'userName': username,
                    'serviceName': service_name,
                    'vehicleType': req.vehicle_type or "Not specified",
                    'workshopName': workshop_name,
                    'status': req.status,
                    'timeAgo': time_ago,
                    'createdAt': req.created_at.isoformat()
                })
            except (AttributeError, TypeError):
                # Skip this record if there are issues
                continue
        
        # Compile all data
        dashboard_data = {
            'userStats': {
                'total': total_users,
                'growth': user_growth_pct
            },
            'workshopStats': {
                'total': total_workshops,
                'new': new_workshops,
                'pending': pending_workshops
            },
            'serviceRequestStats': {
                'total': total_service_requests,
                'growth': request_growth_pct,
                'new': new_requests,
                'inProgress': in_progress_requests,
                'completed': completed_requests
            },
            'revenueStats': {
                'total': float(total_revenue),
                'growth': revenue_growth_pct,
                'pending': float(pending_revenue)
            },
            'serviceDistribution': service_distribution,
            'paymentDistribution': payment_distribution,
            'userGrowth': user_growth,
            'recentServiceRequests': recent_requests
        }
        
        return Response(dashboard_data, status=status.HTTP_200_OK)
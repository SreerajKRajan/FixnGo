from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from rest_framework import status
from workshop.models import Workshop
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from workshop.serializers import WorkshopSerializer
from users.models import User
from users.serializers import UserSerializer
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework.pagination import PageNumberPagination

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
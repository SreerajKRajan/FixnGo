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


class WorkshopListView(ListAPIView):
    permission_classes = [IsAdminUser]
    queryset = Workshop.objects.all()
    serializer_class = WorkshopSerializer


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

class ApproveWorkshopView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        workshop_id = request.data.get('workshop_id')
        workshop = Workshop.objects.filter(id=workshop_id).first()

        if not workshop:
            return Response({"error": "Workshop not found"}, status=status.HTTP_404_NOT_FOUND)

        if workshop.is_approved:
            return Response({"message": "Workshop is already approved."}, status=status.HTTP_400_BAD_REQUEST)

        workshop.is_approved = True
        workshop.save()
        return Response({"message": "Workshop approved successfully."}, status=status.HTTP_200_OK)

class RejectWorkhsopView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        workshop_id = request.data.get('workshop_id')
        workshop = Workshop.objects.filter(id=workshop_id).first()
        
        if not workshop:
            return Response({"error": "Workshop not found"}, status=status.HTTP_404_NOT_FOUND)
        
        if not workshop.is_approved:
            return Response({"message": "Workshop is already rejected."}, status=status.HTTP_400_BAD_REQUEST)
        
        workshop.is_approved = False
        workshop.save()
        return Response({"message": "Workshop rejected successfully."}, status=status.HTTP_200_OK)
    
    
        

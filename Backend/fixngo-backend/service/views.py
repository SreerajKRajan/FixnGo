from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Service
from .serializers import ServiceSerializer
from workshop.models import WorkshopService
from rest_framework.permissions import IsAdminUser

class ServiceListCreateAPIView(APIView):
    def get(self, request):
        services = Service.objects.all()
        serializer = ServiceSerializer(services, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = ServiceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ServiceDetailAPIView(APIView):
    def get_object(self, pk):
        try:
            return Service.objects.get(pk=pk)
        except Service.DoesNotExist:
            return None

    def put(self, request, pk):
        service = self.get_object(pk)
        if not service:
            return Response({"error": "Service not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = ServiceSerializer(service, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        service = self.get_object(pk)
        if not service:
            return Response({"error": "Service not found"}, status=status.HTTP_404_NOT_FOUND)
        service.delete()
        return Response({"message": "Service deleted"}, status=status.HTTP_204_NO_CONTENT)
    
class AdminApproveWorkshopServiceAPIView(APIView):
    permission_classes = [IsAdminUser]

    def put(self, request, pk):
        try:
            workshop_service = WorkshopService.objects.get(id=pk)
        except WorkshopService.DoesNotExist:
            return Response({"error": "Workshop service not found"}, status=status.HTTP_404_NOT_FOUND)

        # Admin approves the service
        workshop_service.is_approved = True
        workshop_service.save()

        return Response({"message": "Service approved successfully."}, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        try:
            workshop_service = WorkshopService.objects.get(id=pk)
        except WorkshopService.DoesNotExist:
            return Response({"error": "Workshop service not found"}, status=status.HTTP_404_NOT_FOUND)

        # Admin rejects the service
        workshop_service.is_approved = False
        workshop_service.save()

        return Response({"message": "Service rejected successfully."}, status=status.HTTP_200_OK)


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Service
from .serializers import ServiceSerializer
from workshop.serializers import WorkshopServiceSerializer
from workshop.models import WorkshopService, Workshop
from rest_framework.permissions import IsAdminUser
from rest_framework.pagination import PageNumberPagination


class ServicePagination(PageNumberPagination):
    page_size = 5  # Number of items per page
    page_size_query_param = 'limit'  # Allows clients to override the page size
    max_page_size = 100  # Max number of items per page


class ServiceListCreateAPIView(APIView):
    def get(self, request):
        services = Service.objects.order_by("-created_at")
        paginator = ServicePagination()
        result_page = paginator.paginate_queryset(services, request)
        serializer = ServiceSerializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data)

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

    def patch(self, request, pk):
        service = self.get_object(pk)
        if not service:
            return Response({"error": "Service not found"}, status=status.HTTP_404_NOT_FOUND)
        service.status = request.data.get('status', service.status)
        service.save()
        return Response({"message": f"Service marked as {service.status}."}, status=status.HTTP_200_OK)
    
class PendingWorkshopServicesAPIView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        workshops = (
            Workshop.objects.filter(workshop_services__is_approved=False)
            .distinct()
            .values("id", "name", "email")  # Include relevant workshop details
        )
        return Response(workshops, status=status.HTTP_200_OK)
    
class WorkshopsWithPendingServicesAPIView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, workshop_id):
        try:
            workshop = Workshop.objects.get(id=workshop_id)
        except Workshop.DoesNotExist:
            return Response({"error": "Workshop not found"}, status=status.HTTP_404_NOT_FOUND)

        # Filter custom services of the workshop that are pending approval
        pending_services = WorkshopService.objects.filter(
            workshop=workshop, is_approved=False, admin_service_id__isnull=True
        ).order_by("-created_at")
        serializer = WorkshopServiceSerializer(pending_services, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)



    
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


from rest_framework.permissions import BasePermission
from workshop.models import Workshop

class IsWorkshopUser(BasePermission):
    def has_permission(self, request, view):
        return isinstance(request.user, Workshop)

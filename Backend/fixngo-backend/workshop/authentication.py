from rest_framework_simplejwt.authentication import JWTAuthentication
from workshop.models import Workshop

class WorkshopJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        try:
            user_id = validated_token.get("user_id")
            if not user_id:
                return None
            return Workshop.objects.get(pk=user_id)
        except Workshop.DoesNotExist:
            return None


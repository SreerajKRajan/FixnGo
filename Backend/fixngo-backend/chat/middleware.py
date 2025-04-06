import jwt
from django.conf import settings
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from users.models import User
from workshop.models import Workshop

class JWTAuthMiddleware(BaseMiddleware):
    """
    Middleware to authenticate WebSocket connections using JWT tokens.
    It checks whether the user is a normal user or a workshop user.
    """

    async def __call__(self, scope, receive, send):
        query_string = scope.get("query_string", b"").decode("utf8")
        token = self.extract_token(query_string)

        if token:
            scope["user"] = await self.get_user_from_jwt(token)
        else:
            scope["user"] = AnonymousUser()

        return await super().__call__(scope, receive, send)

    def extract_token(self, query_string):
        """Extract token from query parameters"""
        for param in query_string.split("&"):
            if param.startswith("token="):
                return param.split("=")[1]
        return None

    @database_sync_to_async
    def get_user_from_jwt(self, token):
        """Decode JWT token and return User or Workshop instance."""
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            user_id = payload.get("user_id")
            user_type = payload.get("type", "user")  # Default to user

            if not user_id:
                return AnonymousUser()

            if user_type == "workshop":
                return Workshop.objects.get(id=user_id)
            else:
                return User.objects.get(id=user_id)
        except (jwt.InvalidTokenError, User.DoesNotExist, Workshop.DoesNotExist, KeyError):
            return AnonymousUser()

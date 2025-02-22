from urllib.parse import parse_qs
from channels.middleware import BaseMiddleware
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth import get_user_model
from channels.db import database_sync_to_async
from django.db import close_old_connections

User = get_user_model()

@database_sync_to_async
def get_user(token_key):
    try:
        access_token = AccessToken(token_key)
        user_id = access_token.payload.get('user_id')  # Fix here
        if not user_id:
            return AnonymousUser()

        return User.objects.get(id=user_id)
    except User.DoesNotExist:  # Handle user not found
        return AnonymousUser()
    except Exception as e:  # Catch other errors
        print(f"JWTAuthMiddleware Error: {e}")  # Debugging
        return AnonymousUser()

class JWTAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        query_string = scope.get('query_string', b'').decode()
        query_params = parse_qs(query_string)
        
        token = query_params.get('token', [None])[0]
        
        if token:
            scope['user'] = await get_user(token)
        else:
            scope['user'] = AnonymousUser()

        close_old_connections()  # Prevent database connection leaks
        return await super().__call__(scope, receive, send)

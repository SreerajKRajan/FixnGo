from django.urls import re_path
from .consumers import ChatConsumer, ChatListConsumer

websocket_urlpatterns = [
    re_path(r'ws/chat/(?P<room_name>\w+)/$', ChatConsumer.as_asgi()),
    re_path(r'ws/chat/list/(?P<user_id>\w+)/$', ChatListConsumer.as_asgi()),
]
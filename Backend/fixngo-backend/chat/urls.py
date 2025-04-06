# from django.urls import path
# from .views import ChatThreadsView, ChatMessagesView

# urlpatterns = [
#     path('threads/', ChatThreadsView.as_view(), name='chat-threads'),
#     path('messages/<int:room_id>/', ChatMessagesView.as_view(), name='chat-messages'),
# ]

from django.urls import path
from chat.views import ChatHistoryView

urlpatterns = [
    path("history/<str:room_name>/", ChatHistoryView.as_view(), name="chat-history"),
]

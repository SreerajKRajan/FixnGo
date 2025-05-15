from django.urls import path
from .views import ChatHistoryAPIView, ChatThreadsAPIView

urlpatterns = [
    path('history/<int:user_id>/<int:target_id>/', ChatHistoryAPIView.as_view(), name='chat_history'),
    path('threads/', ChatThreadsAPIView.as_view(), name='chat_threads'),
]
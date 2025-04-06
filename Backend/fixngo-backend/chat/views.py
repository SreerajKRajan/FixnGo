# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated
# from rest_framework.generics import ListAPIView, RetrieveAPIView
# from rest_framework import status
# from chat.models import ChatRoom, Message
# from chat.serializers import ChatRoomSerializer, MessageSerializer
# from workshop.models import Workshop
# from users.models import User

# class ChatThreadsView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         user = request.user
        
#         if hasattr(user, 'username'):  # It's a User
#             threads = ChatRoom.objects.filter(user=user).order_by('-last_message_timestamp')
#         else:  # It's a Workshop
#             threads = ChatRoom.objects.filter(workshop=user).order_by('-last_message_timestamp')
            
#         serializer = ChatRoomSerializer(threads, many=True, context={'request': request})
#         return Response(serializer.data)
        
#     def post(self, request):
#         """Create a new chat thread"""
#         user = request.user
        
#         if hasattr(user, 'username'):  # It's a User
#             workshop_id = request.data.get('workshop_id')
#             if not workshop_id:
#                 return Response({"error": "workshop_id is required"}, status=status.HTTP_400_BAD_REQUEST)
                
#             try:
#                 workshop = Workshop.objects.get(id=workshop_id)
#                 chat_room, created = ChatRoom.objects.get_or_create(user=user, workshop=workshop)
#                 serializer = ChatRoomSerializer(chat_room, context={'request': request})
#                 return Response(serializer.data)
#             except Workshop.DoesNotExist:
#                 return Response({"error": "Workshop not found"}, status=status.HTTP_404_NOT_FOUND)
#         else:  # It's a Workshop
#             user_id = request.data.get('user_id')
#             if not user_id:
#                 return Response({"error": "user_id is required"}, status=status.HTTP_400_BAD_REQUEST)
                
#             try:
#                 chat_user = User.objects.get(id=user_id)
#                 chat_room, created = ChatRoom.objects.get_or_create(user=chat_user, workshop=user)
#                 serializer = ChatRoomSerializer(chat_room, context={'request': request})
#                 return Response(serializer.data)
#             except User.DoesNotExist:
#                 return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

# class ChatMessagesView(ListAPIView):
#     """Get messages for a specific chat room"""
#     serializer_class = MessageSerializer
#     permission_classes = [IsAuthenticated]
    
#     def get_queryset(self):
#         room_id = self.kwargs.get('room_id')
#         user = self.request.user
        
#         try:
#             # Verify user has access to this room
#             if hasattr(user, 'username'):  # It's a User
#                 chat_room = ChatRoom.objects.get(id=room_id, user=user)
#                 # Mark messages as read
#                 Message.objects.filter(chat_room=chat_room, sender_workshop__isnull=False, is_read=False).update(is_read=True)
#                 chat_room.user_unread_count = 0
#                 chat_room.save(update_fields=['user_unread_count'])
#             else:  # It's a Workshop
#                 chat_room = ChatRoom.objects.get(id=room_id, workshop=user)
#                 # Mark messages as read
#                 Message.objects.filter(chat_room=chat_room, sender_user__isnull=False, is_read=False).update(is_read=True)
#                 chat_room.workshop_unread_count = 0
#                 chat_room.save(update_fields=['workshop_unread_count'])
                
#             return Message.objects.filter(chat_room=chat_room).order_by('timestamp')
#         except ChatRoom.DoesNotExist:
#             return Message.objects.none()

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from chat.models import Message
from chat.serializers import MessageSerializer

class ChatHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, room_name):
        messages = Message.objects.filter(room_name=room_name).order_by("timestamp")
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)

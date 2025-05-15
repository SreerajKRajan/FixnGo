from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Message
from .serializers import MessageSerializer
from users.models import User
from workshop.models import Workshop
from django.db.models import Q


class ChatHistoryAPIView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, user_id, target_id):
        """
        Get chat history between a user and another user/workshop
        
        user_id: The ID of the logged-in user
        target_id: The ID of the other user or workshop
        """
        try:
            # Check if the current user has permission to access this chat
            if request.user.id != int(user_id) and not (
                isinstance(request.user, Workshop) and str(request.user.id) == target_id
            ):
                return Response(
                    {"error": "You don't have permission to access this chat"},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Determine if the target is a user or workshop
            target_user = None
            target_workshop = None
            
            # First check if target is a workshop
            target_workshop = Workshop.objects.filter(id=target_id).first()
            
            # If not a workshop, check if it's a user
            if not target_workshop:
                target_user = User.objects.filter(id=target_id).first()
            
            if not target_user and not target_workshop:
                return Response(
                    {"error": "Target user or workshop not found"},
                    status=status.HTTP_404_NOT_FOUND
                )
                
            # Construct the room name based on the convention
            room_name = f"chat_{user_id}_{target_id}"
            
            # Get messages for this room
            messages = Message.objects.filter(room_name=room_name)
            
            # Serialize and return the messages
            serializer = MessageSerializer(messages, many=True)
            return Response(serializer.data)
            
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ChatThreadsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user = request.user
            print(user, 'user', type(user))

            # Fetch messages involving the current user
            if isinstance(user, User):
                messages = Message.objects.filter(
                    Q(sender_user=user) | Q(receiver_user=user)
                ).order_by('room_name', '-timestamp').distinct('room_name')
            else:
                messages = Message.objects.filter(
                    Q(sender_workshop=user) | Q(receiver_workshop=user)
                ).order_by('room_name', '-timestamp').distinct('room_name')

            threads = []
            for msg in messages:
                other_user = None
                other_workshop = None

                if isinstance(user, User):
                    if msg.sender_user and msg.sender_user != user:
                        other_user = msg.sender_user
                    elif msg.receiver_user and msg.receiver_user != user:
                        other_user = msg.receiver_user
                    elif msg.sender_workshop:
                        other_workshop = msg.sender_workshop
                    elif msg.receiver_workshop:
                        other_workshop = msg.receiver_workshop
                else:
                    if msg.sender_workshop and msg.sender_workshop != user:
                        other_workshop = msg.sender_workshop
                    elif msg.receiver_workshop and msg.receiver_workshop != user:
                        other_workshop = msg.receiver_workshop
                    elif msg.sender_user:
                        other_user = msg.sender_user
                    elif msg.receiver_user:
                        other_user = msg.receiver_user

                if not other_user and not other_workshop:
                    continue

                # Count unread messages
                unread_filter = Q(room_name=msg.room_name, is_read=False)
                if isinstance(user, User):
                    unread_filter &= ~Q(sender_user=user)
                else:
                    unread_filter &= ~Q(sender_workshop=user)
                unread_count = Message.objects.filter(unread_filter).count()

                # Build thread response
                if isinstance(user, User):
                    thread = {
                    'id': msg.room_name,
                    'user_details': {
                        'id': other_workshop.id,
                        'name': other_workshop.name,
                        'document': other_workshop.document.url if other_workshop.document and other_workshop.document.name else '/default-avatar.png'
                    } if other_workshop else None,
                    'last_message': msg.message,
                    'last_message_timestamp': msg.timestamp,
                    'unread_count': unread_count,
                    'created_at': msg.timestamp
                }
                else:
                    thread = {
                        'id': msg.room_name,
                        'user_details': {
                            'id': other_user.id,
                            'username': other_user.email,
                            'profile_image_url': getattr(other_user, 'profile_image_url', '')
                        } if other_user else None,
                        'workshop_details': {
                            'id': other_workshop.id,
                            'name': other_workshop.name,
                            'document': other_workshop.document.url if other_workshop.document and other_workshop.document.name else '/default-avatar.png'
                        } if other_workshop else None,
                        'last_message': msg.message,
                        'last_message_timestamp': msg.timestamp,
                        'unread_count': unread_count,
                        'created_at': msg.timestamp
                    }
                threads.append(thread)

            return Response(threads)

        except Exception as e:
            print(e, 'Error fetching threads')
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

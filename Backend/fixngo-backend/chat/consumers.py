# import json
# from channels.generic.websocket import AsyncWebsocketConsumer
# from channels.db import database_sync_to_async
# from chat.models import ChatRoom, Message
# from django.contrib.auth.models import AnonymousUser
# from django.utils import timezone

# class ChatConsumer(AsyncWebsocketConsumer):
#     async def connect(self):
#         self.room_id = self.scope['url_route']['kwargs']['room_name']
#         self.room_group_name = f"chat_{self.room_id}"
        
#         # Check that the user is authenticated
#         if isinstance(self.scope["user"], AnonymousUser):
#             # Close the connection if user isn't authenticated
#             await self.close(code=4003)
#             return
            
#         # Join room group
#         await self.channel_layer.group_add(
#             self.room_group_name,
#             self.channel_name
#         )
        
#         # Check if user has access to this chat room
#         has_access = await self.check_room_access(self.room_id, self.scope["user"])
#         if not has_access:
#             await self.close(code=4004)
#             return
            
#         await self.accept()

#     async def disconnect(self, close_code):
#         # Leave room group on disconnect
#         await self.channel_layer.group_discard(
#             self.room_group_name,
#             self.channel_name
#         )

#     async def receive(self, text_data):
#         try:
#             data = json.loads(text_data)
#             message = data.get("message", "").strip()
            
#             if not message:
#                 return
                
#             # Get the sender info from the authenticated user
#             user = self.scope["user"]
#             if hasattr(user, 'username'):  # It's a User
#                 sender_id = user.id
#                 sender_type = "user"
#             else:  # It's a Workshop
#                 sender_id = user.id
#                 sender_type = "workshop"
            
#             # Save the message in the database
#             chat_room = await self.get_chat_room(self.room_id)
#             if not chat_room:
#                 return
                
#             msg_obj = await self.create_message(chat_room, sender_id, sender_type, message)
            
#             # Also update the chat room with last message
#             await self.update_chat_room_last_message(chat_room, message)

#             # Broadcast the message to the room group
#             await self.channel_layer.group_send(
#                 self.room_group_name,
#                 {
#                     "type": "chat_message",
#                     "message": msg_obj.content,
#                     "sender_id": sender_id,
#                     "sender_type": sender_type,
#                     "timestamp": msg_obj.timestamp.isoformat(),
#                     "message_id": msg_obj.id
#                 }
#             )
#         except json.JSONDecodeError:
#             pass
#         except Exception as e:
#             print(f"Error in receive: {str(e)}")

#     async def chat_message(self, event):
#         # Send message to WebSocket
#         await self.send(text_data=json.dumps({
#             "message": event["message"],
#             "sender_id": event["sender_id"],
#             "sender_type": event["sender_type"],
#             "timestamp": event["timestamp"],
#             "message_id": event["message_id"]
#         }))

#     @database_sync_to_async
#     def get_chat_room(self, room_id):
#         try:
#             return ChatRoom.objects.get(id=room_id)
#         except ChatRoom.DoesNotExist:
#             return None
            
#     @database_sync_to_async
#     def check_room_access(self, room_id, user):
#         try:
#             if hasattr(user, 'username'):  # It's a User
#                 return ChatRoom.objects.filter(id=room_id, user=user).exists()
#             else:  # It's a Workshop
#                 return ChatRoom.objects.filter(id=room_id, workshop=user).exists()
#         except Exception:
#             return False

#     @database_sync_to_async
#     def create_message(self, chat_room, sender_id, sender_type, message):
#         if sender_type == "user":
#             return Message.objects.create(
#                 chat_room=chat_room,
#                 sender_user_id=sender_id,
#                 content=message
#             )
#         else:
#             return Message.objects.create(
#                 chat_room=chat_room,
#                 sender_workshop_id=sender_id,
#                 content=message
#             )
            
#     @database_sync_to_async
#     def update_chat_room_last_message(self, chat_room, message):
#         chat_room.last_message = message
#         chat_room.last_message_timestamp = timezone.now()
#         chat_room.save(update_fields=['last_message', 'last_message_timestamp'])

import json
from channels.generic.websocket import AsyncWebsocketConsumer
from django.utils.timezone import now
from chat.models import Message
from users.models import User
from workshop.models import Workshop
from channels.db import database_sync_to_async

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user_id = self.scope["url_route"]["kwargs"]["user_id"]
        self.workshop_id = self.scope["url_route"]["kwargs"]["workshop_id"]
        self.room_group_name = f"chat_{self.user_id}_{self.workshop_id}"

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data["message"]
        user = self.scope["user"]

        if user.is_authenticated:
            sender_user = user if isinstance(user, User) else None
            sender_workshop = user if isinstance(user, Workshop) else None

            # Extract receiver info from room_name (Assuming format "user_1_workshop_2")
            parts = self.room_name.split("_")
            receiver_user = None
            receiver_workshop = None

            if parts[0] == "user":
                receiver_user = await self.get_user(int(parts[1]))
            elif parts[0] == "workshop":
                receiver_workshop = await self.get_workshop(int(parts[1]))

            # Save message to database
            await self.save_message(sender_user, sender_workshop, receiver_user, receiver_workshop, message)

            # Send message to WebSocket group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "chat_message",
                    "message": message,
                    "username": user.email,
                    "timestamp": str(now()),
                }
            )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event))

    @database_sync_to_async
    def save_message(self, sender_user, sender_workshop, receiver_user, receiver_workshop, message):
        Message.objects.create(
            sender_user=sender_user,
            sender_workshop=sender_workshop,
            receiver_user=receiver_user,
            receiver_workshop=receiver_workshop,
            room_name=self.room_name,
            message=message,
        )

    @database_sync_to_async
    def get_user(self, user_id):
        return User.objects.filter(id=user_id).first()

    @database_sync_to_async
    def get_workshop(self, workshop_id):
        return Workshop.objects.filter(id=workshop_id).first()



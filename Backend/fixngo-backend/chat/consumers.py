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
        self.room_name = f"chat_{self.user_id}_{self.workshop_id}"
        self.room_group_name = self.room_name

        # Join room group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data['message']
        temporary_id = data.get('temporary_id')
        user = self.scope["user"]
        
        if user.is_authenticated:
            # Determine if the authenticated user is a regular user or workshop
            sender_user = user if isinstance(user, User) else None
            sender_workshop = user if isinstance(user, Workshop) else None
            
            # Determine the sender's ID for the message
            sender_id = sender_user.id if sender_user else sender_workshop.id if sender_workshop else None
            
            # Determine receiver (whether it's a user-to-workshop or user-to-user chat)
            receiver_user = None
            receiver_workshop = None
            
            # If sender is a user, the other party is determined by workshop_id
            if sender_user:
                if int(self.workshop_id) > 0:
                    receiver_workshop = await self.get_workshop(int(self.workshop_id))
                else:
                    receiver_user = await self.get_user(int(self.user_id))
            # If sender is a workshop, the receiver is the user
            elif sender_workshop:
                receiver_user = await self.get_user(int(self.user_id))
            
            # Save message to database
            message_obj = await self.save_message(
                sender_user, 
                sender_workshop, 
                receiver_user, 
                receiver_workshop, 
                message
            )
            
            # Send message to room group
            timestamp = now()
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "chat_message",
                    "message": message,
                    "username": user.email,
                    "sender_id": sender_id,
                    "timestamp": str(timestamp),
                    "message_id": message_obj.id if message_obj else None,
                    "temporary_id": temporary_id
                }
            )

    async def chat_message(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps(event))

    @database_sync_to_async
    def save_message(self, sender_user, sender_workshop, receiver_user, receiver_workshop, message):
        return Message.objects.create(
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
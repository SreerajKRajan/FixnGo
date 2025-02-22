import json
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth import get_user_model
from workshop.models import Workshop
from chat.models import ChatRoom, Message
from django.db import transaction
from channels.db import database_sync_to_async

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        if not self.scope["user"].is_authenticated:
            await self.close()
            return

        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = f"chat_{self.room_name}"

        # Join room group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        # Load and send chat history
        messages = await self.get_chat_history()
        await self.send(text_data=json.dumps({
            "type": "chat_history",
            "messages": messages
        }))

    @database_sync_to_async
    def get_chat_history(self):
        try:
            user_id, workshop_id = map(int, self.room_name.split("_"))
            
            # Get or create chat room
            chat_room, _ = ChatRoom.objects.get_or_create(
                user_id=user_id,
                workshop_id=workshop_id
            )
            
            # Get messages for this chat room
            messages = Message.objects.filter(chat_room=chat_room)\
                .select_related('sender_user', 'sender_workshop')\
                .order_by('timestamp')

            return [
                {
                    "message_id": msg.id,
                    "content": msg.content,
                    "sender_id": msg.sender_user.id if msg.sender_user else msg.sender_workshop.id,
                    "sender_name": msg.sender_user.username if msg.sender_user else msg.sender_workshop.name,
                    "timestamp": msg.timestamp.isoformat()
                }
                for msg in messages
            ]
        except (ValueError, Exception) as e:
            print(f"Error getting chat history: {e}")
            return []

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_text = data.get("message")
            receiver_id = data.get("receiver")

            if not message_text or not receiver_id:
                return

            # Get sender and receiver details
            sender = self.scope["user"]
            receiver = await self.get_receiver(receiver_id)

            if not receiver:
                return

            # Save message and get chat room
            saved_message = await self.save_message(sender, receiver, message_text)

            if saved_message:
                # Broadcast message to room group
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "chat_message",
                        "message": saved_message["content"],
                        "sender": saved_message["sender_name"],
                        "timestamp": saved_message["timestamp"],
                        "message_id": saved_message["message_id"]
                    }
                )

        except json.JSONDecodeError:
            print("Invalid JSON received")
        except Exception as e:
            print(f"Error in receive: {e}")

    @database_sync_to_async
    def get_receiver(self, receiver_id):
        try:
            # Try to get user first
            return User.objects.get(id=receiver_id)
        except User.DoesNotExist:
            try:
                # If not user, try to get workshop
                return Workshop.objects.get(id=receiver_id)
            except Workshop.DoesNotExist:
                return None

    @database_sync_to_async
    def save_message(self, sender, receiver, content):
        with transaction.atomic():
            # Determine sender type and get/create chat room
            is_sender_user = isinstance(sender, User)
            is_receiver_user = isinstance(receiver, User)

            chat_room, _ = ChatRoom.objects.get_or_create(
                user=sender if is_sender_user else receiver,
                workshop=receiver if not is_receiver_user else sender
            )

            # Create message
            message = Message.objects.create(
                chat_room=chat_room,
                sender_user=sender if is_sender_user else None,
                sender_workshop=sender if not is_sender_user else None,
                content=content
            )

            return {
                "message_id": message.id,
                "content": message.content,
                "sender_name": sender.username if is_sender_user else sender.name,
                "timestamp": message.timestamp.isoformat()
            }

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            "type": "chat_message",
            "message": event["message"],
            "sender": event["sender"],
            "timestamp": event["timestamp"],
            "message_id": event["message_id"]
        }))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

class ChatListConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        if not self.user.is_authenticated:
            await self.close()
            return

        self.room_group_name = f"chat_list_{self.user.id}"
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        chat_rooms = await self.get_user_chat_rooms()
        await self.send(text_data=json.dumps({
            "type": "chat_rooms",
            "chat_rooms": chat_rooms
        }))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    @database_sync_to_async
    def get_user_chat_rooms(self):
        if hasattr(self.user, "name"):  
            chat_rooms = ChatRoom.objects.filter(workshop=self.user)
        else:
            chat_rooms = ChatRoom.objects.filter(user=self.user)

        rooms_data = []
        for room in chat_rooms:
            other_participant = room.user if room.workshop == self.user else room.workshop
            if other_participant:
                last_message = Message.objects.filter(chat_room=room).order_by("-timestamp").first()
                rooms_data.append({
                    "id": room.id,
                    "name": other_participant.username if isinstance(other_participant, User) else other_participant.name,
                    "last_message": last_message.content if last_message else "",
                    "timestamp": last_message.timestamp.isoformat() if last_message else "",
                    "document": other_participant.document.url if getattr(other_participant, "document", None) else None,
                })

        return rooms_data

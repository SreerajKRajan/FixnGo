from django.db import models
from django.contrib.auth import get_user_model
from workshop.models import Workshop

User = get_user_model()

class ChatRoom(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_chat_rooms")
    workshop = models.ForeignKey(Workshop, on_delete=models.CASCADE, related_name="workshop_chat_rooms")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"ChatRoom(User: {self.user.username}, Workshop: {self.workshop.name})"


class Message(models.Model):
    chat_room = models.ForeignKey(ChatRoom, related_name="messages", on_delete=models.CASCADE)
    sender_user = models.ForeignKey(User, null=True, blank=True, on_delete=models.CASCADE, related_name="sent_messages")
    sender_workshop = models.ForeignKey(Workshop, null=True, blank=True, on_delete=models.CASCADE, related_name="sent_messages")
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        sender = self.sender_user.username if self.sender_user else self.sender_workshop.name
        return f"Message from {sender} at {self.timestamp}"



from django.db import models
from users.models import User
from workshop.models import Workshop
from django.utils import timezone

class Message(models.Model):
    sender_user = models.ForeignKey(User, null=True, blank=True, on_delete=models.CASCADE, related_name="sent_messages")
    sender_workshop = models.ForeignKey(Workshop, null=True, blank=True, on_delete=models.CASCADE, related_name="sent_messages_workshop")
    receiver_user = models.ForeignKey(User, null=True, blank=True, on_delete=models.CASCADE, related_name="received_messages")
    receiver_workshop = models.ForeignKey(Workshop, null=True, blank=True, on_delete=models.CASCADE, related_name="received_messages_workshop")
    room_name = models.CharField(max_length=255)
    message = models.TextField()
    timestamp = models.DateTimeField(default=timezone.now)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.sender_user or self.sender_workshop} -> {self.receiver_user or self.receiver_workshop}: {self.message}"

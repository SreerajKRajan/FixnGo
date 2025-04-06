from rest_framework import serializers
from chat.models import Message

class MessageSerializer(serializers.ModelSerializer):
    sender = serializers.SerializerMethodField()
    receiver = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ["id", "sender", "receiver", "message", "timestamp"]

    def get_sender(self, obj):
        return obj.sender_user.email if obj.sender_user else obj.sender_workshop.email

    def get_receiver(self, obj):
        return obj.receiver_user.email if obj.receiver_user else obj.receiver_workshop.email

from rest_framework import serializers
from .models import Workshop

class WorkshopSignupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workshop
        fields = ['name', 'email', 'location', 'phone', 'password']

    def create(self, validated_data):
        workshop = Workshop.objects.create_workshop(**validated_data)
        return workshop

class WorkshopLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

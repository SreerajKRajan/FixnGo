from rest_framework import serializers
from .models import Workshop, WorkshopService

class WorkshopSignupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workshop
        fields = ['name', 'email', 'location', 'phone', 'password', 'document']
        extra_kwargs = {
            'password': {'write_only': True}  # Ensure password is write-only
        }

    def create(self, validated_data):
        # Pop the password and hash it before saving
        password = validated_data.pop('password')
        workshop = Workshop(**validated_data)
        workshop.set_password(password)  # Hash the password
        workshop.save()
        return workshop

class WorkshopLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

class WorkshopSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workshop
        fields = '__all__'
        

class WorkshopServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkshopService
        fields = ['id', 'workshop', 'name', 'description', 'base_price', 'is_approved', 'service_type', 'created_at', 'updated_at']
        read_only_fields = ['workshop', 'is_approved', 'created_at', 'updated_at']
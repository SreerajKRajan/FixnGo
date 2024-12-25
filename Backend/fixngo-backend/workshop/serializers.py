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
        fields = ['id', 'name', 'description', 'price', 'status', 'created_at', 'updated_at']

    def create(self, validated_data):
        # Automatically set the workshop for the service being created
        workshop = validated_data.get('workshop')
        service = WorkshopService.objects.create(workshop=workshop, **validated_data)
        return service
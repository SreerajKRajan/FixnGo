from rest_framework import serializers
from utils.s3_utils import generate_presigned_url
from .models import Workshop, WorkshopService
from .utils import get_coordinates

class WorkshopSignupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workshop
        fields = ['name', 'email', 'location', 'phone', 'password', 'document']
        extra_kwargs = {
            'password': {'write_only': True}  # Ensure password is write-only
        }

    def create(self, validated_data):
        location = validated_data.get('location')
        latitude, longitude = get_coordinates(location)
        if not latitude or not longitude:
            raise serializers.ValidationError({"location": "Invalid location. Please provide a valid address."})
        # Pop the password and hash it before saving
        password = validated_data.pop('password')
        validated_data['latitude'] = latitude
        validated_data['longitude'] = longitude
        # Save the workshop instance
        workshop = Workshop(**validated_data)
        workshop.set_password(password)  # Hash the password
        workshop.save()
        return workshop

class WorkshopLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

class WorkshopSerializer(serializers.ModelSerializer):
    document = serializers.SerializerMethodField()

    class Meta:
        model = Workshop
        fields = '__all__'

    def get_document(self, obj):
        # Generate the presigned URL for the document
        full_document_path = obj.document.name
        base_url = "https://fixngo-images.s3.eu-north-1.amazonaws.com/"
        document_key = full_document_path.replace(base_url, "")
        return generate_presigned_url(document_key)

        
class WorkshopServiceSerializer(serializers.ModelSerializer):
    admin_service_name = serializers.CharField(source="admin_service.name", read_only=True)
    admin_service_description = serializers.CharField(source="admin_service.description", read_only=True)

    class Meta:
        model = WorkshopService
        fields = [
            'id', 'workshop', 'name', 'description', 'base_price', 'is_approved', 'is_available',
            'service_type', 'created_at', 'updated_at', 'admin_service_name', 'admin_service_description'
        ]
        read_only_fields = ['workshop', 'is_approved', 'created_at', 'updated_at']

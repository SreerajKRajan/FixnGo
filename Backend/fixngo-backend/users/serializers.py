from rest_framework import serializers
from .models import User, ServiceRequest, Payment, Review
from django.contrib.auth import authenticate

class UserSignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'phone', 'password']
    
    def create(self, validated_data):
        user = User(
            username=validated_data['username'],
            email=validated_data['email'],
            phone=validated_data.get('phone', '')
        )
        user.set_password(validated_data['password'])
        user.save()
        return user
    
class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')
    
        # Manually retrieve the user first to check for block status
        try:
            user = User.objects.get(email=email)
            if not user.is_active:
                raise serializers.ValidationError("Your account is blocked. Please contact support.")
        except User.DoesNotExist:
            user = None
    
        # Authenticate the user
        user = authenticate(email=email, password=password)
    
        # Check if the user exists
        if not user:
            raise serializers.ValidationError("Invalid email or password")
    
        # Store the user instance in validated data
        data["user"] = user
        return data


    
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'phone', 'profile_image_url', 'created_at', 'updated_at', 'is_active']
        read_only_fields = ['email', 'created_at', 'updated_at']

    def update(self, instance, validated_data):
        # Only update allowed fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance



class ServiceRequestSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.username", read_only=True)
    workshop_name = serializers.CharField(source="workshop.name", read_only=True)
    workshop_service_name = serializers.CharField(source="workshop_service.name", read_only=True)
    base_price = serializers.CharField(source="workshop_service.base_price", read_only=True)
    class Meta:
        model = ServiceRequest
        fields = ['id', 'user', 'workshop', 'workshop_service', 'user_name', 'workshop_name', 'workshop_service_name', 'base_price', 'total_cost', 'vehicle_type', 'description', 'status', 'created_at', 'updated_at']
        read_only_fields = ['id', 'status', 'created_at', 'updated_at']

class PaymentSerializer(serializers.ModelSerializer):
    service_request_details = serializers.SerializerMethodField()
    
    class Meta:
        model = Payment
        fields = ['id', 'service_request', 'razorpay_order_id', 'razorpay_payment_id', 
                  'amount', 'platform_fee', 'workshop_amount', 'status', 'created_at', 'service_request_details']
    
    def get_service_request_details(self, obj):
        try:
            service_request = obj.service_request
            if service_request:
                return {
                    'id': service_request.id,
                    'workshop_name': service_request.workshop.name if service_request.workshop else "N/A",
                    'workshop_service_name': service_request.workshop_service.name if service_request.workshop_service else "N/A",
                    'vehicle_type': service_request.vehicle_type,
                    'status': service_request.status,
                    'created_at': service_request.created_at
                }
        except ServiceRequest.DoesNotExist:
            pass
        return None
    
    
class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    user_image = serializers.CharField(source='user.profile_image_url', read_only=True)
    
    class Meta:
        model = Review
        fields = ['id', 'user', 'workshop', 'service_request', 'rating', 'text', 
                  'created_at', 'updated_at', 'user_name', 'user_image']
        read_only_fields = ['id', 'created_at', 'updated_at']
from rest_framework import serializers
from .models import User
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
        fields = '__all__'


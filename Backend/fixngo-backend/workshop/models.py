from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.core.validators import FileExtensionValidator
from service.models import Service


class WorkshopManager(BaseUserManager):
    def create_workshop(self, name, email, location, phone, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        workshop = self.model(name=name, email=email, location=location, phone=phone, **extra_fields)
        workshop.set_password(password)
        workshop.save(using=self._db)
        return workshop

class Workshop(AbstractBaseUser):
    name        = models.CharField(max_length=150, unique=True)
    email       = models.EmailField(unique=True)
    location    = models.CharField(max_length=255)
    phone       = models.CharField(max_length=15, unique=True)
    document = models.FileField(max_length=500, validators=[FileExtensionValidator(allowed_extensions=['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'])])
    rejection_reason = models.TextField(blank=True, null=True)
    approval_status = models.CharField(max_length=50, default='pending', choices=[('pending', 'Pending'), ('approved', 'Approved'), ('rejected', 'Rejected')])
    is_verified = models.BooleanField(default=False)
    is_approved = models.BooleanField(default=False)
    password    = models.CharField(max_length=255)
    is_active   = models.BooleanField(default=True)
    is_staff    = models.BooleanField(default=False)
    latitude = models.FloatField()  # Latitude of the workshop
    longitude = models.FloatField()  # Longitude of the workshop

    objects = WorkshopManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name', 'location', 'phone', 'document']

    def __str__(self):
        return self.name


class WorkshopOtp(models.Model):
    workshop = models.ForeignKey(Workshop, on_delete=models.CASCADE)
    otp_code = models.CharField(max_length=4)
    otp_created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"OTP for {self.workshop.email}"


class WorkshopService(models.Model):
    SERVICE_TYPE_CHOICES = [
        ('admin', 'Admin Created'),
        ('workshop', 'Workshop Created')
    ]
    
    workshop = models.ForeignKey(Workshop, on_delete=models.CASCADE, related_name='workshop_services')
    admin_service = models.ForeignKey(Service, on_delete=models.SET_NULL, null=True, blank=True, related_name='linked_workshop_services')
    name = models.CharField(max_length=255)
    description = models.TextField()
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    is_approved = models.BooleanField(default=False)
    service_type = models.CharField(max_length=20, choices=SERVICE_TYPE_CHOICES, default='workshop')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.workshop.name} - {self.name} ({'Approved' if self.is_approved else 'Pending'})"
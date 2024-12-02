from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager

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
    is_verified = models.BooleanField(default=False)
    password    = models.CharField(max_length=255)
    is_active   = models.BooleanField(default=True)
    is_staff    = models.BooleanField(default=False)

    objects = WorkshopManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name', 'location', 'phone']

    def __str__(self):
        return self.name


class WorkshopOtp(models.Model):
    workshop = models.ForeignKey(Workshop, on_delete=models.CASCADE)
    otp_code = models.CharField(max_length=4)
    otp_created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"OTP for {self.workshop.email}"

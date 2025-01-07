from django.db import models

# Create your models here.
class Service(models.Model):
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('unavailable', 'Unavailable'),
    ]
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField()
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(
        max_length=15, choices=STATUS_CHOICES, default='available'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


# Generated by Django 5.1.3 on 2025-06-03 08:07

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0023_payment_platform_fee_payment_workshop_amount'),
    ]

    operations = [
        migrations.AddField(
            model_name='servicerequest',
            name='rejection_reason',
            field=models.TextField(blank=True, null=True),
        ),
    ]

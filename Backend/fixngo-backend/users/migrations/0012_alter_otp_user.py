# Generated by Django 5.1.3 on 2024-12-29 15:18

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0011_remove_otp_email_remove_otp_phone_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='otp',
            name='user',
            field=models.ForeignKey(default=59, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
    ]

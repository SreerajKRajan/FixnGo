# Generated by Django 5.1.3 on 2024-12-29 15:19

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0012_alter_otp_user'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='otp',
            name='user',
        ),
    ]

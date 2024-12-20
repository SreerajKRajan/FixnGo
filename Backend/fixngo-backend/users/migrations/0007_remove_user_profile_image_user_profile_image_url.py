# Generated by Django 5.1.3 on 2024-12-20 10:15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0006_user_profile_image'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='user',
            name='profile_image',
        ),
        migrations.AddField(
            model_name='user',
            name='profile_image_url',
            field=models.URLField(default='https://fixngo-images.s3.eu-north-1.amazonaws.com/media/profile_images/58_Untitled.png', max_length=500),
        ),
    ]

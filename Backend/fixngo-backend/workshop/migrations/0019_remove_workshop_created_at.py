# Generated by Django 5.1.3 on 2025-01-16 12:33

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('workshop', '0018_workshop_created_at'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='workshop',
            name='created_at',
        ),
    ]

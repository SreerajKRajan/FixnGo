# Generated by Django 5.1.3 on 2025-06-03 18:35

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('workshop', '0025_workshop_pending_email_workshopotp_email'),
    ]

    operations = [
        migrations.AlterField(
            model_name='workshopotp',
            name='email',
            field=models.EmailField(max_length=254),
        ),
    ]

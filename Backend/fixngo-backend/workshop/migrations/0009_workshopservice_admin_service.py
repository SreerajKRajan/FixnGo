# Generated by Django 5.1.3 on 2024-12-24 19:35

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('service', '0001_initial'),
        ('workshop', '0008_remove_workshopservice_category_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='workshopservice',
            name='admin_service',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='workshop_services', to='service.service'),
        ),
    ]

# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2017-04-24 01:28
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('rem', '0002_remove_property_other_owners'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='lease',
            name='lessee',
        ),
        migrations.AlterField(
            model_name='contact',
            name='zipcode',
            field=models.CharField(blank=True, max_length=5, null=True),
        ),
    ]
# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2017-04-21 01:57
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('rem', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='property',
            name='other_owners',
        ),
    ]
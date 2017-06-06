# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2017-04-21 01:50
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion
import localflavor.us.models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('contenttypes', '0002_remove_content_type_name'),
    ]

    operations = [
        migrations.CreateModel(
            name='Contact',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(help_text=b'Full name of person or company', max_length=512)),
                ('phone', localflavor.us.models.PhoneNumberField(blank=True, max_length=20, null=True)),
                ('address', models.CharField(blank=True, max_length=512, null=True)),
                ('city', models.CharField(blank=True, max_length=128, null=True)),
                ('state', localflavor.us.models.USStateField(blank=True, max_length=2, null=True)),
                ('zipcode', localflavor.us.models.USZipCodeField(blank=True, max_length=10, null=True)),
                ('object_id', models.PositiveIntegerField()),
                ('content_type', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='contenttypes.ContentType')),
            ],
        ),
        migrations.CreateModel(
            name='County',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=32)),
                ('state', models.CharField(max_length=2)),
            ],
            options={
                'verbose_name_plural': 'counties',
            },
        ),
        migrations.CreateModel(
            name='Document',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=512)),
                ('file', models.FileField(help_text=b'The document itself (e.g. a Word doc, PDF, etc.)', upload_to=b'')),
                ('description', models.TextField(blank=True, null=True)),
                ('created_date', models.DateField(auto_now_add=True)),
                ('object_id', models.PositiveIntegerField()),
                ('content_type', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='contenttypes.ContentType')),
            ],
        ),
        migrations.CreateModel(
            name='InsurancePolicy',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('insurer', models.CharField(max_length=512)),
                ('start_date', models.DateField()),
                ('expiry_date', models.DateField()),
            ],
        ),
        migrations.CreateModel(
            name='Lease',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('description', models.TextField()),
                ('start_date', models.DateField(help_text=b'The start date of the lease')),
                ('end_date', models.DateField(help_text=b'The end date of the lease')),
                ('monthly_rate', models.IntegerField(help_text=b'The dollar amount of the rent per month')),
                ('lessee', models.ForeignKey(help_text=b'Who the property is leased to', on_delete=django.db.models.deletion.CASCADE, to='rem.Contact')),
            ],
        ),
        migrations.CreateModel(
            name='LeaseOption',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('montly_rate', models.IntegerField(blank=True, help_text=b'The amount in dollars of the rent during the option period', null=True)),
                ('start_date', models.DateField()),
                ('end_date', models.DateField()),
                ('lease', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='options', to='rem.Lease')),
            ],
        ),
        migrations.CreateModel(
            name='Note',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('note', models.TextField()),
                ('created_date', models.DateField(auto_now_add=True)),
                ('modified_date', models.DateField(auto_now=True)),
                ('object_id', models.PositiveIntegerField()),
                ('content_type', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='contenttypes.ContentType')),
            ],
        ),
        migrations.CreateModel(
            name='Property',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(help_text=b'A short name for the property', max_length=256)),
                ('description', models.TextField(help_text=b'A longer description of the property.')),
                ('address', models.CharField(blank=True, max_length=1024, null=True)),
                ('city', models.CharField(blank=True, max_length=128, null=True)),
                ('acreage', models.DecimalField(decimal_places=1, max_digits=8)),
                ('prop_type', models.CharField(choices=[(b'Land', b'Land'), (b'Office Building', b'Office Building'), (b'Industrial', b'Industrial'), (b'Residential', b'Residential')], max_length=32, verbose_name=b'Property Type')),
                ('percent_owned', models.DecimalField(decimal_places=3, help_text=b'The percentage that we own together', max_digits=6)),
                ('pin_numbers', models.TextField(help_text=b'The County PIN numbers, one per line')),
                ('latitude', models.DecimalField(blank=True, decimal_places=6, max_digits=9, null=True)),
                ('longitude', models.DecimalField(blank=True, decimal_places=6, max_digits=9, null=True)),
                ('aerial_photo', models.ImageField(blank=True, null=True, upload_to=b'aerial-photos')),
                ('boundary_points', models.TextField(blank=True, null=True)),
                ('desired_rent', models.IntegerField(blank=True, null=True)),
                ('desired_sales_price', models.IntegerField(blank=True, null=True)),
                ('trying_to_sell', models.BooleanField(default=False, verbose_name=b'Trying to Sell')),
                ('county', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='rem.County')),
                ('other_owners', models.ManyToManyField(related_name='properties', to='rem.Contact')),
            ],
            options={
                'verbose_name_plural': 'properties',
            },
        ),
        migrations.AddField(
            model_name='lease',
            name='properties',
            field=models.ManyToManyField(related_name='leases', to='rem.Property'),
        ),
        migrations.AddField(
            model_name='insurancepolicy',
            name='properties',
            field=models.ManyToManyField(related_name='insurance_policies', to='rem.Property'),
        ),
    ]
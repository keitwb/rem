from rest_framework import serializers

from . import models

class PropertySerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Property
        exclude = ()

class LeaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Lease
        exclude = ()


class LeaseOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.LeaseOption
        exclude = ()


class InsurancePolicySerializer(serializers.ModelSerializer):
    class Meta:
        model = models.InsurancePolicy
        exclude = ()


class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Contact
        exclude = ()


class CountySerializer(serializers.ModelSerializer):
    class Meta:
        model = models.County
        exclude = ()


class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Note
        exclude = ()


class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Document
        exclude = ()

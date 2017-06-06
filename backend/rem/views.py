from rest_framework import viewsets

from . import models, serializers


class PropertyViewSet(viewsets.ModelViewSet):
    queryset = models.Property.objects.all()
    serializer_class = serializers.PropertySerializer


class CountyViewSet(viewsets.ModelViewSet):
    queryset = models.County.objects.all()
    serializer_class = serializers.CountySerializer


class LeaseViewSet(viewsets.ModelViewSet):
    queryset = models.Lease.objects.all()
    serializer_class = serializers.LeaseSerializer


class LeaseOptionViewSet(viewsets.ModelViewSet):
    queryset = models.LeaseOption.objects.all()
    serializer_class = serializers.LeaseOptionSerializer


class NoteViewSet(viewsets.ModelViewSet):
    queryset = models.Note.objects.all()
    serializer_class = serializers.NoteSerializer


class DocumentViewSet(viewsets.ModelViewSet):
    queryset = models.Document.objects.all()
    serializer_class = serializers.DocumentSerializer


class ContactViewSet(viewsets.ModelViewSet):
    queryset = models.Contact.objects.all()
    serializer_class = serializers.ContactSerializer


class InsurancePolicyViewSet(viewsets.ModelViewSet):
    queryset = models.InsurancePolicy.objects.all()
    serializer_class = serializers.InsurancePolicySerializer


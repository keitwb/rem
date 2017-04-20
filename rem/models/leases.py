from datetime import date

from django.db import models
from django.contrib.contenttypes.fields import GenericRelation, GenericForeignKey
from django.contrib.contenttypes.models import ContentType

from localflavor.us import models as lf_models


class County(models.Model):
    class Meta:
        verbose_name_plural = "counties"

    name = models.CharField(max_length=32)
    state = models.CharField(max_length=2)

    def __unicode__(self):
        return "%s, %s" % (self.name, self.state)


class Document(models.Model):
    title = models.CharField(max_length=512)
    file = models.FileField(help_text="The document itself (e.g. a Word doc, PDF, etc.)")
    description = models.TextField(null=True, blank=True)
    created_date = models.DateField(auto_now_add=True)

    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')

    def __unicode__(self):
        return self.title


class Note(models.Model):
    note = models.TextField()
    created_date = models.DateField(auto_now_add=True)
    modified_date = models.DateField(auto_now=True)

    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')

    def __unicode__(self):
        return self.note


class Property(models.Model):
    class Meta:
        verbose_name_plural = "properties"

    name = models.CharField(max_length=256,
                                     help_text="A short name for the property")
    description = models.TextField(
        help_text="A longer description of the property.")

    address = models.CharField(null=True, blank=True, max_length=1024)
    city = models.CharField(null=True, blank=True, max_length=128)
    acreage = models.DecimalField(decimal_places=1, max_digits=8)
    county = models.ForeignKey(County)

    PROP_TYPE_CHOICES = ((x, x) for x in [
        'Land',
        'Office Building',
        'Industrial',
        'Residential',
    ])

    prop_type = models.CharField(max_length=32, choices=PROP_TYPE_CHOICES)

    other_owners = models.ManyToManyField('Contact', related_name="properties")
    percent_owned = models.DecimalField(max_digits=6, decimal_places=3,
                                        help_text="The percentage that we own together")

    pin_numbers = models.TextField(help_text="The County PIN numbers, one per line")

    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    aerial_photo = models.ImageField(upload_to="aerial-photos", null=True, blank=True)

    boundary_points = models.TextField(null=True, blank=True)

    desired_rent = models.IntegerField(null=True, blank=True)
    desired_sales_price = models.IntegerField(null=True, blank=True)
    trying_to_sell = models.BooleanField("Trying to Sell", default=False)

    documents = GenericRelation(Document)
    notes = GenericRelation(Note)

    @property
    def leased(self):
        lease = self.latest_lease
        if not lease:
            return False
        else:
            return lease.lease_end_date >= date.today()

    @property
    def latest_lease(self):
        return self.leases.all().order_by('-lease_end_date').first()


class Contact(models.Model):
    name = models.CharField(max_length=512, help_text="Full name of person or company")
    phone = lf_models.PhoneNumberField(max_length=128, null=True, blank=True)
    address = models.CharField(max_length=512, null=True, blank=True)
    city = models.CharField(max_length=128, null=True, blank=True)
    state = lf_models.USStateField(null=True, blank=True)
    zipcode = lf_models.USZipCodeField(null=True, blank=True)

    notes = GenericRelation(Note)


class Lease(models.Model):
    description = models.TextField()
    properties = models.ManyToManyField('Property', related_name='leases')
    lessee = models.ForeignKey('Contact', help_text="Who the property is leased to")
    start_date = models.DateField(help_text="The start date of the lease")
    end_date = models.DateField(help_text="The end date of the lease")
    monthly_rate = models.IntegerField(help_text="The dollar amount of the rent per month")

    documents = GenericRelation(Document)
    notes = GenericRelation(Note)


class LeaseOption(models.Model):
    lease = models.ForeignKey('Lease', related_name='options')
    montly_rate = models.IntegerField(null=True, blank=True,
                               help_text="The amount in dollars of the rent during the option period")
    start_date = models.DateField()
    end_date = models.DateField()

    notes = GenericRelation(Note)


class InsurancePolicy(models.Model):
    properties = models.ManyToManyField('Property', related_name='insurance_policies')
    insurer = models.CharField(max_length=512)

    start_date = models.DateField()
    expiry_date = models.DateField()

    documents = GenericRelation(Document)
    notes = GenericRelation(Note)

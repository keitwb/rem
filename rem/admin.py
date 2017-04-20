from django.contrib import admin
from django.contrib.admin.widgets import AdminFileWidget
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin
from django.contrib.contenttypes.admin import GenericTabularInline
from django.contrib.sites.models import Site
from django.db import models
from django.utils.safestring import mark_safe

from rem import models as rem_models


class REMAdminSite(admin.AdminSite):
    site_header = 'Real Estate Management'
    site_title = 'Real Estate Management'

admin_site = REMAdminSite(name='remadmin')


class AdminImageWidget(AdminFileWidget):
    """
    To use:
        formfield_overrides = {
            models.ImageField: {'widget': AdminImageWidget},
        }
    """
    def render(self, name, value, attrs=None):
        if value.url:
            img_tag = '<img src="%s"><br />' % value.url
        else:
            img_tag = ''
        return mark_safe(img_tag + super(AdminImageWidget,
                                              self).render(name, value, attrs))


class CountyAdmin(admin.ModelAdmin):
    list_display = ('name',)
admin_site.register(rem_models.County, CountyAdmin)


class LeaseInline(GenericTabularInline):
    model = rem_models.Lease
    extra = 0


class DocumentInline(GenericTabularInline):
    model = rem_models.Document
    extra = 0


class NoteInline(GenericTabularInline):
    model = rem_models.Note
    extra = 0


class PropertyAdmin(admin.ModelAdmin):
    def leased(self, obj):
        return obj.leased
    leased.boolean = True

    list_display = ('name', 'leased')
    inlines = [LeaseInline, DocumentInline, NoteInline]

admin_site.register(rem_models.Property, PropertyAdmin)


admin_site.register(User, UserAdmin)
admin_site.register(Site)

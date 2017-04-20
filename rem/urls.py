from django.conf.urls import include, url

from .admin import admin_site


urlpatterns = [
    url(r'', include(admin_site.urls)),
    url(r'^grappelli/', include('grappelli.urls')),
]


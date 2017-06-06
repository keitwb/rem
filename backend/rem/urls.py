from django.conf.urls import include, url

from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r'properties', views.PropertyViewSet)
router.register(r'leases', views.LeaseViewSet)
router.register(r'lease-options', views.LeaseOptionViewSet)
router.register(r'contacts', views.ContactViewSet)
router.register(r'notes', views.NoteViewSet)
router.register(r'documents', views.DocumentViewSet)
router.register(r'insurance-policies', views.InsurancePolicyViewSet)
router.register(r'county', views.CountyViewSet)

urlpatterns = [
    url(r'^', include(router.urls)),
]


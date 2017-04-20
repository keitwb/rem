from django.conf import settings

def google_keys(request):
    return {
        'ga_account': settings.GA_ACCOUNT,
        'google_maps_api_key': settings.GOOGLE_MAPS_API_KEY,
    }

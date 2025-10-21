# urls.py for settings_module
# This file defines the URL patterns for the settings_module app, including API endpoints for managing user settings and preferences.

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserSettingsViewSet,
    UserSettingsHistoryViewSet,
    PreferenceInheritanceLayerViewSet,
    PreferenceSuggestionViewSet,
    UserSensoryThemeViewSet,
    ContextualProfileViewSet,
    PreferenceExternalizationViewSet,
    EphemeralEventPreferenceViewSet,
    PersonaFusionViewSet,
    TranslingualPreferenceViewSet,
    UniversalProfileMappingViewSet,
    BehaviorTriggeredOverlayViewSet,
    MultiUserCompositeViewSet,
    PredictivePreferenceModelViewSet,
    PredictivePreferenceEventViewSet,
)

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r'usersettings', UserSettingsViewSet, basename='usersettings')
router.register(r'usersettingshistory', UserSettingsHistoryViewSet, basename='usersettingshistory')
router.register(r'preferenceinheritance', PreferenceInheritanceLayerViewSet, basename='preferenceinheritance')
router.register(r'preferencesuggestion', PreferenceSuggestionViewSet, basename='preferencesuggestion')
router.register(r'usersensorytheme', UserSensoryThemeViewSet, basename='usersensorytheme')
router.register(r'contextualprofile', ContextualProfileViewSet, basename='contextualprofile')
router.register(r'preferenceexternalization', PreferenceExternalizationViewSet, basename='preferenceexternalization')
router.register(r'ephemeraleventpreference', EphemeralEventPreferenceViewSet, basename='ephemeraleventpreference')
router.register(r'personafusion', PersonaFusionViewSet, basename='personafusion')
router.register(r'translingualpreference', TranslingualPreferenceViewSet, basename='translingualpreference')
router.register(r'universalprofilemapping', UniversalProfileMappingViewSet, basename='universalprofilemapping')
router.register(r'behaviortriggeredoverlay', BehaviorTriggeredOverlayViewSet, basename='behaviortriggeredoverlay')
router.register(r'multiusercomposite', MultiUserCompositeViewSet, basename='multiusercomposite')
router.register(r'predictivepreferencemodel', PredictivePreferenceModelViewSet, basename='predictivepreferencemodel')
router.register(r'predictivepreferenceevent', PredictivePreferenceEventViewSet, basename='predictivepreferenceevent')


# The API URLs are now determined automatically by the router.
urlpatterns = [
    path('', include(router.urls)),
]

# Set the app namespace
app_name = 'settings_module'

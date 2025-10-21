# urls.py for Virtual Studio and Instrument Simulation Module
# This file defines the URL patterns for the virtual studio and instrument simulation module,
# including routing for API endpoints and tenant-specific logic.

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Instantiate the router
router = DefaultRouter()

# Register viewsets with the router
router.register(r'instruments', views.InstrumentViewSet, basename='instrument')
router.register(r'effects', views.EffectViewSet, basename='effect')
router.register(r'sessions', views.StudioSessionViewSet, basename='session')
router.register(r'tracks', views.TrackViewSet, basename='track')
router.register(r'track-instruments', views.TrackInstrumentViewSet, basename='track-instrument')
router.register(r'track-effects', views.TrackEffectViewSet, basename='track-effect')
router.register(r'instrument-presets', views.InstrumentPresetViewSet, basename='instrument-preset')
router.register(r'effect-presets', views.EffectPresetViewSet, basename='effect-preset')
router.register(r'session-templates', views.SessionTemplateViewSet, basename='session-template')
router.register(r'exported-files', views.ExportedFileViewSet, basename='exported-file')
router.register(r'vr-ar-settings', views.VrArSettingViewSet, basename='vr-ar-setting')
router.register(r'ai-suggestions', views.AiSuggestionViewSet, basename='ai-suggestion')
router.register(r'adaptive-automation-events', views.AdaptiveAutomationEventViewSet, basename='adaptive-automation-event')

# Define URL patterns
urlpatterns = [
    path('', include(router.urls)),
    # Remove duplicate explicit URL patterns since they're already included by the router
]

# Set the namespace for the app
app_name = 'virtual_studio'

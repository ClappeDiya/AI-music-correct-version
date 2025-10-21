# urls.py for voice_cloning
# This file defines the URL patterns for the voice cloning module, including API endpoints for managing voice cloning related data.

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    LanguageViewSet,
    EmotionViewSet,
    VoiceCloningSettingsViewSet,
    VoiceRecordingSessionViewSet,
    VoiceSampleViewSet,
    VoiceModelViewSet,
    VoiceModelVersionViewSet,
    VoiceModelPermissionViewSet,
    VoiceModelConsentScopeViewSet,
    VoiceModelUsageLogViewSet,
    VoiceModelAdaptiveEventViewSet,
    VoiceAnalysisViewSet,
)

# Define the app namespace
Voice_Cloning_Module = 'voice_cloning'

# Instantiate the router
router = DefaultRouter()

# Register viewsets with the router
router.register(r'languages', LanguageViewSet, basename='language')
router.register(r'emotions', EmotionViewSet, basename='emotion')
router.register(r'settings', VoiceCloningSettingsViewSet, basename='setting')
router.register(r'recording-sessions', VoiceRecordingSessionViewSet, basename='recording-session')
router.register(r'samples', VoiceSampleViewSet, basename='voice-sample')
router.register(r'models', VoiceModelViewSet, basename='voice-model')
router.register(r'voice-model-versions', VoiceModelVersionViewSet, basename='voice-model-version')
router.register(r'voice-model-permissions', VoiceModelPermissionViewSet, basename='voice-model-permission')
router.register(r'voice-model-consent-scopes', VoiceModelConsentScopeViewSet, basename='voice-model-consent-scope')
router.register(r'voice-model-usage-logs', VoiceModelUsageLogViewSet, basename='voice-model-usage-log')
router.register(r'voice-model-adaptive-events', VoiceModelAdaptiveEventViewSet, basename='voice-model-adaptive-event')
router.register(r'analysis', VoiceAnalysisViewSet, basename='voice-analysis')


# Define URL patterns
urlpatterns = [
    path('', include(router.urls)),
    # Add language-specific route
    path('models/<int:pk>/languages/<str:language_code>/', VoiceModelViewSet.as_view({'delete': 'languages'})),
    # Add settings-related routes
    path('settings/<int:pk>/', VoiceModelViewSet.as_view({'get': 'settings', 'patch': 'settings'})),
    path('settings/<int:pk>/effects/', VoiceModelViewSet.as_view({'patch': 'effects'})),
    path('settings/<int:pk>/languages/', VoiceModelViewSet.as_view({'post': 'languages'})),
    path('settings/<int:pk>/consent/', VoiceModelViewSet.as_view({'patch': 'consent'})),
    path('settings/<int:pk>/data/', VoiceModelViewSet.as_view({'delete': 'data'})),
    # Add analysis-related routes
    path('analyze/<int:pk>/progress/', VoiceAnalysisViewSet.as_view({'get': 'progress'})),
    path('analyze/<int:pk>/results/', VoiceAnalysisViewSet.as_view({'get': 'results'})),
    # Add model events route
    path('models/<int:pk>/events/', VoiceModelViewSet.as_view({'get': 'events', 'post': 'events'})),
]

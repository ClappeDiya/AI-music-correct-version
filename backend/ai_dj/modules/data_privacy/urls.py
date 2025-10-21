from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PrivacySettingsViewSet,
    EphemeralVoiceDataViewSet,
    EmotionalAnalysisLogViewSet,
    DataDeletionRequestViewSet
)

router = DefaultRouter()
router.register(r'privacy-settings', PrivacySettingsViewSet, basename='privacy-settings')
router.register(r'voice-data', EphemeralVoiceDataViewSet, basename='voice-data')
router.register(r'emotional-logs', EmotionalAnalysisLogViewSet, basename='emotional-logs')
router.register(r'deletion-requests', DataDeletionRequestViewSet, basename='deletion-requests')

urlpatterns = [
    path('', include(router.urls)),
]

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    VoiceEmotionViewSet,
    EmotionalMusicPreferenceViewSet,
    EmotionalPlaylistTemplateViewSet,
)

router = DefaultRouter()
router.register(r'emotions', VoiceEmotionViewSet)
router.register(r'preferences', EmotionalMusicPreferenceViewSet)
router.register(r'templates', EmotionalPlaylistTemplateViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

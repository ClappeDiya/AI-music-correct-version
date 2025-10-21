from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ChatSessionViewSet,
    UserPreferenceViewSet,
    MusicFactViewSet,
    ChatPersonalityViewSet
)

router = DefaultRouter()
router.register(r'sessions', ChatSessionViewSet, basename='dj-chat-session')
router.register(r'preferences', UserPreferenceViewSet, basename='dj-chat-preference')
router.register(r'facts', MusicFactViewSet, basename='dj-music-fact')
router.register(r'personalities', ChatPersonalityViewSet, basename='dj-chat-personality')

urlpatterns = [
    path('', include(router.urls)),
]

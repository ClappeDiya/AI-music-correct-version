from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DJSessionViewSet,
    SessionParticipantViewSet,
    TrackRequestViewSet,
    SessionMessageViewSet,
    SessionAnalyticsViewSet,
)

router = DefaultRouter()
router.register(r'sessions', DJSessionViewSet)
router.register(r'participants', SessionParticipantViewSet)
router.register(r'tracks', TrackRequestViewSet)
router.register(r'messages', SessionMessageViewSet)
router.register(r'analytics', SessionAnalyticsViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

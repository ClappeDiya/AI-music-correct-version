from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    EmotionalStateViewSet,
    EmotionalJourneyViewSet,
    JourneyWaypointViewSet,
    SessionJourneyViewSet,
    EmotionalSnapshotViewSet,
    JourneyFeedbackViewSet,
    EmotionalAnalyticsViewSet
)

router = DefaultRouter()
router.register(r'states', EmotionalStateViewSet)
router.register(r'journeys', EmotionalJourneyViewSet)
router.register(r'waypoints', JourneyWaypointViewSet)
router.register(r'sessions', SessionJourneyViewSet)
router.register(r'snapshots', EmotionalSnapshotViewSet)
router.register(r'feedback', JourneyFeedbackViewSet)
router.register(r'analytics', EmotionalAnalyticsViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

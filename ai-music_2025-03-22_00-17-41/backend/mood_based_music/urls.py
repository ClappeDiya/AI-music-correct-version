# urls.py for mood_based_music
# This file defines the URL patterns for the mood_based_music app, including API endpoints for managing moods, custom moods, mood requests, generated tracks, feedback, and profiles.

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    MoodViewSet,
    CustomMoodViewSet,
    MoodRequestViewSet,
    GeneratedMoodTrackViewSet,
    MoodFeedbackViewSet,
    MoodProfileViewSet,
    ExternalMoodReferenceViewSet,
    MoodEmbeddingViewSet,
    ContextualTriggerViewSet,
    LiveMoodSessionViewSet,
    CollaborativeMoodSpaceViewSet,
    AdvancedMoodParameterViewSet,
    MoodPlaylistViewSet,
    MoodMusicViewSet,
)
from .analytics.views import MoodAnalyticsViewSet

# Create a router instance
router = DefaultRouter()

# Register viewsets with the router
router.register(r'moods', MoodViewSet, basename='mood')
router.register(r'custom-moods', CustomMoodViewSet, basename='custom-mood')
router.register(r'mood-requests', MoodRequestViewSet, basename='mood-request')
router.register(r'generated-tracks', GeneratedMoodTrackViewSet, basename='generated-track')
router.register(r'mood-feedback', MoodFeedbackViewSet, basename='mood-feedback')
router.register(r'mood-profiles', MoodProfileViewSet, basename='mood-profile')
router.register(r'external-mood-references', ExternalMoodReferenceViewSet, basename='external-mood-reference')
router.register(r'mood-embeddings', MoodEmbeddingViewSet, basename='mood-embedding')
router.register(r'contextual-triggers', ContextualTriggerViewSet, basename='contextual-trigger')
router.register(r'live-mood-sessions', LiveMoodSessionViewSet, basename='live-mood-session')
router.register(r'collaborative-mood-spaces', CollaborativeMoodSpaceViewSet, basename='collaborative-mood-space')
router.register(r'advanced-mood-parameters', AdvancedMoodParameterViewSet, basename='advanced-mood-parameter')
router.register(r'mood-playlists', MoodPlaylistViewSet, basename='mood-playlist')
router.register(r'mood-music', MoodMusicViewSet, basename='mood-music')
router.register(r'mood-analytics', MoodAnalyticsViewSet, basename='mood-analytics')

# Define URL patterns
urlpatterns = [
    path('', include(router.urls)),
    # Advanced mood endpoints
    path('mood-music/blend/', MoodMusicViewSet.as_view({
        'post': 'create_multi_mood_blend'
    }), name='create-multi-mood-blend'),
    path('mood-music/<int:pk>/emotional-curve/', MoodMusicViewSet.as_view({
        'get': 'emotional_curve'
    }), name='emotional-curve'),
    path('mood-music/<int:pk>/transition/', MoodMusicViewSet.as_view({
        'post': 'update_transition'
    }), name='update-transition'),
    path('mood-music/trending-blends/', MoodMusicViewSet.as_view({
        'get': 'trending_blends'
    }), name='trending-blends'),
]

# Set the app namespace
app_name = 'mood_based_music'

# urls.py for ai_music_generation
# This file defines the URL patterns for the ai_music_generation app,
# including API endpoints for managing LLM providers, music requests, etc.

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views, views_mood_genre, views_collaboration

AI_MUSIC_GENERATION_ENGINE_MODULE = 'ai_music_generation'

# Create a router and register our viewsets with it.
router = DefaultRouter()

# Main API endpoints
router.register(r'llm-providers', views.LLMProviderViewSet, basename='llm-provider')
router.register(r'music-requests', views.AIMusicRequestViewSet, basename='music-request')
router.register(r'ai-music-params', views.AIMusicParamsViewSet, basename='ai-music-params')
router.register(r'generated-tracks', views.GeneratedTrackViewSet, basename='generated-track')
router.register(r'model-usage-logs', views.ModelUsageLogViewSet, basename='model-usage-log')
router.register(r'compositions', views.CompositionViewSet, basename='composition')
router.register(r'genres', views.GenreViewSet, basename='genre')
router.register(r'regions', views.RegionViewSet, basename='region')

# Router-related endpoints
router.register(r'model-capabilities', views.ModelCapabilityViewSet, basename='model-capability')
router.register(r'model-routers', views.ModelRouterViewSet, basename='model-router')
router.register(r'model-router-assignments', views.ModelRouterAssignmentViewSet, basename='model-router-assignment')

# Feedback and learning endpoints
router.register(r'feedback', views.FeedbackViewSet, basename='feedback')
router.register(r'user-preferences', views.UserPreferenceViewSet, basename='user-preference')
router.register(r'ab-tests', views.ABTestViewSet, basename='ab-test')

# Cross-cultural endpoints
router.register(r'music-traditions', views.MusicTraditionViewSet, basename='music-tradition')
router.register(r'cultural-blends', views.CrossCulturalBlendViewSet, basename='cultural-blend')
router.register(r'multilingual-lyrics', views.MultilingualLyricsViewSet, basename='multilingual-lyrics')

# Mood and Genre Blending
router.register(r'mood-timelines', views_mood_genre.MoodTimelineViewSet, basename='mood-timeline')
router.register(r'genre-blends', views_mood_genre.GenreBlendViewSet, basename='genre-blend')
router.register(r'chord-progressions', views_mood_genre.ChordProgressionViewSet, basename='chord-progression')
router.register(r'transition-points', views_mood_genre.TransitionPointViewSet, basename='transition-point')
router.register(r'creative-roles', views_mood_genre.CreativeRoleViewSet, basename='creative-role')
router.register(r'collaborative-sessions', views_mood_genre.CollaborativeSessionViewSet, basename='collaborative-session')

# Collaborative session endpoints
router.register(r'collaborative-sessions-alt', views_collaboration.CollaborativeSessionViewSet, basename='collaborative-session-alt')
router.register(r'creative-roles-alt', views_collaboration.CreativeRoleViewSet, basename='creative-role-alt')
router.register(r'timeline-states', views_collaboration.TimelineStateViewSet, basename='timeline-state')

# Multi-track and arrangement endpoints
router.register(r'track-layers', views.TrackLayerViewSet, basename='track-layer')
router.register(r'arrangement-sections', views.ArrangementSectionViewSet, basename='arrangement-section')
router.register(r'track-automations', views.TrackAutomationViewSet, basename='track-automation')

# Vocal and harmony endpoints
router.register(r'vocal-lines', views.VocalLineViewSet, basename='vocal-line')
router.register(r'harmony-groups', views.HarmonyGroupViewSet, basename='harmony-group')
router.register(r'harmony-voicings', views.HarmonyVoicingViewSet, basename='harmony-voicing')

# Mastering endpoints
router.register(r'mastering-presets', views.MasteringPresetViewSet, basename='mastering-preset')
router.register(r'mastering-sessions', views.MasteringSessionViewSet, basename='mastering-session')

# Cross-module integration endpoints
router.register(r'creative-challenges', views.CreativeChallengeViewSet, basename='creative-challenge')
router.register(r'challenge-submissions', views.ChallengeSubmissionViewSet, basename='challenge-submission')
router.register(r'content-moderation', views.ContentModerationViewSet, basename='content-moderation')

# The API URLs are now determined automatically by the router.
# Additionally, we include the login URLs for the browsable API.
urlpatterns = [
    path('', include(router.urls)),
]

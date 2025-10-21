# urls.py for lyrics_generation
# This file defines the URL patterns for the lyrics_generation app, including API endpoints for managing lyrics-related data.

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create a router instance
router = DefaultRouter()

# Register viewsets with the router
router.register(r'llm-providers', views.LLMProviderViewSet, basename='llm-provider')
router.register(r'lyric-prompts', views.LyricPromptViewSet, basename='lyric-prompt')
router.register(r'lyric-drafts', views.LyricDraftViewSet, basename='lyric-draft')
router.register(r'lyric-edits', views.LyricEditViewSet, basename='lyric-edit')
router.register(r'final-lyrics', views.FinalLyricsViewSet, basename='final-lyrics')
router.register(r'lyric-timelines', views.LyricTimelineViewSet, basename='lyric-timeline')
router.register(r'languages', views.LanguageViewSet, basename='language')
router.register(r'lyric-influencers', views.LyricInfluencerViewSet, basename='lyric-influencer')
router.register(r'lyric-model-versions', views.LyricModelVersionViewSet, basename='lyric-model-version')
router.register(r'lyric-vr-ar-settings', views.LyricVrArSettingsViewSet, basename='lyric-vr-ar-settings')
router.register(r'lyric-signatures', views.LyricSignatureViewSet, basename='lyric-signature')
router.register(r'lyric-adaptive-feedback', views.LyricAdaptiveFeedbackViewSet, basename='lyric-adaptive-feedback')
router.register(r'collaborative-sessions', views.CollaborativeLyricSessionViewSet, basename='collaborative-session')
router.register(r'share-links', views.LyricShareLinkViewSet, basename='share-link')
router.register(r'collaborative-edits', views.CollaborativeEditViewSet, basename='collaborative-edit')

# Define URL patterns
urlpatterns = [
    path('', include(router.urls)),
]

# Set the app namespace
app_name = 'lyrics_generation'

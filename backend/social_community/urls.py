# urls.py for Social and Community Features Module
# This file defines the URL patterns for the social and community features app.

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from rest_framework.routers import DefaultRouter

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r'community-event-categories', views.CommunityEventCategoryViewSet, basename='community-event-category')
router.register(r'posts', views.PostViewSet, basename='post')
router.register(r'post-comments', views.PostCommentViewSet, basename='post-comment')
router.register(r'post-likes', views.PostLikeViewSet, basename='post-like')
router.register(r'user-follows', views.UserFollowViewSet, basename='user-follow')
router.register(r'groups', views.GroupViewSet, basename='group')
router.register(r'group-memberships', views.GroupMembershipViewSet, basename='group-membership')
router.register(r'events', views.EventViewSet, basename='event')
router.register(r'event-participations', views.EventParticipationViewSet, basename='event-participation')
router.register(r'privacy-settings', views.PrivacySettingViewSet, basename='privacy-setting')
router.register(r'moderation-actions', views.ModerationActionViewSet, basename='moderation-action')
router.register(r'ephemeral-presences', views.EphemeralPresenceViewSet, basename='ephemeral-presence')
router.register(r'community-clusters', views.CommunityClusterViewSet, basename='community-cluster')
router.register(r'user-tips', views.UserTipViewSet, basename='user-tip')
router.register(r'translation-suggestions', views.TranslationSuggestionViewSet, basename='translation-suggestion')
router.register(r'analytics', views.AnalyticsViewSet, basename='analytics')
router.register(r'llm', views.LLMViewSet, basename='llm')
router.register(r'track-references', views.TrackReferenceViewSet, basename='track-reference')


# The API URLs are now determined automatically by the router.
urlpatterns = [
    path('', include(router.urls)),
    path('analytics/user/<int:user_id>/', 
         views.AnalyticsViewSet.as_view({'get': 'user_metrics'}),
         name='user-analytics'),
    path('analytics/batch/',
         views.AnalyticsViewSet.as_view({'post': 'batch_events'}),
         name='batch-analytics'),
]

app_name = 'social_community'

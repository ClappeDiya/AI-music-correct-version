# urls.py for Data Analytics and Recommendations Engine Module
# This file defines the URL patterns for the Data Analytics and Recommendations Engine Module,
# mapping URLs to the corresponding viewsets for managing data related to user behavior,
# track analytics, user preferences, recommendations, and other related entities.

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Define the app namespace
app_name = 'data_analytics'

router = DefaultRouter()

# Register viewsets with the router
router.register(r'genres', views.GenreViewSet, basename='genre')
router.register(r'regions', views.RegionViewSet, basename='region')
router.register(r'tracks', views.TrackViewSet, basename='track')
router.register(r'user-behavior-events', views.UserBehaviorEventViewSet, basename='user-behavior-event')
router.register(r'track-analytics', views.TrackAnalyticsAggregateViewSet)
router.register(r'user-preferences', views.UserPreferenceProfileViewSet, basename='user-preferences')
router.register(r'recommendations', views.RecommendationSetViewSet, basename='recommendations')
router.register(r'genre-trends', views.GenreTrendViewSet)
router.register(r'geographic-insights', views.GeographicInsightViewSet)
router.register(r'dashboard-settings', views.DashboardSettingViewSet, basename='dashboard-settings')
router.register(r'streaming-offsets', views.StreamingOffsetViewSet, basename='streaming-offsets')
router.register(r'predictive-outputs', views.PredictiveModelOutputViewSet, basename='predictive-outputs')
router.register(r'knowledge-nodes', views.KnowledgeGraphNodeViewSet, basename='knowledge-nodes')
router.register(r'knowledge-edges', views.KnowledgeGraphEdgeViewSet, basename='knowledge-edges')
router.register(r'experiments', views.ExperimentViewSet, basename='experiments')
router.register(r'experiment-assignments', views.ExperimentAssignmentViewSet, basename='experiment-assignments')
router.register(r'federated-updates', views.FederatedModelUpdateViewSet, basename='federated-updates')
router.register(r'mixing-analytics', views.MixingAnalyticsViewSet, basename='mixing-analytics')
router.register(r'genre-mixing/sessions', views.GenreMixingSessionViewSet)
router.register(r'personafusion', views.PersonaFusionViewSet)
router.register(r'behaviortriggeredoverlay', views.BehaviorTriggeredOverlayViewSet)
router.register(r'multi-user-composites', views.MultiUserCompositeViewSet, basename='multi-user-composites')
router.register(r'predictivepreferencemodel', views.PredictivePreferenceModelViewSet)
router.register(r'predictivepreferenceevent', views.PredictivePreferenceEventViewSet)

# Define URL patterns
urlpatterns = [
    path('api/v1/', include(router.urls)), # API versioning
    # Add any additional URL patterns that are not handled by the router
]

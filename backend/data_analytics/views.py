# views.py for Data Analytics and Recommendations Engine Module
# This file defines the API views for the Data Analytics and Recommendations Engine Module,
# providing endpoints for managing and accessing data related to user behavior, track analytics,
# user preferences, recommendations, and other related entities.

from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from django_filters import rest_framework as filters
from django.core.cache import cache
from django.conf import settings
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.utils.translation import gettext_lazy as _
import logging
from functools import wraps
import hashlib
from rest_framework.pagination import PageNumberPagination
from rest_framework.throttling import UserRateThrottle, AnonRateThrottle
from rest_framework.decorators import action

#from tenants.mixins import TenantAwareMixin, FilterSearchMixin # Assuming these are defined in tenants app
from .mixins import SRLMixin
from .models import (
    Genre,
    Region,
    Track,
    UserBehaviorEvent,
    TrackAnalyticsAggregate,
    UserPreferenceProfile,
    RecommendationSet,
    GenreTrend,
    GeographicInsight,
    DashboardSetting,
    StreamingOffset,
    PredictiveModelOutput,
    KnowledgeGraphNode,
    KnowledgeGraphEdge,
    Experiment,
    ExperimentAssignment,
    FederatedModelUpdate,
    MixingAnalytics,
    GenreMixingSession,
    PersonaFusion,
    BehaviorTriggeredOverlay,
    MultiUserComposite,
    PredictivePreferenceModel,
    PredictivePreferenceEvent,
)
from .serializers import (
    GenreSerializer,
    RegionSerializer,
    TrackSerializer,
    UserBehaviorEventSerializer,
    TrackAnalyticsAggregateSerializer,
    UserPreferenceProfileSerializer,
    RecommendationSetSerializer,
    GenreTrendSerializer,
    GeographicInsightSerializer,
    DashboardSettingSerializer,
    StreamingOffsetSerializer,
    PredictiveModelOutputSerializer,
    KnowledgeGraphNodeSerializer,
    KnowledgeGraphEdgeSerializer,
    ExperimentSerializer,
    ExperimentAssignmentSerializer,
    FederatedModelUpdateSerializer,
    MixingAnalyticsSerializer,
    GenreMixingSessionSerializer,
    PersonaFusionSerializer,
    BehaviorTriggeredOverlaySerializer,
    MultiUserCompositeSerializer,
    PredictivePreferenceModelSerializer,
    PredictivePreferenceEventSerializer,
)
from .permissions import AnalyticsPermission, PersonalDataPermission
from .filters import TrackAnalyticsFilter, GenreTrendFilter
from .pagination import StandardResultsSetPagination

logger = logging.getLogger(__name__)

class AnalyticsRateThrottle(UserRateThrottle):
    rate = '1000/day'

class AnonAnalyticsRateThrottle(AnonRateThrottle):
    rate = '100/day'

class BaseSRLViewSet(SRLMixin, viewsets.ModelViewSet):
    """
    Base viewset that implements Security Role Level (SRL) access control.
    """
    pagination_class = StandardResultsSetPagination
    throttle_classes = [AnalyticsRateThrottle, AnonAnalyticsRateThrottle]
    cache_timeout = 60 * 15  # 15 minutes by default
    
    def get_cache_key(self, request):
        """Generate a cache key based on the request."""
        url = request.get_full_path()
        user_id = request.user.id if request.user.is_authenticated else 'anon'
        cache_key = f'analytics_cache:{user_id}:{url}'
        return hashlib.md5(cache_key.encode()).hexdigest()

    @method_decorator(cache_page(60 * 15))
    def list(self, request, *args, **kwargs):
        cache_key = self.get_cache_key(request)
        cached_data = cache.get(cache_key)

        if cached_data is not None:
            return Response(cached_data)

        try:
            logger.info(f"User {request.user.id}: Listing {self.serializer_class.__name__}")
            response = super().list(request, *args, **kwargs)
            cache.set(cache_key, response.data, self.cache_timeout)
            return response
        except Exception as e:
            logger.error(f"User {request.user.id}: Error listing {self.serializer_class.__name__}: {e}", exc_info=True)
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def create(self, request, *args, **kwargs):
        try:
            logger.info(f"User {request.user.id}: Creating {self.serializer_class.__name__}")
            response = super().create(request, *args, **kwargs)
            return response
        except Exception as e:
            logger.error(f"User {request.user.id}: Error creating {self.serializer_class.__name__}: {e}", exc_info=True)
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def update(self, request, *args, **kwargs):
        try:
            logger.info(f"User {request.user.id}: Updating {self.serializer_class.__name__}")
            response = super().update(request, *args, **kwargs)
            return response
        except Exception as e:
            logger.error(f"User {request.user.id}: Error updating {self.serializer_class.__name__}: {e}", exc_info=True)
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def destroy(self, request, *args, **kwargs):
        try:
            logger.info(f"User {request.user.id}: Deleting {self.serializer_class.__name__}")
            response = super().destroy(request, *args, **kwargs)
            return response
        except Exception as e:
            logger.error(f"User {request.user.id}: Error deleting {self.serializer_class.__name__}: {e}", exc_info=True)
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def retrieve(self, request, *args, **kwargs):
        cache_key = self.get_cache_key(request)
        cached_data = cache.get(cache_key)

        if cached_data is not None:
            return Response(cached_data)

        response = super().retrieve(request, *args, **kwargs)
        cache.set(cache_key, response.data, self.cache_timeout)
        return response

class GenreViewSet(BaseSRLViewSet):
    """
    ViewSet for managing genres with role-based access control.
    """
    queryset = Genre.objects.all()
    serializer_class = GenreSerializer
    required_roles = ['data_analyst', 'admin']  # Example roles
    filter_fields = ['genre_name']
    search_fields = ['genre_name', 'description']

class RegionViewSet(BaseSRLViewSet):
    """
    ViewSet for managing regions.
    """
    queryset = Region.objects.all()
    serializer_class = RegionSerializer
    required_roles = ['data_analyst', 'admin']
    filter_fields = ['region_code']
    search_fields = ['region_code', 'region_name']

class TrackViewSet(BaseSRLViewSet):
    """
    ViewSet for managing tracks.
    """
    queryset = Track.objects.all()
    serializer_class = TrackSerializer
    filter_fields = ['title', 'artist']
    search_fields = ['title', 'artist']

class UserBehaviorEventViewSet(BaseSRLViewSet):
    """
    ViewSet for managing user behavior events.
    """
    queryset = UserBehaviorEvent.objects.all()
    serializer_class = UserBehaviorEventSerializer
    filter_fields = ['user_id', 'event_type', 'occurred_at']
    search_fields = ['user_id__username', 'event_type']

class TrackAnalyticsAggregateViewSet(SRLMixin, viewsets.ModelViewSet):
    """
    ViewSet for track analytics data.
    """
    queryset = TrackAnalyticsAggregate.objects.all()
    serializer_class = TrackAnalyticsAggregateSerializer
    permission_classes = [AnalyticsPermission]
    filterset_class = TrackAnalyticsFilter
    pagination_class = StandardResultsSetPagination

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get summarized analytics data"""
        queryset = self.filter_queryset(self.get_queryset())
        summary = queryset.get_summary()
        return Response(summary)

class UserPreferenceProfileViewSet(BaseSRLViewSet):
    """
    ViewSet for managing user preference profiles.
    """
    queryset = UserPreferenceProfile.objects.all()
    serializer_class = UserPreferenceProfileSerializer
    filter_fields = ['user_id']
    search_fields = ['user_id__username']

class RecommendationSetViewSet(BaseSRLViewSet):
    """
    ViewSet for managing recommendation sets.
    """
    queryset = RecommendationSet.objects.all()
    serializer_class = RecommendationSetSerializer
    filter_fields = ['user_id', 'generated_at']
    search_fields = ['user_id__username']

class GenreTrendViewSet(SRLMixin, viewsets.ModelViewSet):
    """
    ViewSet for genre trends.
    """
    queryset = GenreTrend.objects.all()
    serializer_class = GenreTrendSerializer
    permission_classes = [AnalyticsPermission]
    filterset_class = GenreTrendFilter
    pagination_class = StandardResultsSetPagination

class GeographicInsightViewSet(SRLMixin, viewsets.ModelViewSet):
    """
    ViewSet for geographic insights.
    """
    queryset = GeographicInsight.objects.all()
    serializer_class = GeographicInsightSerializer
    permission_classes = [AnalyticsPermission]
    pagination_class = StandardResultsSetPagination

class DashboardSettingViewSet(BaseSRLViewSet):
    """
    ViewSet for managing dashboard settings.
    """
    queryset = DashboardSetting.objects.all()
    serializer_class = DashboardSettingSerializer
    filter_fields = ['user_id']
    search_fields = ['user_id__username']

class StreamingOffsetViewSet(BaseSRLViewSet):
    """
    ViewSet for managing streaming offsets.
    """
    queryset = StreamingOffset.objects.all()
    serializer_class = StreamingOffsetSerializer
    required_roles = ['data_analyst', 'admin']
    filter_fields = ['source_name', 'partition_id']
    search_fields = ['source_name']

class PredictiveModelOutputViewSet(BaseSRLViewSet):
    """
    ViewSet for managing predictive model outputs.
    """
    queryset = PredictiveModelOutput.objects.all()
    serializer_class = PredictiveModelOutputSerializer
    filter_fields = ['user_id', 'track_id', 'model_version']
    search_fields = ['user_id__username', 'model_version']

class KnowledgeGraphNodeViewSet(BaseSRLViewSet):
    """
    ViewSet for managing knowledge graph nodes.
    """
    queryset = KnowledgeGraphNode.objects.all()
    serializer_class = KnowledgeGraphNodeSerializer
    required_roles = ['data_analyst', 'admin']
    filter_fields = ['node_type', 'node_ref_id']
    search_fields = ['node_type']

class KnowledgeGraphEdgeViewSet(BaseSRLViewSet):
    """
    ViewSet for managing knowledge graph edges.
    """
    queryset = KnowledgeGraphEdge.objects.all()
    serializer_class = KnowledgeGraphEdgeSerializer
    required_roles = ['data_analyst', 'admin']
    filter_fields = ['from_node_id', 'to_node_id', 'edge_type']
    search_fields = ['edge_type']

class ExperimentViewSet(BaseSRLViewSet):
    """
    ViewSet for managing experiments.
    """
    queryset = Experiment.objects.all()
    serializer_class = ExperimentSerializer
    required_roles = ['data_analyst', 'admin']
    filter_fields = ['experiment_name']
    search_fields = ['experiment_name', 'description']

class ExperimentAssignmentViewSet(BaseSRLViewSet):
    """
    ViewSet for managing experiment assignments.
    """
    queryset = ExperimentAssignment.objects.all()
    serializer_class = ExperimentAssignmentSerializer
    filter_fields = ['experiment_id', 'user_id']
    search_fields = ['user_id__username']

class FederatedModelUpdateViewSet(BaseSRLViewSet):
    """
    ViewSet for managing federated model updates.
    """
    queryset = FederatedModelUpdate.objects.all()
    serializer_class = FederatedModelUpdateSerializer
    filter_fields = ['user_id', 'round_number']
    search_fields = ['user_id__username']

class MixingAnalyticsViewSet(BaseSRLViewSet):
    """
    ViewSet for managing mixing analytics data.
    """
    queryset = MixingAnalytics.objects.all()
    serializer_class = MixingAnalyticsSerializer
    filter_fields = ['user_id', 'session_id', 'event_type']
    search_fields = ['session_id']
    ordering_fields = ['created_at']

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class GenreMixingSessionViewSet(SRLMixin, viewsets.ModelViewSet):
    """
    ViewSet for genre mixing sessions.
    """
    queryset = GenreMixingSession.objects.all()
    serializer_class = GenreMixingSessionSerializer
    permission_classes = [PersonalDataPermission]
    pagination_class = StandardResultsSetPagination

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Update session status"""
        session = self.get_object()
        new_status = request.data.get('status')
        if new_status:
            session.status = new_status
            session.save()
            return Response(self.get_serializer(session).data)
        return Response({'error': 'Status required'}, status=400)

class PersonaFusionViewSet(SRLMixin, viewsets.ModelViewSet):
    """
    ViewSet for persona fusion.
    """
    queryset = PersonaFusion.objects.all()
    serializer_class = PersonaFusionSerializer
    permission_classes = [PersonalDataPermission]
    pagination_class = StandardResultsSetPagination

    @action(detail=True, methods=['post'])
    def update_preferences(self, request, pk=None):
        """Update persona preferences"""
        persona = self.get_object()
        preferences = request.data.get('preferences')
        if preferences:
            persona.update_preferences(preferences)
            return Response(self.get_serializer(persona).data)
        return Response({'error': 'Preferences required'}, status=400)

class BehaviorTriggeredOverlayViewSet(SRLMixin, viewsets.ModelViewSet):
    """
    ViewSet for behavior triggered overlays.
    """
    queryset = BehaviorTriggeredOverlay.objects.all()
    serializer_class = BehaviorTriggeredOverlaySerializer
    permission_classes = [PersonalDataPermission]
    pagination_class = StandardResultsSetPagination

    @action(detail=True, methods=['post'])
    def toggle(self, request, pk=None):
        """Toggle overlay active status"""
        overlay = self.get_object()
        overlay.active = not overlay.active
        overlay.save()
        return Response(self.get_serializer(overlay).data)

class MultiUserCompositeViewSet(BaseSRLViewSet):
    """
    ViewSet for managing multi-user composites.
    """
    queryset = MultiUserComposite.objects.all()
    serializer_class = MultiUserCompositeSerializer
    filter_fields = ['composite_type', 'status']
    search_fields = ['composite_type']
    ordering_fields = ['created_at']

    @action(detail=True, methods=['post'])
    def add_user(self, request, pk=None):
        composite = self.get_object()
        user_id = request.data.get('user_id')
        if user_id:
            composite.users.add(user_id)
            return Response(self.get_serializer(composite).data)
        return Response({'error': 'user_id required'}, status=400)

class PredictivePreferenceModelViewSet(SRLMixin, viewsets.ModelViewSet):
    """
    ViewSet for predictive preference models.
    """
    queryset = PredictivePreferenceModel.objects.all()
    serializer_class = PredictivePreferenceModelSerializer
    permission_classes = [PersonalDataPermission]
    pagination_class = StandardResultsSetPagination

class PredictivePreferenceEventViewSet(SRLMixin, viewsets.ModelViewSet):
    """
    ViewSet for predictive preference events.
    """
    queryset = PredictivePreferenceEvent.objects.all()
    serializer_class = PredictivePreferenceEventSerializer
    permission_classes = [PersonalDataPermission]
    pagination_class = StandardResultsSetPagination

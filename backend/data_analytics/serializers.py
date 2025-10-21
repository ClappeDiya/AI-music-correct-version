from rest_framework import serializers
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
from user_management.serializers import UserSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

# Shared Serializers (assuming these are defined elsewhere, e.g., in a 'shared' app)
# from shared.serializers import GenreSerializer, RegionSerializer, TrackSerializer # Assuming these exist in a shared app

class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ['id', 'genre_name', 'description', 'created_at']
        read_only_fields = ['created_at']

    def validate(self, data):
        user = self.context['request'].user
        if not user.groups.filter(name__in=['data_analyst', 'admin']).exists():
            raise serializers.ValidationError("Insufficient permissions")
        return data

class RegionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Region
        fields = ['id', 'region_code', 'region_name', 'created_at']
        read_only_fields = ['created_at']

    def validate(self, data):
        user = self.context['request'].user
        if not user.groups.filter(name__in=['data_analyst', 'admin']).exists():
            raise serializers.ValidationError("Insufficient permissions")
        return data

class TrackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Track
        fields = ['id', 'title', 'artist', 'created_at']
        read_only_fields = ['created_at']

class UserBehaviorEventSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = UserBehaviorEvent
        fields = ['id', 'user', 'event_type', 'related_track_id', 'related_artist_id', 
                 'event_metadata', 'occurred_at']
        read_only_fields = ['occurred_at']

class TrackAnalyticsAggregateSerializer(serializers.ModelSerializer):
    track = TrackSerializer(read_only=True)
    
    class Meta:
        model = TrackAnalyticsAggregate
        fields = ['id', 'track', 'aggregate_data', 'last_updated']
        read_only_fields = ['last_updated']

class UserPreferenceProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = UserPreferenceProfile
        fields = ['id', 'user', 'preference_vector', 'metadata', 'updated_at']
        read_only_fields = ['id', 'updated_at']

class RecommendationSetSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = RecommendationSet
        fields = ['id', 'user', 'recommendation_data', 'generated_at']
        read_only_fields = ['id', 'generated_at']

class GenreTrendSerializer(serializers.ModelSerializer):
    class Meta:
        model = GenreTrend
        fields = ['id', 'genre_id', 'trend_data', 'last_updated']
        read_only_fields = ['id', 'last_updated']

class GeographicInsightSerializer(serializers.ModelSerializer):
    class Meta:
        model = GeographicInsight
        fields = ['id', 'region_id', 'insight_data', 'last_updated']
        read_only_fields = ['id', 'last_updated']

class DashboardSettingSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = DashboardSetting
        fields = ['id', 'user', 'settings', 'updated_at']
        read_only_fields = ['id', 'updated_at']

class StreamingOffsetSerializer(serializers.ModelSerializer):
    class Meta:
        model = StreamingOffset
        fields = ['id', 'source_name', 'partition_id', 'offset_position', 'updated_at']
        read_only_fields = ['id', 'updated_at']

class PredictiveModelOutputSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = PredictiveModelOutput
        fields = ['id', 'user', 'track_id', 'prediction_data', 'model_version', 'predicted_at']
        read_only_fields = ['id', 'predicted_at']

class KnowledgeGraphNodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = KnowledgeGraphNode
        fields = ['id', 'node_type', 'node_ref_id', 'properties', 'created_at']
        read_only_fields = ['id', 'created_at']

class KnowledgeGraphEdgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = KnowledgeGraphEdge
        fields = ['id', 'from_node_id', 'to_node_id', 'edge_type', 'weight']
        read_only_fields = ['id']

class ExperimentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experiment
        fields = ['id', 'experiment_name', 'description', 'variants', 'created_at']
        read_only_fields = ['id', 'created_at']

class ExperimentAssignmentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = ExperimentAssignment
        fields = ['id', 'experiment_id', 'user', 'assigned_variant', 'assigned_at']
        read_only_fields = ['id', 'assigned_at']

class FederatedModelUpdateSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = FederatedModelUpdate
        fields = ['id', 'user', 'update_data', 'round_number', 'updated_at']
        read_only_fields = ['id', 'updated_at']

class MixingAnalyticsSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = MixingAnalytics
        fields = ['id', 'user', 'session_id', 'event_type', 'duration', 
                 'genre_weights', 'effects_used', 'performance_metrics', 'created_at']
        read_only_fields = ['id', 'created_at']

class GenreMixingSessionSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = GenreMixingSession
        fields = ['id', 'user', 'status', 'genres', 'duration', 'output_format',
                 'analysis_results', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class PersonaFusionSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = PersonaFusion
        fields = ['id', 'user', 'persona_type', 'preferences', 'active_timeframe',
                 'settings', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class BehaviorTriggeredOverlaySerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = BehaviorTriggeredOverlay
        fields = ['id', 'user', 'trigger_type', 'conditions', 'overlay',
                 'active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class MultiUserCompositeSerializer(serializers.ModelSerializer):
    users = UserSerializer(many=True, read_only=True)
    
    class Meta:
        model = MultiUserComposite
        fields = ['id', 'users', 'composite_type', 'weights', 'settings',
                 'status', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class PredictivePreferenceModelSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = PredictivePreferenceModel
        fields = ['id', 'user', 'model_version', 'predictions', 'last_updated',
                 'created_at']
        read_only_fields = ['id', 'created_at']

class PredictivePreferenceEventSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = PredictivePreferenceEvent
        fields = ['id', 'user', 'event_type', 'prediction', 'context', 'created_at']
        read_only_fields = ['id', 'created_at']

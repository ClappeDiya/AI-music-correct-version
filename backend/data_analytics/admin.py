from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from django.conf import settings
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
    PredictivePreferenceEvent
)


@admin.register(Genre)
class GenreAdmin(admin.ModelAdmin):
    """
    Admin class for managing genres.
    """
    list_display = ('id', 'genre_name', 'created_by', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('genre_name', 'description')
    readonly_fields = ('created_at',)


@admin.register(Region)
class RegionAdmin(admin.ModelAdmin):
    """
    Admin class for managing regions.
    """
    list_display = ('id', 'region_code', 'region_name', 'created_by', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('region_code', 'region_name')
    readonly_fields = ('created_at',)


@admin.register(Track)
class TrackAdmin(admin.ModelAdmin):
    """
    Admin class for managing tracks.
    """
    list_display = ('id', 'title', 'artist', 'created_by', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('title', 'artist')
    readonly_fields = ('created_at',)


@admin.register(UserBehaviorEvent)
class UserBehaviorEventAdmin(admin.ModelAdmin):
    """
    Admin class for managing user behavior events.
    """
    list_display = ('id', 'user', 'event_type', 'related_track_id', 'occurred_at')
    list_filter = ('event_type', 'occurred_at')
    search_fields = ('user__username', 'event_type')
    readonly_fields = ('occurred_at',)


@admin.register(TrackAnalyticsAggregate)
class TrackAnalyticsAggregateAdmin(admin.ModelAdmin):
    """
    Admin class for managing track analytics aggregates.
    """
    list_display = ('id', 'track', 'updated_by', 'last_updated')
    list_filter = ('last_updated',)
    search_fields = ('track__title',)
    readonly_fields = ('last_updated',)


@admin.register(UserPreferenceProfile)
class UserPreferenceProfileAdmin(admin.ModelAdmin):
    """
    Admin class for managing user preference profiles.
    """
    list_display = ('id', 'user', 'updated_at')
    list_filter = ('updated_at',)
    search_fields = ('user__username',)
    readonly_fields = ('updated_at',)


@admin.register(RecommendationSet)
class RecommendationSetAdmin(admin.ModelAdmin):
    """
    Admin class for managing recommendation sets.
    """
    list_display = ('id', 'user', 'generated_by', 'generated_at')
    list_filter = ('generated_at',)
    search_fields = ('user__username',)
    readonly_fields = ('generated_at',)


@admin.register(GenreTrend)
class GenreTrendAdmin(admin.ModelAdmin):
    """
    Admin class for managing genre trends.
    """
    list_display = ('id', 'genre', 'updated_by', 'last_updated')
    list_filter = ('last_updated',)
    search_fields = ('genre__genre_name',)
    readonly_fields = ('last_updated',)


@admin.register(GeographicInsight)
class GeographicInsightAdmin(admin.ModelAdmin):
    """
    Admin class for managing geographic insights.
    """
    list_display = ('id', 'region', 'updated_by', 'last_updated')
    list_filter = ('last_updated',)
    search_fields = ('region__region_code',)
    readonly_fields = ('last_updated',)


@admin.register(DashboardSetting)
class DashboardSettingAdmin(admin.ModelAdmin):
    """
    Admin class for managing dashboard settings.
    """
    list_display = ('id', 'user', 'updated_at')
    list_filter = ('updated_at',)
    search_fields = ('user__username',)
    readonly_fields = ('updated_at',)


@admin.register(StreamingOffset)
class StreamingOffsetAdmin(admin.ModelAdmin):
    """
    Admin class for managing streaming offsets.
    """
    list_display = ('id', 'source_name', 'partition_id', 'offset_position', 'updated_by', 'updated_at')
    list_filter = ('source_name', 'updated_at')
    search_fields = ('source_name',)
    readonly_fields = ('updated_at',)


@admin.register(PredictiveModelOutput)
class PredictiveModelOutputAdmin(admin.ModelAdmin):
    """
    Admin class for managing predictive model outputs.
    """
    list_display = ('id', 'user', 'track', 'model_version', 'predicted_by', 'predicted_at')
    list_filter = ('model_version', 'predicted_at')
    search_fields = ('user__username', 'track__title')
    readonly_fields = ('predicted_at',)


@admin.register(KnowledgeGraphNode)
class KnowledgeGraphNodeAdmin(admin.ModelAdmin):
    """
    Admin class for managing knowledge graph nodes.
    """
    list_display = ('id', 'node_type', 'node_ref_id', 'created_by', 'created_at')
    list_filter = ('node_type', 'created_at')
    search_fields = ('node_type',)
    readonly_fields = ('created_at',)


@admin.register(KnowledgeGraphEdge)
class KnowledgeGraphEdgeAdmin(admin.ModelAdmin):
    """
    Admin class for managing knowledge graph edges.
    """
    list_display = ('id', 'from_node', 'to_node', 'edge_type', 'weight', 'created_by')
    list_filter = ('edge_type',)
    search_fields = ('edge_type',)


@admin.register(Experiment)
class ExperimentAdmin(admin.ModelAdmin):
    """
    Admin class for managing experiments.
    """
    list_display = ('id', 'experiment_name', 'created_by', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('experiment_name', 'description')
    readonly_fields = ('created_at',)
    filter_horizontal = ('group_access',)


@admin.register(ExperimentAssignment)
class ExperimentAssignmentAdmin(admin.ModelAdmin):
    """
    Admin class for managing experiment assignments.
    """
    list_display = ('id', 'experiment', 'user', 'assigned_variant', 'assigned_by', 'assigned_at')
    list_filter = ('assigned_at',)
    search_fields = ('experiment__experiment_name', 'user__username')
    readonly_fields = ('assigned_at',)


@admin.register(FederatedModelUpdate)
class FederatedModelUpdateAdmin(admin.ModelAdmin):
    """
    Admin class for managing federated model updates.
    """
    list_display = ('id', 'user', 'round_number', 'validation_status', 'validated_by', 'updated_at')
    list_filter = ('validation_status', 'round_number', 'updated_at')
    search_fields = ('user__username',)
    readonly_fields = ('updated_at',)


@admin.register(MixingAnalytics)
class MixingAnalyticsAdmin(admin.ModelAdmin):
    """
    Admin interface for mixing analytics data.
    """
    list_display = ('id', 'user', 'session_id', 'event_type', 'duration', 'created_at')
    list_filter = ('event_type', 'created_at')
    search_fields = ('user__username', 'session_id')
    readonly_fields = ('created_at',)


@admin.register(GenreMixingSession)
class GenreMixingSessionAdmin(admin.ModelAdmin):
    """
    Admin interface for genre mixing sessions.
    """
    list_display = ('id', 'user', 'status', 'duration', 'output_format', 'created_at', 'updated_at')
    list_filter = ('status', 'output_format', 'created_at')
    search_fields = ('user__username',)
    readonly_fields = ('created_at', 'updated_at')


@admin.register(PersonaFusion)
class PersonaFusionAdmin(admin.ModelAdmin):
    """
    Admin interface for persona fusion profiles.
    """
    list_display = ('id', 'user', 'persona_type', 'created_at', 'updated_at')
    list_filter = ('persona_type', 'created_at')
    search_fields = ('user__username', 'persona_type')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(BehaviorTriggeredOverlay)
class BehaviorTriggeredOverlayAdmin(admin.ModelAdmin):
    """
    Admin interface for behavior triggered overlays.
    """
    list_display = ('id', 'user', 'trigger_type', 'active', 'created_at', 'updated_at')
    list_filter = ('trigger_type', 'active', 'created_at')
    search_fields = ('user__username', 'trigger_type')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(MultiUserComposite)
class MultiUserCompositeAdmin(admin.ModelAdmin):
    """
    Admin interface for multi-user composites.
    """
    list_display = ('id', 'composite_type', 'status', 'created_at', 'updated_at')
    list_filter = ('composite_type', 'status', 'created_at')
    search_fields = ('composite_type',)
    readonly_fields = ('created_at', 'updated_at')
    filter_horizontal = ('users',)


@admin.register(PredictivePreferenceModel)
class PredictivePreferenceModelAdmin(admin.ModelAdmin):
    """
    Admin interface for predictive preference models.
    """
    list_display = ('id', 'user', 'model_version', 'last_updated', 'created_at')
    list_filter = ('model_version', 'last_updated', 'created_at')
    search_fields = ('user__username', 'model_version')
    readonly_fields = ('created_at',)


@admin.register(PredictivePreferenceEvent)
class PredictivePreferenceEventAdmin(admin.ModelAdmin):
    """
    Admin interface for predictive preference events.
    """
    list_display = ('id', 'user', 'event_type', 'created_at')
    list_filter = ('event_type', 'created_at')
    search_fields = ('user__username', 'event_type')
    readonly_fields = ('created_at',)

    def has_add_permission(self, request):
        # Events should only be created through the API
        return False

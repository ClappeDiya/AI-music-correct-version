from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from django.db.models import JSONField
from django.db.models import ForeignKey
import uuid
from django.contrib.auth import get_user_model

User = get_user_model()

# Shared Models (assuming these are defined elsewhere, e.g., in a 'shared' app)
# from shared.models import Genre, Region, Track # Assuming these exist in a shared app

class Genre(models.Model):
    id = models.BigAutoField(primary_key=True)
    genre_name = models.TextField(unique=True, verbose_name=_("Genre Name"))
    description = models.TextField(null=True, blank=True, verbose_name=_("Description"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='analytics_created_genres')

    def __str__(self):
        return self.genre_name

    class Meta:
        verbose_name = _("Genre")
        verbose_name_plural = _("Genres")

class Region(models.Model):
    id = models.BigAutoField(primary_key=True)
    region_code = models.TextField(unique=True, verbose_name=_("Region Code"))
    region_name = models.TextField(null=True, blank=True, verbose_name=_("Region Name"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_regions')

    def __str__(self):
        return self.region_code

    class Meta:
        verbose_name = _("Region")
        verbose_name_plural = _("Regions")

class Track(models.Model):
    id = models.BigAutoField(primary_key=True)
    title = models.TextField(verbose_name=_("Track Title"))
    artist = models.TextField(verbose_name=_("Artist"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_tracks')

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = _("Track")
        verbose_name_plural = _("Tracks")

class UserBehaviorEvent(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name=_("User"))
    event_type = models.TextField(verbose_name=_("Event Type"))
    related_track_id = models.BigIntegerField(null=True, blank=True, verbose_name=_("Related Track ID"))
    related_artist_id = models.BigIntegerField(null=True, blank=True, verbose_name=_("Related Artist ID"))
    event_metadata = JSONField(null=True, blank=True, verbose_name=_("Event Metadata"))
    occurred_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Occurred At"))

    def __str__(self):
        return f"{self.user} - {self.event_type} - {self.occurred_at}"

    class Meta:
        verbose_name = _("User Behavior Event")
        verbose_name_plural = _("User Behavior Events")
        indexes = [
            models.Index(fields=['user', 'event_type', 'occurred_at']),
            models.Index(fields=['related_track_id', 'occurred_at']),
        ]

class TrackAnalyticsAggregate(models.Model):
    id = models.BigAutoField(primary_key=True)
    track = models.ForeignKey(Track, on_delete=models.CASCADE, verbose_name=_("Track"))
    aggregate_data = JSONField(null=True, blank=True, verbose_name=_("Aggregate Data"))
    last_updated = models.DateTimeField(auto_now=True, verbose_name=_("Last Updated"))
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='updated_analytics')

    def __str__(self):
        return f"Analytics for track {self.track}"

    class Meta:
        verbose_name = _("Track Analytics Aggregate")
        verbose_name_plural = _("Track Analytics Aggregates")
        indexes = [
            models.Index(fields=['track', 'last_updated']),
        ]

class UserPreferenceProfile(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE, verbose_name=_("User"))
    preference_vector = models.BinaryField(null=True, blank=True, verbose_name=_("Preference Vector"))
    metadata = JSONField(null=True, blank=True, verbose_name=_("Metadata"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"))

    def __str__(self):
        return f"Preference profile for user {self.user}"

    class Meta:
        verbose_name = _("User Preference Profile")
        verbose_name_plural = _("User Preference Profiles")
        indexes = [
            models.Index(fields=['user']),
        ]

class RecommendationSet(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name=_("User"))
    recommendation_data = JSONField(null=True, blank=True, verbose_name=_("Recommendation Data"))
    generated_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Generated At"))
    generated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='generated_recommendations')

    def __str__(self):
        return f"Recommendations for user {self.user}"

    class Meta:
        verbose_name = _("Recommendation Set")
        verbose_name_plural = _("Recommendation Sets")
        indexes = [
            models.Index(fields=['user', 'generated_at']),
        ]

class GenreTrend(models.Model):
    id = models.BigAutoField(primary_key=True)
    genre = models.ForeignKey(Genre, on_delete=models.CASCADE, verbose_name=_("Genre"))
    trend_data = JSONField(null=True, blank=True, verbose_name=_("Trend Data"))
    last_updated = models.DateTimeField(auto_now=True, verbose_name=_("Last Updated"))
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='updated_trends')

    def __str__(self):
        return f"Trends for genre {self.genre}"

    class Meta:
        verbose_name = _("Genre Trend")
        verbose_name_plural = _("Genre Trends")
        indexes = [
            models.Index(fields=['genre', 'last_updated']),
        ]

class GeographicInsight(models.Model):
    id = models.BigAutoField(primary_key=True)
    region = models.ForeignKey(Region, on_delete=models.CASCADE, verbose_name=_("Region"))
    insight_data = JSONField(null=True, blank=True, verbose_name=_("Insight Data"))
    last_updated = models.DateTimeField(auto_now=True, verbose_name=_("Last Updated"))
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='updated_insights')

    def __str__(self):
        return f"Insights for region {self.region}"

    class Meta:
        verbose_name = _("Geographic Insight")
        verbose_name_plural = _("Geographic Insights")
        indexes = [
            models.Index(fields=['region', 'last_updated']),
        ]

class DashboardSetting(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE, verbose_name=_("User"))
    settings = JSONField(null=True, blank=True, verbose_name=_("Settings"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"))

    def __str__(self):
        return f"Dashboard settings for user {self.user}"

    class Meta:
        verbose_name = _("Dashboard Setting")
        verbose_name_plural = _("Dashboard Settings")
        indexes = [
            models.Index(fields=['user']),
        ]

class StreamingOffset(models.Model):
    id = models.BigAutoField(primary_key=True)
    source_name = models.TextField(verbose_name=_("Source Name"))
    partition_id = models.IntegerField(verbose_name=_("Partition ID"))
    offset_position = models.BigIntegerField(verbose_name=_("Offset Position"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"))
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='updated_offsets')

    def __str__(self):
        return f"Offset for {self.source_name} - {self.partition_id}"

    class Meta:
        verbose_name = _("Streaming Offset")
        verbose_name_plural = _("Streaming Offsets")
        unique_together = ('source_name', 'partition_id')
        indexes = [
            models.Index(fields=['source_name', 'updated_at']),
        ]

class PredictiveModelOutput(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name=_("User"))
    track = models.ForeignKey(Track, on_delete=models.SET_NULL, null=True, verbose_name=_("Track"))
    prediction_data = JSONField(null=True, blank=True, verbose_name=_("Prediction Data"))
    model_version = models.TextField(verbose_name=_("Model Version"))
    predicted_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Predicted At"))
    predicted_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='generated_predictions')

    def __str__(self):
        return f"Prediction for user {self.user} and track {self.track}"

    class Meta:
        verbose_name = _("Predictive Model Output")
        verbose_name_plural = _("Predictive Model Outputs")
        indexes = [
            models.Index(fields=['user', 'track', 'predicted_at']),
        ]

class KnowledgeGraphNode(models.Model):
    id = models.BigAutoField(primary_key=True)
    node_type = models.TextField(verbose_name=_("Node Type"))
    node_ref_id = models.BigIntegerField(null=True, blank=True, verbose_name=_("Node Reference ID"))
    properties = JSONField(null=True, blank=True, verbose_name=_("Properties"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_nodes')

    def __str__(self):
        return f"{self.node_type} - {self.node_ref_id}"

    class Meta:
        verbose_name = _("Knowledge Graph Node")
        verbose_name_plural = _("Knowledge Graph Nodes")
        indexes = [
            models.Index(fields=['node_type', 'created_at']),
        ]

class KnowledgeGraphEdge(models.Model):
    id = models.BigAutoField(primary_key=True)
    from_node = models.ForeignKey(KnowledgeGraphNode, on_delete=models.CASCADE, related_name='outgoing_edges', verbose_name=_("From Node"))
    to_node = models.ForeignKey(KnowledgeGraphNode, on_delete=models.CASCADE, related_name='incoming_edges', verbose_name=_("To Node"))
    edge_type = models.TextField(verbose_name=_("Edge Type"))
    weight = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, verbose_name=_("Weight"))
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_edges')

    def __str__(self):
        return f"Edge from {self.from_node} to {self.to_node} - {self.edge_type}"

    class Meta:
        verbose_name = _("Knowledge Graph Edge")
        verbose_name_plural = _("Knowledge Graph Edges")
        indexes = [
            models.Index(fields=['from_node', 'to_node', 'edge_type']),
        ]

class Experiment(models.Model):
    id = models.BigAutoField(primary_key=True)
    experiment_name = models.TextField(verbose_name=_("Experiment Name"))
    description = models.TextField(null=True, blank=True, verbose_name=_("Description"))
    variants = JSONField(null=True, blank=True, verbose_name=_("Variants"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_experiments')
    group_access = models.ManyToManyField('auth.Group', blank=True, related_name='accessible_experiments')

    def __str__(self):
        return self.experiment_name

    class Meta:
        verbose_name = _("Experiment")
        verbose_name_plural = _("Experiments")
        indexes = [
            models.Index(fields=['experiment_name', 'created_at']),
        ]

class ExperimentAssignment(models.Model):
    id = models.BigAutoField(primary_key=True)
    experiment = models.ForeignKey(Experiment, on_delete=models.CASCADE, verbose_name=_("Experiment"))
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name=_("User"))
    assigned_variant = models.TextField(null=True, blank=True, verbose_name=_("Assigned Variant"))
    assigned_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Assigned At"))
    assigned_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='assigned_experiments')

    def __str__(self):
        return f"Assignment for user {self.user} to experiment {self.experiment}"

    class Meta:
        verbose_name = _("Experiment Assignment")
        verbose_name_plural = _("Experiment Assignments")
        unique_together = ('experiment', 'user')
        indexes = [
            models.Index(fields=['experiment', 'user', 'assigned_at']),
        ]

class FederatedModelUpdate(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name=_("User"))
    update_data = JSONField(null=True, blank=True, verbose_name=_("Update Data"))
    round_number = models.IntegerField(verbose_name=_("Round Number"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"))
    validated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='validated_updates')
    validation_status = models.CharField(
        max_length=20,
        choices=[
            ('pending', _('Pending')),
            ('validated', _('Validated')),
            ('rejected', _('Rejected'))
        ],
        default='pending'
    )

    def __str__(self):
        return f"Federated model update for user {self.user} - round {self.round_number}"

    class Meta:
        verbose_name = _("Federated Model Update")
        verbose_name_plural = _("Federated Model Updates")
        unique_together = ('user', 'round_number')
        indexes = [
            models.Index(fields=['user', 'round_number', 'validation_status']),
        ]

class MixingAnalytics(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name=_("User"))
    session_id = models.TextField(verbose_name=_("Session ID"))
    event_type = models.CharField(
        max_length=50,
        choices=[
            ('mix_started', _('Mix Started')),
            ('mix_completed', _('Mix Completed')),
            ('mix_saved', _('Mix Saved')),
            ('mix_shared', _('Mix Shared'))
        ],
        verbose_name=_("Event Type")
    )
    duration = models.IntegerField(verbose_name=_("Duration"))
    genre_weights = models.JSONField(verbose_name=_("Genre Weights"))
    effects_used = models.JSONField(verbose_name=_("Effects Used"))
    performance_metrics = models.JSONField(verbose_name=_("Performance Metrics"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))

    class Meta:
        verbose_name = _("Mixing Analytics")
        verbose_name_plural = _("Mixing Analytics")
        indexes = [
            models.Index(fields=['user', 'session_id', 'event_type']),
            models.Index(fields=['created_at'])
        ]

class GenreMixingSession(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name=_("User"))
    status = models.CharField(
        max_length=20,
        choices=[
            ('active', _('Active')),
            ('completed', _('Completed')),
            ('failed', _('Failed'))
        ],
        verbose_name=_("Status")
    )
    genres = models.JSONField(verbose_name=_("Genres"))
    duration = models.IntegerField(verbose_name=_("Duration"))
    output_format = models.CharField(
        max_length=10,
        choices=[
            ('wav', 'WAV'),
            ('mp3', 'MP3'),
            ('midi', 'MIDI')
        ],
        verbose_name=_("Output Format")
    )
    analysis_results = models.JSONField(verbose_name=_("Analysis Results"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"))

    class Meta:
        verbose_name = _("Genre Mixing Session")
        verbose_name_plural = _("Genre Mixing Sessions")
        indexes = [
            models.Index(fields=['user', 'status', 'created_at'])
        ]

class PersonaFusion(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name=_("User"))
    persona_type = models.CharField(max_length=100, verbose_name=_("Persona Type"))
    preferences = models.JSONField(verbose_name=_("Preferences"))
    active_timeframe = models.JSONField(verbose_name=_("Active Timeframe"))
    settings = models.JSONField(verbose_name=_("Settings"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"))

    class Meta:
        verbose_name = _("Persona Fusion")
        verbose_name_plural = _("Persona Fusions")
        indexes = [
            models.Index(fields=['user', 'persona_type'])
        ]

class BehaviorTriggeredOverlay(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name=_("User"))
    trigger_type = models.CharField(max_length=100, verbose_name=_("Trigger Type"))
    conditions = models.JSONField(verbose_name=_("Conditions"))
    overlay = models.JSONField(verbose_name=_("Overlay"))
    active = models.BooleanField(default=True, verbose_name=_("Active"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"))

    class Meta:
        verbose_name = _("Behavior Triggered Overlay")
        verbose_name_plural = _("Behavior Triggered Overlays")
        indexes = [
            models.Index(fields=['user', 'trigger_type', 'active'])
        ]

class MultiUserComposite(models.Model):
    id = models.BigAutoField(primary_key=True)
    users = models.ManyToManyField(User, related_name='composites', verbose_name=_("Users"))
    composite_type = models.CharField(max_length=100, verbose_name=_("Composite Type"))
    weights = models.JSONField(verbose_name=_("Weights"))
    settings = models.JSONField(verbose_name=_("Settings"))
    status = models.CharField(
        max_length=20,
        choices=[
            ('active', _('Active')),
            ('inactive', _('Inactive'))
        ],
        default='active',
        verbose_name=_("Status")
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"))

    class Meta:
        verbose_name = _("Multi-User Composite")
        verbose_name_plural = _("Multi-User Composites")
        indexes = [
            models.Index(fields=['composite_type', 'status'])
        ]

class PredictivePreferenceModel(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name=_("User"))
    model_version = models.CharField(max_length=50, verbose_name=_("Model Version"))
    predictions = models.JSONField(verbose_name=_("Predictions"))
    last_updated = models.DateTimeField(verbose_name=_("Last Updated"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))

    class Meta:
        verbose_name = _("Predictive Preference Model")
        verbose_name_plural = _("Predictive Preference Models")
        indexes = [
            models.Index(fields=['user', 'model_version'])
        ]

class PredictivePreferenceEvent(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name=_("User"))
    event_type = models.CharField(max_length=100, verbose_name=_("Event Type"))
    prediction = models.JSONField(verbose_name=_("Prediction"))
    context = models.JSONField(verbose_name=_("Context"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))

    class Meta:
        verbose_name = _("Predictive Preference Event")
        verbose_name_plural = _("Predictive Preference Events")
        indexes = [
            models.Index(fields=['user', 'event_type', 'created_at'])
        ]

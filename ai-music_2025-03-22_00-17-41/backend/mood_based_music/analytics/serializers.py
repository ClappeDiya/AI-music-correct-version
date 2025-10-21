from rest_framework import serializers
from .models import (
    TrackInteraction,
    MoodAccuracyFeedback,
    MoodMetrics,
    UserMoodStats,
    ModelImprovementSuggestion
)
from ..serializers import MoodSerializer

class TrackInteractionSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrackInteraction
        fields = ['id', 'track', 'interaction_type', 'duration', 'created_at']
        read_only_fields = ['id', 'created_at']

class MoodAccuracyFeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = MoodAccuracyFeedback
        fields = ['id', 'track', 'accuracy_rating', 'perceived_intensity', 'issues', 'notes', 'created_at']
        read_only_fields = ['id', 'created_at']

class MoodMetricsSerializer(serializers.ModelSerializer):
    mood = MoodSerializer(read_only=True)
    
    class Meta:
        model = MoodMetrics
        fields = ['id', 'mood', 'total_generations', 'average_accuracy', 'total_feedback', 'common_issues', 'last_updated']
        read_only_fields = ['id', 'last_updated']

class UserMoodStatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserMoodStats
        fields = ['id', 'total_tracks', 'favorite_moods', 'mood_accuracy', 'last_updated']
        read_only_fields = ['id', 'last_updated']

class ModelImprovementSuggestionSerializer(serializers.ModelSerializer):
    mood = MoodSerializer(read_only=True)
    
    class Meta:
        model = ModelImprovementSuggestion
        fields = ['id', 'mood', 'current_accuracy', 'improvement_areas', 'confidence', 'created_at']
        read_only_fields = ['id', 'created_at']

# Response Serializers for Analytics API
class TrackAnalyticsSerializer(serializers.Serializer):
    metrics = serializers.DictField(
        child=serializers.IntegerField(),
        read_only=True
    )
    feedback = serializers.ListField(
        child=MoodAccuracyFeedbackSerializer(),
        read_only=True
    )
    mood_accuracy = serializers.DictField(
        child=serializers.DictField(),
        read_only=True
    )

class UserAnalyticsSerializer(serializers.Serializer):
    total_tracks = serializers.IntegerField(read_only=True)
    favorite_moods = serializers.ListField(
        child=serializers.DictField(),
        read_only=True
    )
    mood_accuracy = serializers.DictField(
        child=serializers.DictField(),
        read_only=True
    )
    recent_feedback = serializers.ListField(
        child=MoodAccuracyFeedbackSerializer(),
        read_only=True
    )
    improvement_suggestions = serializers.ListField(
        child=ModelImprovementSuggestionSerializer(),
        read_only=True
    ) 
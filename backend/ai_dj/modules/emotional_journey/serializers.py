from rest_framework import serializers
from .models import (
    EmotionalState,
    EmotionalJourney,
    JourneyWaypoint,
    SessionJourney,
    EmotionalSnapshot,
    JourneyFeedback,
    EmotionalAnalytics
)

class EmotionalStateSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmotionalState
        fields = '__all__'

class EmotionalJourneySerializer(serializers.ModelSerializer):
    class Meta:
        model = EmotionalJourney
        fields = '__all__'

class JourneyWaypointSerializer(serializers.ModelSerializer):
    class Meta:
        model = JourneyWaypoint
        fields = '__all__'

class SessionJourneySerializer(serializers.ModelSerializer):
    class Meta:
        model = SessionJourney
        fields = '__all__'

class EmotionalSnapshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmotionalSnapshot
        fields = '__all__'

class JourneyFeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = JourneyFeedback
        fields = '__all__'

class EmotionalAnalyticsSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmotionalAnalytics
        fields = '__all__'

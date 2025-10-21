from rest_framework import serializers
from .models import (
    CacheableTrackTransition,
    PerformanceMetric,
    DeploymentLog,
    ScalingEvent
)


class CacheableTrackTransitionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CacheableTrackTransition
        fields = [
            'id', 'source_track', 'target_track',
            'transition_params', 'cache_key',
            'hit_count', 'last_accessed', 'created_at'
        ]
        read_only_fields = ['hit_count', 'last_accessed', 'created_at']


class PerformanceMetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = PerformanceMetric
        fields = [
            'id', 'metric_type', 'value',
            'timestamp', 'server_instance'
        ]
        read_only_fields = ['timestamp']


class DeploymentLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeploymentLog
        fields = [
            'id', 'deployment_type', 'version',
            'status', 'started_at', 'completed_at',
            'details', 'affected_services'
        ]
        read_only_fields = ['started_at', 'completed_at']


class ScalingEventSerializer(serializers.ModelSerializer):
    trigger_metric_details = PerformanceMetricSerializer(
        source='trigger_metric',
        read_only=True
    )

    class Meta:
        model = ScalingEvent
        fields = [
            'id', 'event_type', 'trigger_metric',
            'trigger_metric_details', 'instances_before',
            'instances_after', 'timestamp', 'reason'
        ]
        read_only_fields = ['timestamp']

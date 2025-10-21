from rest_framework import serializers
from .models import MetricData, Alert, SystemHealth, PerformanceMetric, CacheableTrackTransition, DeploymentLog, ScalingEvent


class MetricDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = MetricData
        fields = [
            'id', 'metric_type', 'value',
            'timestamp', 'labels'
        ]
        read_only_fields = ['timestamp']


class AlertSerializer(serializers.ModelSerializer):
    resolved_by_username = serializers.CharField(
        source='resolved_by.username',
        read_only=True
    )
    
    class Meta:
        model = Alert
        fields = [
            'id', 'severity', 'title',
            'description', 'created_at',
            'resolved_at', 'resolved_by',
            'resolved_by_username'
        ]
        read_only_fields = ['created_at', 'resolved_at', 'resolved_by']


class SystemHealthSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemHealth
        fields = [
            'id', 'component', 'status',
            'last_check', 'details'
        ]
        read_only_fields = ['last_check']


class PerformanceMetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = PerformanceMetric
        fields = '__all__'
        read_only_fields = ('timestamp',)


class CacheableTrackTransitionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CacheableTrackTransition
        fields = '__all__'
        read_only_fields = ('hit_count', 'last_accessed', 'created_at')


class DeploymentLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeploymentLog
        fields = '__all__'
        read_only_fields = ('started_at', 'completed_at')


class ScalingEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScalingEvent
        fields = '__all__'
        read_only_fields = ('timestamp',)

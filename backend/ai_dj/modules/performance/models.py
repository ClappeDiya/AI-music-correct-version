from django.db import models
from django.conf import settings
import json
from django.utils.translation import gettext_lazy as _


class CacheableTrackTransition(models.Model):
    """Stores frequently requested track transitions for caching."""
    
    source_track = models.CharField(max_length=255)
    target_track = models.CharField(max_length=255)
    transition_params = models.JSONField()
    cache_key = models.CharField(max_length=255, unique=True)
    hit_count = models.IntegerField(default=0)
    last_accessed = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = 'performance'
        db_table = 'performance_cacheabletracktransition'
        indexes = [
            models.Index(fields=['source_track', 'target_track'], name='perf_track_transition'),
            models.Index(fields=['hit_count'], name='perf_hit_count'),
            models.Index(fields=['last_accessed'], name='perf_last_accessed'),
        ]

    def generate_cache_key(self):
        """Generate a unique cache key based on transition parameters."""
        key_parts = [
            self.source_track,
            self.target_track,
            str(self.transition_params)
        ]
        return ':'.join(key_parts)


class PerformanceMetric(models.Model):
    """Tracks system performance metrics for auto-scaling decisions."""
    
    metric_type = models.CharField(
        max_length=50,
        choices=[
            ('cpu_usage', 'CPU Usage'),
            ('memory_usage', 'Memory Usage'),
            ('request_count', 'Request Count'),
            ('response_time', 'Response Time'),
            ('error_rate', 'Error Rate'),
            ('concurrent_users', 'Concurrent Users'),
        ]
    )
    value = models.FloatField()
    timestamp = models.DateTimeField(auto_now_add=True)
    server_instance = models.CharField(max_length=100)

    class Meta:
        app_label = 'performance'
        db_table = 'performance_performancemetric'
        indexes = [
            models.Index(fields=['metric_type', 'timestamp'], name='perf_metric_type_time'),
            models.Index(fields=['server_instance'], name='perf_server_instance'),
        ]


class DeploymentLog(models.Model):
    """Tracks deployments and updates for CI/CD monitoring."""
    
    deployment_type = models.CharField(
        max_length=50,
        choices=[
            ('feature', 'Feature Update'),
            ('model', 'AI Model Update'),
            ('hotfix', 'Hot Fix'),
            ('rollback', 'Rollback'),
        ]
    )
    version = models.CharField(max_length=50)
    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('in_progress', 'In Progress'),
            ('completed', 'Completed'),
            ('failed', 'Failed'),
            ('rolled_back', 'Rolled Back'),
        ],
        default='pending'
    )
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    details = models.JSONField(default=dict)
    affected_services = models.JSONField(default=list)

    class Meta:
        app_label = 'performance'
        db_table = 'performance_deploymentlog'
        ordering = ['-started_at']


class ScalingEvent(models.Model):
    """Records auto-scaling events and their triggers."""
    
    event_type = models.CharField(
        max_length=20,
        choices=[
            ('scale_up', 'Scale Up'),
            ('scale_down', 'Scale Down'),
        ]
    )
    trigger_metric = models.ForeignKey(
        PerformanceMetric,
        on_delete=models.SET_NULL,
        null=True
    )
    instances_before = models.IntegerField()
    instances_after = models.IntegerField()
    timestamp = models.DateTimeField(auto_now_add=True)
    reason = models.TextField()
    
    class Meta:
        app_label = 'performance'
        db_table = 'performance_scalingevent'
        ordering = ['-timestamp']

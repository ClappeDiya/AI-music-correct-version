from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator


class MetricData(models.Model):
    """Store monitoring metrics data."""
    
    metric_type = models.CharField(
        max_length=50,
        choices=[
            ('request_count', 'Request Count'),
            ('response_time', 'Response Time'),
            ('error_rate', 'Error Rate'),
            ('resource_usage', 'Resource Usage'),
            ('user_count', 'User Count'),
        ]
    )
    value = models.FloatField()
    timestamp = models.DateTimeField(auto_now_add=True)
    labels = models.JSONField(default=dict)
    
    class Meta:
        indexes = [
            models.Index(fields=['metric_type', 'timestamp']),
        ]


class Alert(models.Model):
    """System alerts and notifications."""
    
    severity = models.CharField(
        max_length=20,
        choices=[
            ('info', 'Information'),
            ('warning', 'Warning'),
            ('error', 'Error'),
            ('critical', 'Critical'),
        ]
    )
    title = models.CharField(max_length=200)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='resolved_alerts'
    )
    
    class Meta:
        ordering = ['-created_at']


class SystemHealth(models.Model):
    """Overall system health status."""
    
    component = models.CharField(max_length=100)
    status = models.CharField(
        max_length=20,
        choices=[
            ('healthy', 'Healthy'),
            ('degraded', 'Degraded'),
            ('down', 'Down'),
        ]
    )
    last_check = models.DateTimeField(auto_now=True)
    details = models.JSONField(default=dict)
    
    class Meta:
        verbose_name_plural = 'System health'
        ordering = ['component']


class PerformanceMetric(models.Model):
    """Tracks system performance metrics for auto-scaling decisions."""
    
    METRIC_TYPES = [
        ('cpu_usage', _('CPU Usage')),
        ('memory_usage', _('Memory Usage')),
        ('request_count', _('Request Count')),
        ('response_time', _('Response Time')),
        ('error_rate', _('Error Rate')),
        ('concurrent_users', _('Concurrent Users')),
    ]
    
    metric_type = models.CharField(
        max_length=50,
        choices=METRIC_TYPES,
        db_index=True,
        help_text=_('Type of performance metric being recorded')
    )
    value = models.FloatField(
        validators=[MinValueValidator(0.0)],
        help_text=_('Measured value of the metric')
    )
    timestamp = models.DateTimeField(
        auto_now_add=True,
        db_index=True,
        help_text=_('When the metric was recorded')
    )
    server_instance = models.CharField(
        max_length=100,
        db_index=True,
        help_text=_('Identifier of the server instance')
    )

    class Meta:
        db_table = 'monitoring_metric'
        indexes = [
            models.Index(fields=['metric_type', 'timestamp']),
            models.Index(fields=['server_instance']),
        ]
        ordering = ['-timestamp']
        verbose_name = _('Performance Metric')
        verbose_name_plural = _('Performance Metrics')

    def __str__(self):
        return f"{self.metric_type} - {self.value} ({self.timestamp})"


class CacheableTrackTransition(models.Model):
    """Stores frequently requested track transitions for caching."""
    
    source_track = models.CharField(
        max_length=255,
        help_text=_('Source track identifier')
    )
    target_track = models.CharField(
        max_length=255,
        help_text=_('Target track identifier')
    )
    transition_params = models.JSONField(
        help_text=_('Parameters used for the transition')
    )
    cache_key = models.CharField(
        max_length=255,
        unique=True,
        help_text=_('Unique cache key for this transition')
    )
    hit_count = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        help_text=_('Number of times this transition has been requested')
    )
    last_accessed = models.DateTimeField(
        auto_now=True,
        help_text=_('Last time this transition was accessed')
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text=_('When this transition was first cached')
    )

    class Meta:
        db_table = 'monitoring_track_transition'
        indexes = [
            models.Index(fields=['source_track', 'target_track']),
            models.Index(fields=['hit_count']),
            models.Index(fields=['last_accessed']),
        ]
        ordering = ['-hit_count', '-last_accessed']
        verbose_name = _('Cacheable Track Transition')
        verbose_name_plural = _('Cacheable Track Transitions')

    def __str__(self):
        return f"{self.source_track} → {self.target_track} (hits: {self.hit_count})"


class DeploymentLog(models.Model):
    """Tracks deployments and updates for CI/CD monitoring."""
    
    DEPLOYMENT_TYPES = [
        ('feature', _('Feature Update')),
        ('model', _('AI Model Update')),
        ('hotfix', _('Hot Fix')),
        ('rollback', _('Rollback')),
    ]
    
    STATUS_CHOICES = [
        ('pending', _('Pending')),
        ('in_progress', _('In Progress')),
        ('completed', _('Completed')),
        ('failed', _('Failed')),
        ('rolled_back', _('Rolled Back')),
    ]
    
    deployment_type = models.CharField(
        max_length=50,
        choices=DEPLOYMENT_TYPES,
        help_text=_('Type of deployment')
    )
    version = models.CharField(
        max_length=50,
        help_text=_('Version identifier for this deployment')
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        help_text=_('Current status of the deployment')
    )
    started_at = models.DateTimeField(
        auto_now_add=True,
        help_text=_('When the deployment started')
    )
    completed_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text=_('When the deployment completed')
    )
    details = models.JSONField(
        default=dict,
        help_text=_('Additional deployment details')
    )
    affected_services = models.JSONField(
        default=list,
        help_text=_('List of services affected by this deployment')
    )

    class Meta:
        db_table = 'monitoring_deployment_log'
        ordering = ['-started_at']
        verbose_name = _('Deployment Log')
        verbose_name_plural = _('Deployment Logs')

    def __str__(self):
        return f"{self.deployment_type} - {self.version} ({self.status})"


class ScalingEvent(models.Model):
    """Records auto-scaling events and their triggers."""
    
    EVENT_TYPES = [
        ('scale_up', _('Scale Up')),
        ('scale_down', _('Scale Down')),
    ]
    
    event_type = models.CharField(
        max_length=20,
        choices=EVENT_TYPES,
        help_text=_('Type of scaling event')
    )
    trigger_metric = models.ForeignKey(
        PerformanceMetric,
        on_delete=models.SET_NULL,
        null=True,
        help_text=_('Performance metric that triggered this event')
    )
    instances_before = models.IntegerField(
        validators=[MinValueValidator(0)],
        help_text=_('Number of instances before scaling')
    )
    instances_after = models.IntegerField(
        validators=[MinValueValidator(0)],
        help_text=_('Number of instances after scaling')
    )
    timestamp = models.DateTimeField(
        auto_now_add=True,
        help_text=_('When the scaling event occurred')
    )
    reason = models.TextField(
        help_text=_('Detailed reason for the scaling decision')
    )
    
    class Meta:
        db_table = 'monitoring_scaling_event'
        ordering = ['-timestamp']
        verbose_name = _('Scaling Event')
        verbose_name_plural = _('Scaling Events')

    def __str__(self):
        return f"{self.event_type} ({self.instances_before} → {self.instances_after})"

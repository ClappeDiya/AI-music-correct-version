from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class SystemConfiguration(models.Model):
    """
    Model to store system-wide configuration settings.
    """
    key = models.CharField(max_length=100, unique=True)
    value = models.JSONField()
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='system_configurations'
    )

    class Meta:
        verbose_name = _('System Configuration')
        verbose_name_plural = _('System Configurations')
        ordering = ['key']

    def __str__(self):
        return self.key


class SystemHealthCheck(models.Model):
    """
    Model to store system health check results.
    """
    STATUS_CHOICES = [
        ('healthy', _('Healthy')),
        ('degraded', _('Degraded')),
        ('failed', _('Failed')),
    ]

    component = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    details = models.JSONField(default=dict)
    last_check = models.DateTimeField(auto_now=True)
    next_check = models.DateTimeField()

    class Meta:
        verbose_name = _('System Health Check')
        verbose_name_plural = _('System Health Checks')
        ordering = ['component']

    def __str__(self):
        return f"{self.component} - {self.status}"


class MaintenanceWindow(models.Model):
    """
    Model to schedule and track system maintenance windows.
    """
    title = models.CharField(max_length=200)
    description = models.TextField()
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='maintenance_windows'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Maintenance Window')
        verbose_name_plural = _('Maintenance Windows')
        ordering = ['-start_time']

    def __str__(self):
        return f"{self.title} ({self.start_time} - {self.end_time})"


class SystemMetric(models.Model):
    """
    Model to store system performance metrics.
    """
    METRIC_TYPES = [
        ('cpu', _('CPU Usage')),
        ('memory', _('Memory Usage')),
        ('disk', _('Disk Usage')),
        ('network', _('Network Traffic')),
        ('response_time', _('Response Time')),
        ('error_rate', _('Error Rate')),
    ]

    metric_type = models.CharField(max_length=20, choices=METRIC_TYPES)
    value = models.FloatField()
    unit = models.CharField(max_length=50)
    timestamp = models.DateTimeField(auto_now_add=True)
    details = models.JSONField(default=dict)

    class Meta:
        verbose_name = _('System Metric')
        verbose_name_plural = _('System Metrics')
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.metric_type} - {self.value}{self.unit}"


class BackgroundTask(models.Model):
    """
    Model to track background tasks and their status.
    """
    STATUS_CHOICES = [
        ('pending', _('Pending')),
        ('running', _('Running')),
        ('completed', _('Completed')),
        ('failed', _('Failed')),
        ('cancelled', _('Cancelled')),
    ]

    name = models.CharField(max_length=200)
    task_id = models.CharField(max_length=100, unique=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    result = models.JSONField(null=True, blank=True)
    error = models.TextField(blank=True)
    retries = models.IntegerField(default=0)

    class Meta:
        verbose_name = _('Background Task')
        verbose_name_plural = _('Background Tasks')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - {self.status}"


class APIKey(models.Model):
    """
    Model to manage API keys for external integrations.
    """
    name = models.CharField(max_length=100)
    key = models.CharField(max_length=100, unique=True)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='api_keys'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    last_used = models.DateTimeField(null=True, blank=True)
    permissions = models.JSONField(default=list)

    class Meta:
        verbose_name = _('API Key')
        verbose_name_plural = _('API Keys')
        ordering = ['-created_at']

    def __str__(self):
        return self.name 
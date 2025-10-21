from django.db import models
from django.conf import settings


class PreferenceExternalization(models.Model):
    """External service preference synchronization."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    service_name = models.CharField(max_length=100)
    sync_enabled = models.BooleanField(default=True)
    last_sync = models.DateTimeField(null=True, blank=True)
    sync_frequency = models.IntegerField(default=24)  # hours
    preferences_data = models.JSONField(default=dict)

    class Meta:
        unique_together = ['user', 'service_name']


class EventBasedPreference(models.Model):
    """Temporary event-based preference overrides."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    event_type = models.CharField(max_length=50)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    preferences = models.JSONField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-start_time']


class BehaviorOverlay(models.Model):
    """Dynamic UI overlays based on user behavior."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    trigger_type = models.CharField(max_length=50)
    conditions = models.JSONField()
    overlay_content = models.JSONField()
    is_active = models.BooleanField(default=True)
    priority = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-priority', '-created_at']


class UserCurrency(models.Model):
    """User's preferred currency settings."""
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    currency_code = models.CharField(max_length=3)  # ISO 4217
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'User currencies'

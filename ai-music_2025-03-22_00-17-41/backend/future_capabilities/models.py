"""
Future Capabilities Models
This module re-exports all models from their domain-specific modules.
"""

# Import all models from domain-specific modules
from .models.vr import VREnvironmentConfig, VRSession, VRInteraction
from .models.neural import NeuralDevice, NeuralSignal, NeuralControl
from .models.plugins import (
    PluginDeveloper,
    Plugin,
    PluginInstallation,
    PluginRating,
    PluginUsageLog
)
from .models.analytics import FeatureUsageAnalytics
from .models.feedback import FeatureSurvey, SurveyResponse
from .models.wearables import WearableDevice, BiofeedbackData, BiofeedbackEvent

# Re-export all models
__all__ = [
    # VR Models
    "VREnvironmentConfig",
    "VRSession",
    "VRInteraction",
    
    # Neural Models
    "NeuralDevice",
    "NeuralSignal",
    "NeuralControl",
    
    # Plugin Models
    "PluginDeveloper",
    "Plugin",
    "PluginInstallation",
    "PluginRating",
    "PluginUsageLog",
    
    # Analytics Models
    "FeatureUsageAnalytics",
    
    # Feedback Models
    "FeatureSurvey",
    "SurveyResponse",
    
    # Wearables Models
    "WearableDevice",
    "BiofeedbackData",
    "BiofeedbackEvent",
]

from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _

class VREnvironmentConfig(models.Model):
    """
    Model to store VR environment configurations.
    """
    name = models.CharField(max_length=100)
    scene_type = models.CharField(max_length=50)
    interaction_mode = models.CharField(max_length=50)
    environment_name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('VR Environment Config')
        verbose_name_plural = _('VR Environment Configs')
        ordering = ['name']

    def __str__(self):
        return self.name

class VRSession(models.Model):
    """
    Model to track VR sessions.
    """
    user_id = models.CharField(max_length=100)
    environment_config = models.ForeignKey(VREnvironmentConfig, on_delete=models.CASCADE)
    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    session_notes = models.TextField(blank=True)

    class Meta:
        verbose_name = _('VR Session')
        verbose_name_plural = _('VR Sessions')
        ordering = ['-started_at']

    def __str__(self):
        return f"{self.user_id} - {self.environment_config}"

class VRInteraction(models.Model):
    """
    Model to store VR interactions.
    """
    session = models.ForeignKey(VRSession, on_delete=models.CASCADE)
    interaction_type = models.CharField(max_length=50)
    timestamp = models.DateTimeField(auto_now_add=True)
    interaction_data = models.JSONField(default=dict)

    class Meta:
        verbose_name = _('VR Interaction')
        verbose_name_plural = _('VR Interactions')
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.session} - {self.interaction_type}"

class NeuralDevice(models.Model):
    """
    Model to store neural device information.
    """
    user_id = models.CharField(max_length=100)
    device_name = models.CharField(max_length=100)
    device_type = models.CharField(max_length=50)
    connection_status = models.CharField(max_length=50)
    last_calibration = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = _('Neural Device')
        verbose_name_plural = _('Neural Devices')
        ordering = ['device_name']

    def __str__(self):
        return f"{self.device_name} ({self.device_type})"

class NeuralSignal(models.Model):
    """
    Model to store neural signals.
    """
    device = models.ForeignKey(NeuralDevice, on_delete=models.CASCADE)
    signal_type = models.CharField(max_length=50)
    timestamp = models.DateTimeField(auto_now_add=True)
    signal_data = models.JSONField(default=dict)

    class Meta:
        verbose_name = _('Neural Signal')
        verbose_name_plural = _('Neural Signals')
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.device} - {self.signal_type}"

class NeuralControl(models.Model):
    """
    Model to store neural control commands.
    """
    device = models.ForeignKey(NeuralDevice, on_delete=models.CASCADE)
    control_type = models.CharField(max_length=50)
    timestamp = models.DateTimeField(auto_now_add=True)
    control_data = models.JSONField(default=dict)

    class Meta:
        verbose_name = _('Neural Control')
        verbose_name_plural = _('Neural Controls')
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.device} - {self.control_type}"

class PluginDeveloper(models.Model):
    """
    Model to store plugin developer information.
    """
    user_id = models.CharField(max_length=100)
    company_name = models.CharField(max_length=200)
    website = models.URLField(blank=True)
    is_verified = models.BooleanField(default=False)
    verification_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('Plugin Developer')
        verbose_name_plural = _('Plugin Developers')
        ordering = ['company_name']

    def __str__(self):
        return self.company_name

class Plugin(models.Model):
    """
    Model to store plugin information.
    """
    developer = models.ForeignKey(PluginDeveloper, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    version = models.CharField(max_length=50)
    status = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('Plugin')
        verbose_name_plural = _('Plugins')
        ordering = ['name']

    def __str__(self):
        return f"{self.name} v{self.version}"

class PluginInstallation(models.Model):
    """
    Model to track plugin installations.
    """
    plugin = models.ForeignKey(Plugin, on_delete=models.CASCADE)
    user_id = models.CharField(max_length=100)
    status = models.CharField(max_length=50)
    installed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('Plugin Installation')
        verbose_name_plural = _('Plugin Installations')
        ordering = ['-installed_at']

    def __str__(self):
        return f"{self.plugin} - {self.user_id}"

class PluginRating(models.Model):
    """
    Model to store plugin ratings.
    """
    plugin = models.ForeignKey(Plugin, on_delete=models.CASCADE)
    user_id = models.CharField(max_length=100)
    rating = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('Plugin Rating')
        verbose_name_plural = _('Plugin Ratings')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.plugin} - {self.rating}"

class PluginUsageLog(models.Model):
    """
    Model to track plugin usage.
    """
    installation = models.ForeignKey(PluginInstallation, on_delete=models.CASCADE)
    event_type = models.CharField(max_length=50)
    timestamp = models.DateTimeField(auto_now_add=True)
    event_data = models.JSONField(default=dict)

    class Meta:
        verbose_name = _('Plugin Usage Log')
        verbose_name_plural = _('Plugin Usage Logs')
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.installation} - {self.event_type}"

class FeatureUsageAnalytics(models.Model):
    """
    Model to store feature usage analytics.
    """
    feature_name = models.CharField(max_length=100)
    user_id = models.CharField(max_length=100)
    usage_count = models.IntegerField(default=0)
    last_used = models.DateTimeField(auto_now=True)
    usage_data = models.JSONField(default=dict)

    class Meta:
        verbose_name = _('Feature Usage Analytics')
        verbose_name_plural = _('Feature Usage Analytics')
        ordering = ['-last_used']

    def __str__(self):
        return f"{self.feature_name} - {self.user_id}"

class FeatureSurvey(models.Model):
    """
    Model to store feature surveys.
    """
    feature_name = models.CharField(max_length=100)
    status = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    survey_data = models.JSONField(default=dict)

    class Meta:
        verbose_name = _('Feature Survey')
        verbose_name_plural = _('Feature Surveys')
        ordering = ['-created_at']

    def __str__(self):
        return self.feature_name

class SurveyResponse(models.Model):
    """
    Model to store survey responses.
    """
    survey = models.ForeignKey(FeatureSurvey, on_delete=models.CASCADE)
    user_id = models.CharField(max_length=100)
    satisfaction_score = models.IntegerField()
    submitted_at = models.DateTimeField(auto_now_add=True)
    response_data = models.JSONField(default=dict)

    class Meta:
        verbose_name = _('Survey Response')
        verbose_name_plural = _('Survey Responses')
        ordering = ['-submitted_at']

    def __str__(self):
        return f"{self.survey} - {self.user_id}"

class WearableDevice(models.Model):
    """
    Model to store wearable device information.
    """
    user_id = models.CharField(max_length=100)
    device_type = models.CharField(max_length=50)
    connection_status = models.CharField(max_length=50)
    last_sync = models.DateTimeField(null=True, blank=True)
    device_data = models.JSONField(default=dict)

    class Meta:
        verbose_name = _('Wearable Device')
        verbose_name_plural = _('Wearable Devices')
        ordering = ['user_id']

    def __str__(self):
        return f"{self.user_id} - {self.device_type}"

class BiofeedbackData(models.Model):
    """
    Model to store biofeedback data.
    """
    device = models.ForeignKey(WearableDevice, on_delete=models.CASCADE)
    data_type = models.CharField(max_length=50)
    timestamp = models.DateTimeField(auto_now_add=True)
    biofeedback_data = models.JSONField(default=dict)

    class Meta:
        verbose_name = _('Biofeedback Data')
        verbose_name_plural = _('Biofeedback Data')
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.device} - {self.data_type}"

class BiofeedbackEvent(models.Model):
    """
    Model to store biofeedback events.
    """
    device = models.ForeignKey(WearableDevice, on_delete=models.CASCADE)
    event_type = models.CharField(max_length=50)
    timestamp = models.DateTimeField(auto_now_add=True)
    event_data = models.JSONField(default=dict)

    class Meta:
        verbose_name = _('Biofeedback Event')
        verbose_name_plural = _('Biofeedback Events')
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.device} - {self.event_type}"

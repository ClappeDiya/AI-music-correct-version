from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator


class VREnvironmentConfig(models.Model):
    """
    Model for VR environment configuration settings.
    """
    user_id = models.IntegerField(
        verbose_name=_("User ID")
    )
    name = models.CharField(
        max_length=100,
        verbose_name=_("Environment Name")
    )
    environment_name = models.CharField(
        max_length=100,
        verbose_name=_("Environment Name")
    )
    scene_type = models.CharField(
        max_length=50,
        choices=[
            ('studio', 'Recording Studio'),
            ('concert_hall', 'Concert Hall'),
            ('nature', 'Nature Scene'),
            ('abstract', 'Abstract Space')
        ],
        verbose_name=_("Scene Type")
    )
    lighting_preset = models.CharField(
        max_length=50,
        verbose_name=_("Lighting Preset")
    )
    ambient_audio = models.CharField(
        max_length=100,
        blank=True,
        verbose_name=_("Ambient Audio")
    )
    interaction_mode = models.CharField(
        max_length=50,
        choices=[
            ('gesture', 'Gesture Control'),
            ('controller', 'VR Controller'),
            ('hybrid', 'Hybrid Control')
        ],
        verbose_name=_("Interaction Mode")
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_("Created At")
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name=_("Updated At")
    )

    class Meta:
        verbose_name = _("VR Environment Config")
        verbose_name_plural = _("VR Environment Configs")
        indexes = [
            models.Index(fields=['user_id'], name='idx_vr_config_user')
        ]

    def __str__(self):
        return f"{self.environment_name} ({self.scene_type})"


class VRSession(models.Model):
    """
    Model for tracking VR session data.
    """
    user_id = models.IntegerField(
        verbose_name=_("User ID")
    )
    config = models.ForeignKey(
        VREnvironmentConfig,
        on_delete=models.CASCADE,
        related_name='sessions',
        verbose_name=_("Environment Config")
    )
    start_time = models.DateTimeField(
        verbose_name=_("Start Time")
    )
    end_time = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_("End Time")
    )
    duration = models.IntegerField(
        null=True,
        blank=True,
        verbose_name=_("Duration in seconds")
    )
    device_type = models.CharField(
        max_length=100,
        verbose_name=_("VR Device Type")
    )
    performance_metrics = models.JSONField(
        default=dict,
        verbose_name=_("Performance Metrics")
    )

    class Meta:
        verbose_name = _("VR Session")
        verbose_name_plural = _("VR Sessions")
        indexes = [
            models.Index(fields=['user_id', 'start_time'], name='idx_vr_session_user_time')
        ]

    def __str__(self):
        return f"Session {self.id} - {self.config.environment_name}"


class VRInteraction(models.Model):
    """
    Model for tracking user interactions in VR.
    """
    session = models.ForeignKey(
        VRSession,
        on_delete=models.CASCADE,
        related_name='interactions',
        verbose_name=_("VR Session")
    )
    interaction_type = models.CharField(
        max_length=50,
        choices=[
            ('grab', 'Grab Object'),
            ('point', 'Point'),
            ('menu', 'Menu Interaction'),
            ('instrument', 'Instrument Control')
        ],
        verbose_name=_("Interaction Type")
    )
    target_object = models.CharField(
        max_length=100,
        verbose_name=_("Target Object")
    )
    position_data = models.JSONField(
        default=dict,
        verbose_name=_("Position Data")
    )
    timestamp = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_("Timestamp")
    )

    class Meta:
        verbose_name = _("VR Interaction")
        verbose_name_plural = _("VR Interactions")
        indexes = [
            models.Index(fields=['session', 'interaction_type'], name='idx_vr_interaction_type')
        ]

    def __str__(self):
        return f"{self.interaction_type} on {self.target_object}"

from django.db import models
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _

User = get_user_model()

class DAWControlState(models.Model):
    """
    Model to store DAW control states in VR.
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='daw_control_states',
        verbose_name=_("User")
    )
    control_id = models.CharField(
        max_length=50,
        verbose_name=_("Control ID")
    )
    value = models.FloatField(
        verbose_name=_("Control Value")
    )
    environment = models.CharField(
        max_length=50,
        verbose_name=_("Environment")
    )
    immersive_mode = models.BooleanField(
        default=False,
        verbose_name=_("Immersive Mode")
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
        verbose_name = _("DAW Control State")
        verbose_name_plural = _("DAW Control States")
        indexes = [
            models.Index(fields=['user', 'control_id'], name='idx_daw_control_user'),
            models.Index(fields=['environment'], name='idx_daw_environment')
        ]
        permissions = [
            ("manage_daw_controls", "Can manage DAW controls"),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.control_id} ({self.environment})"


class VRInteractionLog(models.Model):
    """
    Model to log VR interactions for analytics and sync.
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='vr_interaction_logs',
        verbose_name=_("User")
    )
    interaction_type = models.CharField(
        max_length=50,
        choices=[
            ('control_change', 'Control Change'),
            ('environment_switch', 'Environment Switch'),
            ('mode_toggle', 'Mode Toggle'),
            ('state_save', 'State Save')
        ],
        verbose_name=_("Interaction Type")
    )
    details = models.JSONField(
        null=True,
        blank=True,
        verbose_name=_("Interaction Details")
    )
    timestamp = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_("Timestamp")
    )

    class Meta:
        verbose_name = _("VR Interaction Log")
        verbose_name_plural = _("VR Interaction Logs")
        indexes = [
            models.Index(fields=['user', 'interaction_type'], name='idx_vr_interaction_user'),
            models.Index(fields=['timestamp'], name='idx_vr_interaction_time')
        ]
        permissions = [
            ("view_interaction_logs", "Can view VR interaction logs"),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.interaction_type} at {self.timestamp}"

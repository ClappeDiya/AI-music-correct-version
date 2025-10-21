from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator


class WearableDevice(models.Model):
    """
    Model for managing wearable devices.
    """
    user_id = models.IntegerField(
        verbose_name=_("User ID")
    )
    device_name = models.CharField(
        max_length=100,
        verbose_name=_("Device Name")
    )
    device_id = models.CharField(
        max_length=100,
        unique=True,
        verbose_name=_("Device ID")
    )
    device_type = models.CharField(
        max_length=50,
        choices=[
            ('smartwatch', 'Smartwatch'),
            ('fitness_tracker', 'Fitness Tracker'),
            ('ar_glasses', 'AR Glasses'),
            ('other', 'Other')
        ],
        verbose_name=_("Device Type")
    )
    connection_status = models.CharField(
        max_length=20,
        choices=[
            ('connected', 'Connected'),
            ('disconnected', 'Disconnected'),
            ('pairing', 'Pairing'),
            ('error', 'Error')
        ],
        default='disconnected',
        verbose_name=_("Connection Status")
    )
    last_sync = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_("Last Sync")
    )
    settings = models.JSONField(
        default=dict,
        verbose_name=_("Device Settings")
    )

    class Meta:
        verbose_name = _("Wearable Device")
        verbose_name_plural = _("Wearable Devices")
        indexes = [
            models.Index(fields=['user_id', 'connection_status'], name='idx_wearable_status')
        ]

    def __str__(self):
        return f"{self.device_name} ({self.get_device_type_display()})"


class BiofeedbackData(models.Model):
    """
    Model for storing biofeedback data from wearable devices.
    """
    user_id = models.IntegerField(
        verbose_name=_("User ID")
    )
    device = models.ForeignKey(
        WearableDevice,
        on_delete=models.CASCADE,
        related_name='biofeedback_data',
        verbose_name=_("Device")
    )
    data_type = models.CharField(
        max_length=50,
        choices=[
            ('heart_rate', 'Heart Rate'),
            ('step_count', 'Step Count'),
            ('movement', 'Movement'),
            ('temperature', 'Temperature')
        ],
        verbose_name=_("Data Type")
    )
    value = models.FloatField(
        verbose_name=_("Value")
    )
    unit = models.CharField(
        max_length=20,
        verbose_name=_("Unit")
    )
    timestamp = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_("Timestamp")
    )

    class Meta:
        verbose_name = _("Biofeedback Data")
        verbose_name_plural = _("Biofeedback Data")
        indexes = [
            models.Index(fields=['user_id', 'data_type', 'timestamp'], name='idx_biofeedback_type_time')
        ]

    def __str__(self):
        return f"{self.get_data_type_display()} from {self.device.device_name}"


class BiofeedbackEvent(models.Model):
    """
    Model for tracking biofeedback-triggered music events.
    """
    user_id = models.IntegerField(
        verbose_name=_("User ID")
    )
    event_type = models.CharField(
        max_length=50,
        choices=[
            ('tempo_change', 'Tempo Change'),
            ('energy_adjustment', 'Energy Adjustment'),
            ('mood_shift', 'Mood Shift'),
            ('alert', 'Alert')
        ],
        verbose_name=_("Event Type")
    )
    trigger_data = models.ForeignKey(
        BiofeedbackData,
        on_delete=models.CASCADE,
        related_name='triggered_events',
        verbose_name=_("Trigger Data")
    )
    previous_state = models.JSONField(
        default=dict,
        verbose_name=_("Previous State")
    )
    new_state = models.JSONField(
        default=dict,
        verbose_name=_("New State")
    )
    confidence_score = models.FloatField(
        validators=[MinValueValidator(0), MaxValueValidator(1)],
        verbose_name=_("Confidence Score")
    )
    timestamp = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_("Timestamp")
    )

    class Meta:
        verbose_name = _("Biofeedback Event")
        verbose_name_plural = _("Biofeedback Events")
        indexes = [
            models.Index(fields=['user_id', 'event_type'], name='idx_biofeedback_event_type')
        ]

    def __str__(self):
        return f"{self.get_event_type_display()} triggered by {self.trigger_data.get_data_type_display()}"

from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator


class NeuralDevice(models.Model):
    """
    Model for managing neural interface devices.
    """
    user_id = models.IntegerField(
        verbose_name=_("User ID")
    )
    device_name = models.CharField(
        max_length=100,
        verbose_name=_("Device Name")
    )
    device_type = models.CharField(
        max_length=50,
        choices=[
            ('eeg', 'EEG Headset'),
            ('emg', 'EMG Sensor'),
            ('hybrid', 'Hybrid Device')
        ],
        verbose_name=_("Device Type")
    )
    connection_status = models.CharField(
        max_length=20,
        choices=[
            ('connected', 'Connected'),
            ('disconnected', 'Disconnected'),
            ('calibrating', 'Calibrating'),
            ('error', 'Error')
        ],
        default='disconnected',
        verbose_name=_("Connection Status")
    )
    last_calibration = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_("Last Calibration")
    )
    settings = models.JSONField(
        default=dict,
        verbose_name=_("Device Settings")
    )

    class Meta:
        verbose_name = _("Neural Device")
        verbose_name_plural = _("Neural Devices")
        indexes = [
            models.Index(fields=['user_id', 'connection_status'], name='idx_neural_device_status')
        ]

    def __str__(self):
        return f"{self.device_name} ({self.get_device_type_display()})"


class NeuralSignal(models.Model):
    """
    Model for storing neural signal data.
    """
    device = models.ForeignKey(
        NeuralDevice,
        on_delete=models.CASCADE,
        related_name='signals',
        verbose_name=_("Device")
    )
    signal_type = models.CharField(
        max_length=50,
        choices=[
            ('alpha', 'Alpha Waves'),
            ('beta', 'Beta Waves'),
            ('gamma', 'Gamma Waves'),
            ('muscle', 'Muscle Activity')
        ],
        verbose_name=_("Signal Type")
    )
    signal_data = models.JSONField(
        verbose_name=_("Signal Data")
    )
    signal_quality = models.FloatField(
        validators=[MinValueValidator(0), MaxValueValidator(1)],
        verbose_name=_("Signal Quality")
    )
    timestamp = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_("Timestamp")
    )

    class Meta:
        verbose_name = _("Neural Signal")
        verbose_name_plural = _("Neural Signals")
        indexes = [
            models.Index(fields=['device', 'signal_type', 'timestamp'], name='idx_signal_type_time')
        ]

    def __str__(self):
        return f"{self.get_signal_type_display()} from {self.device.device_name}"


class NeuralControl(models.Model):
    """
    Model for mapping neural signals to music controls.
    """
    user_id = models.IntegerField(
        verbose_name=_("User ID")
    )
    name = models.CharField(
        max_length=100,
        verbose_name=_("Control Name")
    )
    signal_type = models.CharField(
        max_length=50,
        choices=[
            ('alpha', 'Alpha Waves'),
            ('beta', 'Beta Waves'),
            ('gamma', 'Gamma Waves'),
            ('muscle', 'Muscle Activity')
        ],
        verbose_name=_("Signal Type")
    )
    control_parameter = models.CharField(
        max_length=50,
        choices=[
            ('volume', 'Volume'),
            ('pitch', 'Pitch'),
            ('tempo', 'Tempo'),
            ('filter', 'Filter'),
            ('effect', 'Effect')
        ],
        verbose_name=_("Control Parameter")
    )
    mapping_function = models.CharField(
        max_length=50,
        choices=[
            ('linear', 'Linear'),
            ('exponential', 'Exponential'),
            ('threshold', 'Threshold'),
            ('custom', 'Custom')
        ],
        verbose_name=_("Mapping Function")
    )
    mapping_config = models.JSONField(
        default=dict,
        verbose_name=_("Mapping Configuration")
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name=_("Active Status")
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
        verbose_name = _("Neural Control")
        verbose_name_plural = _("Neural Controls")
        unique_together = ['user_id', 'name']
        indexes = [
            models.Index(fields=['user_id', 'is_active'], name='idx_control_user_status')
        ]

    def __str__(self):
        return f"{self.name} ({self.get_signal_type_display()} → {self.get_control_parameter_display()})"

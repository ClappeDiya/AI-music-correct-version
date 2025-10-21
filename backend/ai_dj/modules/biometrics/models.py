from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from ...models import AIDJSession
from django.conf import settings
from django.utils.translation import gettext_lazy as _

class WearableDevice(models.Model):
    DEVICE_TYPES = [
        ('garmin', 'Garmin'),
        ('apple', 'Apple Watch'),
        ('fitbit', 'Fitbit'),
    ]

    device_id = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=20, choices=DEVICE_TYPES)
    status = models.CharField(
        max_length=20,
        choices=[
            ('available', 'Available'),
            ('connected', 'Connected'),
            ('disconnected', 'Disconnected'),
            ('error', 'Error'),
        ],
        default='available'
    )
    last_connected = models.DateTimeField(null=True, blank=True)
    battery_level = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        null=True,
        blank=True
    )

    def __str__(self):
        return f"{self.name} ({self.type})"

class BiometricData(models.Model):
    device = models.ForeignKey(WearableDevice, on_delete=models.CASCADE)
    session = models.ForeignKey(AIDJSession, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    heart_rate = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(250)]
    )
    stress_level = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    energy_level = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    movement = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    mood = models.CharField(
        max_length=20,
        choices=[
            ('energetic', 'Energetic'),
            ('calm', 'Calm'),
            ('stressed', 'Stressed'),
            ('focused', 'Focused'),
        ]
    )

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"Biometric Data for {self.device.name} at {self.timestamp}"

class BiometricPreference(models.Model):
    session = models.OneToOneField(AIDJSession, on_delete=models.CASCADE)
    target_heart_rate = models.IntegerField(
        validators=[MinValueValidator(60), MaxValueValidator(180)],
        null=True,
        blank=True
    )
    target_energy_level = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        null=True,
        blank=True
    )
    stress_management = models.BooleanField(default=True)
    mood_matching = models.BooleanField(default=True)

    def __str__(self):
        return f"Biometric Preferences for Session {self.session.id}"

class GroupEmotionalState(models.Model):
    session = models.ForeignKey(AIDJSession, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    # Aggregated metrics
    median_heart_rate = models.FloatField(null=True)
    median_energy_level = models.FloatField(null=True)
    median_stress_level = models.FloatField(null=True)
    
    # Dominant group emotion
    dominant_emotion = models.CharField(max_length=50)
    emotion_distribution = models.JSONField(default=dict)
    
    # Group consensus metrics
    consensus_strength = models.FloatField(
        validators=[MinValueValidator(0), MaxValueValidator(1)],
        help_text="How strongly the group agrees on the emotional state (0-1)"
    )
    
    participant_count = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['-timestamp']
        
    def __str__(self):
        return f"Group State for {self.session} at {self.timestamp}"

class EmotionalPreference(models.Model):
    user = models.ForeignKey('auth.User', on_delete=models.CASCADE)
    session = models.ForeignKey(AIDJSession, on_delete=models.CASCADE)
    
    # Individual preferences for group sessions
    emotion_weight = models.FloatField(
        default=1.0,
        validators=[MinValueValidator(0), MaxValueValidator(2.0)],
        help_text="How much this user's emotions should influence the group (0-2)"
    )
    
    prefer_emotional_sync = models.BooleanField(
        default=True,
        help_text="Whether to try matching the group's emotional state"
    )
    
    emotion_influence_radius = models.FloatField(
        default=0.5,
        validators=[MinValueValidator(0), MaxValueValidator(1)],
        help_text="How much to be influenced by nearby participants in VR (0-1)"
    )
    
    class Meta:
        unique_together = ['user', 'session']
        
    def __str__(self):
        return f"Emotional Preferences for {self.user} in {self.session}"

class BiometricDevice(models.Model):
    """
    Model to store information about biometric devices.
    """
    name = models.CharField(max_length=100)
    device_type = models.CharField(max_length=50)
    manufacturer = models.CharField(max_length=100)
    model_number = models.CharField(max_length=100)
    firmware_version = models.CharField(max_length=50)
    last_calibration = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Biometric Device')
        verbose_name_plural = _('Biometric Devices')
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.device_type})"

class BiometricReading(models.Model):
    """
    Model to store biometric readings from devices.
    """
    READING_TYPES = [
        ('heart_rate', _('Heart Rate')),
        ('blood_pressure', _('Blood Pressure')),
        ('temperature', _('Temperature')),
        ('gsr', _('Galvanic Skin Response')),
        ('eeg', _('EEG')),
        ('movement', _('Movement')),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    device = models.ForeignKey(BiometricDevice, on_delete=models.CASCADE)
    reading_type = models.CharField(max_length=50, choices=READING_TYPES)
    value = models.JSONField()
    timestamp = models.DateTimeField(auto_now_add=True)
    confidence_score = models.FloatField(default=1.0)
    metadata = models.JSONField(default=dict)

    class Meta:
        verbose_name = _('Biometric Reading')
        verbose_name_plural = _('Biometric Readings')
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user', 'reading_type', 'timestamp']),
        ]

    def __str__(self):
        return f"{self.user} - {self.reading_type} - {self.timestamp}"

class BiometricProfile(models.Model):
    """
    Model to store user biometric profiles.
    """
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    baseline_metrics = models.JSONField(default=dict)
    preferences = models.JSONField(default=dict)
    last_updated = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = _('Biometric Profile')
        verbose_name_plural = _('Biometric Profiles')
        ordering = ['user']

    def __str__(self):
        return f"Profile for {self.user}"

class BiometricAlert(models.Model):
    """
    Model to store biometric alerts and notifications.
    """
    SEVERITY_CHOICES = [
        ('low', _('Low')),
        ('medium', _('Medium')),
        ('high', _('High')),
        ('critical', _('Critical')),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    reading = models.ForeignKey(BiometricReading, on_delete=models.CASCADE)
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES)
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    acknowledged = models.BooleanField(default=False)
    acknowledged_at = models.DateTimeField(null=True, blank=True)
    acknowledged_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='acknowledged_alerts'
    )

    class Meta:
        verbose_name = _('Biometric Alert')
        verbose_name_plural = _('Biometric Alerts')
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.user} - {self.severity} - {self.timestamp}"

class BiometricCalibration(models.Model):
    """
    Model to store device calibration history.
    """
    device = models.ForeignKey(BiometricDevice, on_delete=models.CASCADE)
    calibrated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    calibration_date = models.DateTimeField()
    next_calibration = models.DateTimeField()
    calibration_data = models.JSONField(default=dict)
    notes = models.TextField(blank=True)
    success = models.BooleanField(default=True)

    class Meta:
        verbose_name = _('Biometric Calibration')
        verbose_name_plural = _('Biometric Calibrations')
        ordering = ['-calibration_date']

    def __str__(self):
        return f"{self.device} - {self.calibration_date}"

class BiometricFeedback(models.Model):
    """
    Model to store user feedback on biometric readings.
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    reading = models.ForeignKey(BiometricReading, on_delete=models.CASCADE)
    accuracy_rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    comfort_rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    comments = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('Biometric Feedback')
        verbose_name_plural = _('Biometric Feedbacks')
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.user} - {self.reading} - {self.accuracy_rating}"

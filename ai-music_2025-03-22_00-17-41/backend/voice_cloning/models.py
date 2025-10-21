from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from user_management.models import User  # Import the custom user model
from django.core.validators import MinValueValidator
from cryptography.fernet import Fernet
import base64
from django.contrib.postgres.fields import ArrayField, JSONField
from django.contrib.auth import get_user_model

User = get_user_model()

class Language(models.Model):
    """
    Supported languages for voice cloning.
    """
    id = models.BigAutoField(primary_key=True)
    code = models.TextField(unique=True, verbose_name=_("Language Code"), help_text=_("Unique language code (e.g., 'en-US', 'fr-FR')."))
    name = models.TextField(verbose_name=_("Language Name"), help_text=_("Name of the language."))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("Timestamp when the language was created."))

    class Meta:
        verbose_name = _("Language")
        verbose_name_plural = _("Languages")

    def __str__(self):
        return f"{self.name} ({self.code})"


class Emotion(models.Model):
    """
    Supported emotions for voice cloning.
    """
    id = models.BigAutoField(primary_key=True)
    label = models.TextField(unique=True, verbose_name=_("Emotion Label"), help_text=_("Unique label for the emotion (e.g., 'happy', 'sad')."))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("Timestamp when the emotion was created."))

    class Meta:
        verbose_name = _("Emotion")
        verbose_name_plural = _("Emotions")

    def __str__(self):
        return self.label


class VoiceCloningSettings(models.Model):
    """
    Global settings for voice cloning parameters.
    """
    id = models.BigAutoField(primary_key=True)
    setting_key = models.TextField(unique=True, verbose_name=_("Setting Key"), help_text=_("Unique key for the setting."))
    setting_value = models.TextField(verbose_name=_("Setting Value"), help_text=_("Value of the setting."))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("Timestamp when the setting was created."))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"), help_text=_("Timestamp when the setting was last updated."))

    class Meta:
        verbose_name = _("Voice Cloning Setting")
        verbose_name_plural = _("Voice Cloning Settings")

    def __str__(self):
        return f"{self.setting_key}: {self.setting_value}"


class VoiceRecordingSession(models.Model):
    """
    A session during which the user records their voice samples.
    """
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='voice_recording_sessions', verbose_name=_("User"), help_text=_("User who created the recording session."))
    session_name = models.TextField(blank=True, null=True, verbose_name=_("Session Name"), help_text=_("Optional name for the recording session."))
    instructions_shown = models.BooleanField(default=True, verbose_name=_("Instructions Shown"), help_text=_("Indicates if instructions were shown to the user during the session."))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("Timestamp when the session was created."))
    ended_at = models.DateTimeField(blank=True, null=True, verbose_name=_("Ended At"), help_text=_("Timestamp when the session ended."))
    language_code = models.TextField(blank=True, null=True, verbose_name=_("Language Code"), help_text=_("Language code for the recording session.")) # references shared.languages(code) if needed, or just a free-form field

    class Meta:
        verbose_name = _("Voice Recording Session")
        verbose_name_plural = _("Voice Recording Sessions")
        indexes = [
            models.Index(fields=['user'], name='idx_voice_sessions_user'),
        ]

    def __str__(self):
        return f"Session {self.id} by {self.user}"


class VoiceSample(models.Model):
    """
    Voice samples uploaded or recorded by the user.
    """
    id = models.BigAutoField(primary_key=True)
    session = models.ForeignKey(VoiceRecordingSession, on_delete=models.CASCADE, related_name='voice_samples', verbose_name=_("Session"), help_text=_("Recording session this sample belongs to."))
    file_url = models.TextField(verbose_name=_("File URL"), help_text=_("Secure storage location of the voice sample file."))
    metadata = models.JSONField(blank=True, null=True, verbose_name=_("Metadata"), help_text=_("Metadata about the voice sample (e.g., sample rate, duration, format)."))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("Timestamp when the sample was created."))
    emotion_tags = models.JSONField(blank=True, null=True, verbose_name=_("Emotion Tags"), help_text=_("JSON object containing detected emotions in the sample.")) # {"detected_emotions": ["happy","neutral"]} or empty if not analyzed yet.

    class Meta:
        verbose_name = _("Voice Sample")
        verbose_name_plural = _("Voice Samples")
        indexes = [
            models.Index(fields=['metadata'], name='idx_voice_samples_metadata'),
            models.Index(fields=['emotion_tags'], name='idx_voice_samples_emotion_tags'),
        ]

    def __str__(self):
        return f"Sample {self.id} from session {self.session.id}"


class VoiceModel(models.Model):
    """
    Represents a trained voice model for cloning.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='voice_models')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    settings = models.JSONField(default=dict)
    emotion_profile = models.JSONField(default=dict)
    language_capabilities = models.JSONField(default=list)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = _("Voice Model")
        verbose_name_plural = _("Voice Models")
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - {self.user.username}"


class VoiceModelVersion(models.Model):
    model = models.ForeignKey(VoiceModel, on_delete=models.CASCADE, related_name='versions')
    version_number = models.IntegerField()
    changes = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-version_number']
        unique_together = ['model', 'version_number']


class VoiceModelShare(models.Model):
    PERMISSION_CHOICES = [
        ('view', 'View'),
        ('edit', 'Edit'),
        ('admin', 'Admin'),
    ]

    model = models.ForeignKey(VoiceModel, on_delete=models.CASCADE, related_name='shares')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    permission = models.CharField(max_length=10, choices=PERMISSION_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['model', 'user']


class VoiceModelPermission(models.Model):
    """
    Permissions table to ensure explicit consent records.
    """
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='voice_model_permissions', verbose_name=_("User"), help_text=_("User who granted the permissions."))
    voice_model = models.ForeignKey(VoiceModel, on_delete=models.CASCADE, related_name='voice_model_permissions', verbose_name=_("Voice Model"), help_text=_("Voice model for which permissions are granted."))
    consent_granted_at = models.DateTimeField(blank=True, null=True, verbose_name=_("Consent Granted At"), help_text=_("Timestamp when consent was granted."))
    consent_revoked_at = models.DateTimeField(blank=True, null=True, verbose_name=_("Consent Revoked At"), help_text=_("Timestamp when consent was revoked."))
    usage_scope = models.JSONField(blank=True, null=True, verbose_name=_("Usage Scope"), help_text=_("JSON object defining the scope of usage (e.g., allowed in personal tracks only, commercial use)."))

    class Meta:
        verbose_name = _("Voice Model Permission")
        verbose_name_plural = _("Voice Model Permissions")
        indexes = [
            models.Index(fields=['user'], name='idx_voice_perms_user'),
            models.Index(fields=['usage_scope'], name='idx_voice_perms_scope'),
        ]

    def __str__(self):
         return f"Permission for {self.voice_model} by {self.user}"


class VoiceModelConsentScope(models.Model):
    """
    More granular permissions for voice model usage.
    """
    id = models.BigAutoField(primary_key=True)
    voice_model = models.ForeignKey(VoiceModel, on_delete=models.CASCADE, related_name='voice_model_consent_scopes', verbose_name=_("Voice Model"), help_text=_("Voice model for which consent scope is defined."))
    scope_data = models.JSONField(blank=True, null=True, verbose_name=_("Scope Data"), help_text=_("JSON object defining the scope of usage (e.g., allowed usage, restricted projects)."))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("Timestamp when the consent scope was created."))

    class Meta:
        verbose_name = _("Voice Model Consent Scope")
        verbose_name_plural = _("Voice Model Consent Scopes")
        indexes = [
            models.Index(fields=['voice_model'], name='idx_voice_consent_model'),
            models.Index(fields=['scope_data'], name='idx_voice_consent_data'),
        ]

    def __str__(self):
        return f"Consent scope for {self.voice_model}"


class VoiceModelUsageLog(models.Model):
    """
    Logs whenever the cloned voice model is applied.
    """
    id = models.BigAutoField(primary_key=True)
    voice_model = models.ForeignKey(VoiceModel, on_delete=models.CASCADE, related_name='voice_model_usage_logs', verbose_name=_("Voice Model"), help_text=_("Voice model that was used."))
    used_in_context = models.TextField(verbose_name=_("Used In Context"), help_text=_("Context in which the voice model was used (e.g., generated track, collaboration project)."))
    details = models.JSONField(blank=True, null=True, verbose_name=_("Details"), help_text=_("JSON object containing details about the usage (e.g., track ID, timestamp, parameters)."))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("Timestamp when the usage was logged."))

    class Meta:
        verbose_name = _("Voice Model Usage Log")
        verbose_name_plural = _("Voice Model Usage Logs")

    def __str__(self):
        return f"Usage of {self.voice_model} in {self.used_in_context}"


class VoiceModelAdaptiveEvent(models.Model):
    """
    Logs adaptive changes made to the model output mid-use.
    """
    id = models.BigAutoField(primary_key=True)
    voice_model = models.ForeignKey(VoiceModel, on_delete=models.CASCADE, related_name='voice_model_adaptive_events', verbose_name=_("Voice Model"), help_text=_("Voice model that was adapted."))
    event_type = models.TextField(verbose_name=_("Event Type"), help_text=_("Type of adaptive event (e.g., 'pitch_adjust', 'emotion_shift')."))
    event_details = models.JSONField(blank=True, null=True, verbose_name=_("Event Details"), help_text=_("JSON object containing details about the event (e.g., new emotion, pitch shift)."))
    triggered_by = models.TextField(verbose_name=_("Triggered By"), help_text=_("Source that triggered the event (e.g., 'biofeedback', 'user_command', 'AI_autonomous')."))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("Timestamp when the event was logged."))

    class Meta:
        verbose_name = _("Voice Model Adaptive Event")
        verbose_name_plural = _("Voice Model Adaptive Events")
        indexes = [
            models.Index(fields=['voice_model'], name='idx_voice_adaptive'),
        ]

    def __str__(self):
        return f"Adaptive event {self.event_type} for {self.voice_model}"


# Add new model for voice analysis
class VoiceAnalysis(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed')
    ]

    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey('user_management.User', on_delete=models.CASCADE)
    voice_model = models.ForeignKey('VoiceModel', on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    progress_percentage = models.IntegerField(default=0)
    current_step = models.CharField(max_length=50, null=True, blank=True)
    estimated_time_remaining = models.IntegerField(null=True, blank=True)  # in seconds
    results = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

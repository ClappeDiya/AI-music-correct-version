from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
import uuid
import os
from datetime import timedelta
from django.utils import timezone


def get_ephemeral_path(instance, filename):
    """Generate a unique path for ephemeral data storage."""
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    return os.path.join('ephemeral', str(instance.user.id), filename)


class PrivacySettings(models.Model):
    """User privacy preferences and settings."""
    
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='privacy_settings'
    )
    store_voice_data = models.BooleanField(default=False)
    store_emotional_data = models.BooleanField(default=False)
    data_retention_days = models.IntegerField(default=7)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Privacy settings'


class EphemeralVoiceData(models.Model):
    """Temporary storage for voice data with automatic deletion."""
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='voice_data'
    )
    file = models.FileField(upload_to=get_ephemeral_path)
    voice_print_hash = models.CharField(max_length=64, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expiry_time = models.DateTimeField()
    is_processed = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if not self.expiry_time:
            # Set default expiry time to 24 hours from creation
            self.expiry_time = timezone.now() + timedelta(hours=24)
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        # Ensure file is deleted from storage
        if self.file:
            try:
                storage = self.file.storage
                if storage.exists(self.file.name):
                    storage.delete(self.file.name)
            except Exception as e:
                print(f"Error deleting file: {e}")
        super().delete(*args, **kwargs)


class EmotionalAnalysisLog(models.Model):
    """Ephemeral storage for emotional analysis data."""
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='emotional_logs'
    )
    session_id = models.UUIDField(default=uuid.uuid4)
    emotion_data = models.JSONField(
        help_text="Encrypted emotional analysis data"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    expiry_time = models.DateTimeField()
    is_anonymized = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if not self.expiry_time:
            # Get user's retention setting
            retention_days = self.user.privacy_settings.data_retention_days
            self.expiry_time = timezone.now() + timedelta(days=retention_days)
        super().save(*args, **kwargs)

    class Meta:
        indexes = [
            models.Index(fields=['user', 'session_id']),
            models.Index(fields=['expiry_time']),
        ]


class DataDeletionRequest(models.Model):
    """Track user requests for data deletion."""
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='deletion_requests'
    )
    request_type = models.CharField(
        max_length=20,
        choices=[
            ('voice', 'Voice Data'),
            ('emotional', 'Emotional Data'),
            ('all', 'All Data'),
        ]
    )
    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('processing', 'Processing'),
            ('completed', 'Completed'),
            ('failed', 'Failed'),
        ],
        default='pending'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']

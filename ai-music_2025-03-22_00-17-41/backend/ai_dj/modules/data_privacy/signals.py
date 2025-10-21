from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .models import PrivacySettings, EphemeralVoiceData, EmotionalAnalysisLog
from django.utils import timezone

User = get_user_model()


@receiver(post_save, sender=User)
def create_privacy_settings(sender, instance, created, **kwargs):
    """Create privacy settings for new users."""
    if created:
        PrivacySettings.objects.create(user=instance)


@receiver(pre_delete, sender=EphemeralVoiceData)
def cleanup_voice_files(sender, instance, **kwargs):
    """Ensure voice files are deleted from storage."""
    if instance.file:
        try:
            storage = instance.file.storage
            if storage.exists(instance.file.name):
                storage.delete(instance.file.name)
        except Exception as e:
            print(f"Error deleting voice file: {e}")


@receiver(post_save, sender=EmotionalAnalysisLog)
def schedule_emotion_data_cleanup(sender, instance, created, **kwargs):
    """Schedule emotional data for anonymization."""
    if created and instance.expiry_time:
        from django.core.cache import cache
        cache_key = f'emotion_cleanup_{instance.id}'
        time_until_expiry = (
            instance.expiry_time - timezone.now()
        ).total_seconds()
        cache.set(cache_key, instance.id, timeout=int(time_until_expiry))

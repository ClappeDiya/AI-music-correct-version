from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.core.cache import cache
from .models import AnalyticsEvent, LLMRequest, TrackReference

@receiver([post_save, post_delete], sender=AnalyticsEvent)
def invalidate_analytics_cache(sender, instance, **kwargs):
    """Invalidate analytics caches when events change"""
    cache.delete(f"analytics_report:day:{instance.user.id}")
    cache.delete(f"analytics_report:week:{instance.user.id}")
    cache.delete(f"analytics_report:month:{instance.user.id}")
    cache.delete(f"user_metrics:{instance.user.id}")

@receiver([post_save, post_delete], sender=LLMRequest)
def invalidate_llm_cache(sender, instance, **kwargs):
    """Invalidate LLM caches when requests change"""
    cache.delete(f"token_status:{instance.user_id}")

@receiver([post_save, post_delete], sender=TrackReference)
def invalidate_track_reference_cache(sender, instance, **kwargs):
    """Invalidate track reference cache when references change"""
    cache.delete(f"track_reference:{instance.id}") 
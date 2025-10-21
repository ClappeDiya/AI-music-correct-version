from celery import shared_task
from django.utils import timezone
from .models import EphemeralEventPreference, UserSettings


@shared_task
def cleanup_expired_events():
    """
    Periodic task to cleanup expired ephemeral events and revert settings
    """
    now = timezone.now()
    expired_events = EphemeralEventPreference.objects.filter(
        active=True,
        end_time__lt=now
    ).select_related('user')

    for event in expired_events:
        # Get the user's default settings
        user_settings = UserSettings.objects.get(user=event.user)
        
        # Revert any overridden settings
        if event.ephemeral_prefs:
            default_prefs = user_settings.preferences or {}
            # Remove any ephemeral preferences
            for category in event.ephemeral_prefs:
                if category in default_prefs:
                    default_prefs[category].update(default_prefs[category])
            user_settings.preferences = default_prefs
            user_settings.save()

        # Deactivate the ephemeral event
        event.active = False
        event.save()

    return f"Cleaned up {expired_events.count()} expired events"


@shared_task
def apply_scheduled_events():
    """
    Periodic task to apply scheduled ephemeral events
    """
    now = timezone.now()
    scheduled_events = EphemeralEventPreference.objects.filter(
        active=True,
        start_time__lte=now,
        end_time__gt=now,
        next_scheduled__lte=now
    ).select_related('user')

    for event in scheduled_events:
        # Get the user's current settings
        user_settings = UserSettings.objects.get(user=event.user)
        
        # Apply ephemeral preferences
        if event.ephemeral_prefs:
            current_prefs = user_settings.preferences or {}
            # Override with ephemeral preferences
            for category, settings in event.ephemeral_prefs.items():
                if category not in current_prefs:
                    current_prefs[category] = {}
                current_prefs[category].update(settings)
            user_settings.preferences = current_prefs
            user_settings.save()

        # Update next scheduled time if this is a recurring event
        if event.duration_minutes:
            event.next_scheduled = now + timezone.timedelta(minutes=event.duration_minutes)
            event.save()

    return f"Applied {scheduled_events.count()} scheduled events"

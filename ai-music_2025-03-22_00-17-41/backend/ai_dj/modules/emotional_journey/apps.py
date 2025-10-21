from django.apps import AppConfig


class EmotionalJourneyConfig(AppConfig):
    name = 'ai_dj.modules.emotional_journey'
    verbose_name = 'AI DJ Emotional Journey'
    
    def ready(self):
        """Initialize app-specific settings and signal handlers."""
        try:
            import ai_dj.modules.emotional_journey.signals  # noqa
        except ImportError:
            pass

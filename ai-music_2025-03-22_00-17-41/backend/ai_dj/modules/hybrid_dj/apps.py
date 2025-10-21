from django.apps import AppConfig


class HybridDJConfig(AppConfig):
    name = 'ai_dj.modules.hybrid_dj'
    verbose_name = 'AI DJ Hybrid Experience'
    
    def ready(self):
        """Initialize app-specific settings and signal handlers."""
        try:
            import ai_dj.modules.hybrid_dj.signals  # noqa
        except ImportError:
            pass

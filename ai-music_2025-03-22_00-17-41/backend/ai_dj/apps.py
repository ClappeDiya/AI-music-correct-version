from django.apps import AppConfig


class AiDjConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'ai_dj'
    verbose_name = 'AI DJ'

    def ready(self):
        """Initialize app when it's ready."""
        try:
            # Import signals and monitoring
            from . import signals  # noqa
            from .modules.monitoring import models  # noqa
        except ImportError:
            pass

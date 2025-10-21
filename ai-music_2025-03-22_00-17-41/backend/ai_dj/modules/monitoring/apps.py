from django.apps import AppConfig


class MonitoringConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'ai_dj.modules.monitoring'
    label = 'monitoring'
    verbose_name = 'AI DJ Monitoring'

    def ready(self):
        """Initialize app when it's ready."""
        try:
            # Import signals
            from . import signals  # noqa
        except ImportError:
            pass 
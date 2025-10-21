from django.apps import AppConfig


class DataPrivacyConfig(AppConfig):
    name = 'ai_dj.modules.data_privacy'
    verbose_name = 'Data Privacy'
    
    def ready(self):
        """Initialize app-specific settings and signal handlers."""
        try:
            import ai_dj.modules.data_privacy.signals  # noqa
        except ImportError:
            pass

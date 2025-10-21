from django.apps import AppConfig


class BiometricsConfig(AppConfig):
    name = 'ai_dj.modules.biometrics'
    verbose_name = 'AI DJ Biometrics'
    
    def ready(self):
        """Initialize app-specific settings and signal handlers."""
        try:
            import ai_dj.modules.biometrics.signals  # noqa
        except ImportError:
            pass

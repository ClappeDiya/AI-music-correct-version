from django.apps import AppConfig


class VRDJConfig(AppConfig):
    name = 'ai_dj.modules.vr_dj'
    verbose_name = 'VR/AR DJ Experience'
    
    def ready(self):
        """Initialize app-specific settings and signal handlers."""
        try:
            import ai_dj.modules.vr_dj.signals  # noqa
        except ImportError:
            pass

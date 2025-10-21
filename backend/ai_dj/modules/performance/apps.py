from django.apps import AppConfig


class PerformanceConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'ai_dj.modules.performance'
    label = 'performance'
    verbose_name = 'Performance & Scaling'
    path = 'backend/ai_dj/modules/performance'
    
    def ready(self):
        """Initialize app-specific settings and signal handlers."""
        try:
            import ai_dj.modules.performance.signals  # noqa
        except ImportError:
            pass

from django.apps import AppConfig


class DJChatConfig(AppConfig):
    name = 'ai_dj.modules.dj_chat'
    verbose_name = 'AI DJ Chat Companion'
    
    def ready(self):
        """Initialize app-specific settings and signal handlers."""
        try:
            import ai_dj.modules.dj_chat.signals  # noqa
        except ImportError:
            pass

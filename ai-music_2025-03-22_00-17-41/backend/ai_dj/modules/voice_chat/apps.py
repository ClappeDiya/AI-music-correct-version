from django.apps import AppConfig


class VoiceChatConfig(AppConfig):
    name = 'ai_dj.modules.voice_chat'
    verbose_name = 'AI DJ Voice Chat'
    
    def ready(self):
        """Initialize app-specific settings and signal handlers."""
        try:
            import ai_dj.modules.voice_chat.signals  # noqa
        except ImportError:
            pass

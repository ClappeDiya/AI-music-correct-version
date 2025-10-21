from django.apps import AppConfig


class VoiceEmotionConfig(AppConfig):
    name = 'ai_dj.modules.voice_emotion'
    verbose_name = 'AI DJ Voice Emotion'
    
    def ready(self):
        """Initialize app-specific settings and signal handlers."""
        try:
            import ai_dj.modules.voice_emotion.signals  # noqa
        except ImportError:
            pass

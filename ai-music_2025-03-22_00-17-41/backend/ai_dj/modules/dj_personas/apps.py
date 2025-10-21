from django.apps import AppConfig

class DJPersonasConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'ai_dj.modules.dj_personas'
    verbose_name = 'DJ Personas'

    def ready(self):
        try:
            import ai_dj.modules.dj_personas.signals
        except ImportError:
            pass

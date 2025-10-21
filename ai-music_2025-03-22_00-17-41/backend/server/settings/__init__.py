import os

# Default to development settings
settings_module = os.environ.get('DJANGO_SETTINGS_MODULE', 'backend.settings.development')

if settings_module == 'backend.settings.production':
    from .production import *
else:
    from ..settings import *  # Use the base settings as development settings

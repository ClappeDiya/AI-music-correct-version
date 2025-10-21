from typing import Dict, Any
from django.conf import settings
import json
import logging
from .models import TranslingualPreference, UserSettings

logger = logging.getLogger(__name__)

class TranslingualService:
    """Service for handling language-agnostic preference management."""

    UNIVERSAL_KEYS = {
        'volume': 'audio.volume',
        'brightness': 'display.brightness',
        'theme': 'display.theme',
        'notifications': 'system.notifications',
        'quality': 'audio.quality',
        'latency': 'audio.latency',
        'compression': 'audio.compression',
        'eq_preset': 'audio.eq_preset',
        'monitoring': 'audio.monitoring',
    }

    LOCALE_MAPPINGS = {
        'en': {
            'audio.volume': 'volume',
            'display.brightness': 'brightness',
            'display.theme': 'theme',
            'system.notifications': 'notifications',
            'audio.quality': 'quality',
            'audio.latency': 'latency',
            'audio.compression': 'compression',
            'audio.eq_preset': 'equalizer preset',
            'audio.monitoring': 'monitoring',
        },
        'es': {
            'audio.volume': 'volumen',
            'display.brightness': 'brillo',
            'display.theme': 'tema',
            'system.notifications': 'notificaciones',
            'audio.quality': 'calidad',
            'audio.latency': 'latencia',
            'audio.compression': 'compresión',
            'audio.eq_preset': 'preajuste de ecualizador',
            'audio.monitoring': 'monitoreo',
        },
        'fr': {
            'audio.volume': 'volume',
            'display.brightness': 'luminosité',
            'display.theme': 'thème',
            'system.notifications': 'notifications',
            'audio.quality': 'qualité',
            'audio.latency': 'latence',
            'audio.compression': 'compression',
            'audio.eq_preset': 'préréglage d\'égaliseur',
            'audio.monitoring': 'monitoring',
        },
        # Add more languages as needed
    }

    VALUE_MAPPINGS = {
        'theme': {
            'en': {'dark': 'dark', 'light': 'light', 'system': 'system'},
            'es': {'dark': 'oscuro', 'light': 'claro', 'system': 'sistema'},
            'fr': {'dark': 'sombre', 'light': 'clair', 'system': 'système'},
        },
        'quality': {
            'en': {'high': 'high', 'medium': 'medium', 'low': 'low'},
            'es': {'high': 'alta', 'medium': 'media', 'low': 'baja'},
            'fr': {'high': 'haute', 'medium': 'moyenne', 'low': 'basse'},
        },
        # Add more value mappings as needed
    }

    @classmethod
    def to_universal_format(cls, preferences: Dict[str, Any], source_locale: str) -> Dict[str, Any]:
        """Convert locale-specific preferences to universal format."""
        universal = {}
        locale_map = {v: k for k, v in cls.LOCALE_MAPPINGS[source_locale].items()}

        for category, values in preferences.items():
            if isinstance(values, dict):
                for key, value in values.items():
                    universal_key = locale_map.get(f"{category}.{key}")
                    if universal_key:
                        # Convert value if it has language-specific mappings
                        category_name = universal_key.split('.')[1]
                        if category_name in cls.VALUE_MAPPINGS:
                            value_map = {v: k for k, v in cls.VALUE_MAPPINGS[category_name][source_locale].items()}
                            value = value_map.get(value, value)
                        
                        cat, setting = universal_key.split('.')
                        if cat not in universal:
                            universal[cat] = {}
                        universal[cat][setting] = value

        return universal

    @classmethod
    def from_universal_format(cls, universal_prefs: Dict[str, Any], target_locale: str) -> Dict[str, Any]:
        """Convert universal format preferences to locale-specific format."""
        localized = {}
        
        for category, values in universal_prefs.items():
            if isinstance(values, dict):
                for key, value in values.items():
                    universal_key = f"{category}.{key}"
                    if universal_key in cls.LOCALE_MAPPINGS[target_locale]:
                        # Convert value if it has language-specific mappings
                        if key in cls.VALUE_MAPPINGS:
                            value = cls.VALUE_MAPPINGS[key][target_locale].get(value, value)
                        
                        cat, setting = cls.LOCALE_MAPPINGS[target_locale][universal_key].split('.')
                        if cat not in localized:
                            localized[cat] = {}
                        localized[cat][setting] = value

        return localized

    @classmethod
    async def update_user_locale(cls, user_id: int, new_locale: str):
        """Update user preferences for new locale."""
        try:
            # Get user's translingual preferences
            trans_prefs = await TranslingualPreference.objects.aget(user_id=user_id)
            if not trans_prefs.universal_preference_profile:
                return
            
            # Convert universal preferences to new locale
            localized_prefs = cls.from_universal_format(
                trans_prefs.universal_preference_profile,
                new_locale
            )
            
            # Update user settings with localized preferences
            user_settings = await UserSettings.objects.aget(user_id=user_id)
            user_settings.preferences = localized_prefs
            await user_settings.asave()
            
            logger.info(f"Updated preferences for user {user_id} to locale {new_locale}")
        except Exception as e:
            logger.error(f"Error updating locale for user {user_id}: {str(e)}")
            raise

    @classmethod
    async def store_universal_preferences(cls, user_id: int, preferences: Dict[str, Any], source_locale: str):
        """Store preferences in universal format."""
        try:
            universal_prefs = cls.to_universal_format(preferences, source_locale)
            
            trans_prefs, _ = await TranslingualPreference.objects.aget_or_create(
                user_id=user_id,
                defaults={'universal_preference_profile': {}}
            )
            
            trans_prefs.universal_preference_profile = universal_prefs
            await trans_prefs.asave()
            
            logger.info(f"Stored universal preferences for user {user_id}")
        except Exception as e:
            logger.error(f"Error storing universal preferences for user {user_id}: {str(e)}")
            raise

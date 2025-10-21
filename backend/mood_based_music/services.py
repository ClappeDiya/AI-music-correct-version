# DEPRECATED: This file is maintained for backward compatibility
# Please use the modular services package instead

from .services.mood_music_generator import MoodMusicGenerator
from .services.advanced_mood_service import AdvancedMoodService

# Export classes for backward compatibility
__all__ = ['MoodMusicGenerator', 'AdvancedMoodService'] 
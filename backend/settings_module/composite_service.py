from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
import logging
from django.db import transaction
from .models import MultiUserComposite, UserSettings
import numpy as np

logger = logging.getLogger(__name__)

class CompositeService:
    """Service for managing multi-user composite preferences."""

    NUMERIC_PREFERENCES = {
        'audio': ['volume', 'bass', 'treble', 'balance'],
        'display': ['brightness', 'contrast', 'scale'],
        'performance': ['quality', 'latency', 'buffer_size']
    }

    CATEGORICAL_PREFERENCES = {
        'audio': {
            'quality': ['low', 'medium', 'high'],
            'mode': ['stereo', 'mono', 'surround'],
            'eq_preset': ['flat', 'rock', 'classical', 'jazz']
        },
        'display': {
            'theme': ['light', 'dark', 'system'],
            'layout': ['compact', 'comfortable', 'spacious'],
            'color_scheme': ['default', 'high-contrast', 'muted']
        }
    }

    BOOLEAN_PREFERENCES = {
        'audio': ['mute', 'normalize', 'effects'],
        'display': ['animations', 'tooltips', 'advanced_controls'],
        'performance': ['hardware_acceleration', 'background_processing']
    }

    @classmethod
    async def create_composite(cls, 
                             session_id: str, 
                             user_ids: List[int], 
                             name: Optional[str] = None) -> MultiUserComposite:
        """Create a new multi-user composite."""
        async with transaction.atomic():
            # Get all users' preferences
            user_settings = await UserSettings.objects.filter(
                user_id__in=user_ids
            ).values('user_id', 'preferences')
            
            if len(user_settings) != len(user_ids):
                raise ValueError("Some users not found")
            
            # Calculate composite preferences
            composite_prefs = await cls.calculate_composite_preferences(
                [settings['preferences'] for settings in user_settings]
            )
            
            # Create composite record
            composite = await MultiUserComposite.objects.acreate(
                session_id=session_id,
                name=name or f"Shared Session {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M')}",
                user_ids=user_ids,
                composite_preferences=composite_prefs,
                original_preferences={
                    str(settings['user_id']): settings['preferences'] 
                    for settings in user_settings
                }
            )
            
            return composite

    @classmethod
    async def calculate_composite_preferences(cls, 
                                           preference_sets: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calculate composite preferences from multiple users."""
        composite = {}
        
        # Process numeric preferences
        for category, fields in cls.NUMERIC_PREFERENCES.items():
            if category not in composite:
                composite[category] = {}
            
            for field in fields:
                values = [
                    prefs.get(category, {}).get(field)
                    for prefs in preference_sets
                    if prefs.get(category, {}).get(field) is not None
                ]
                
                if values:
                    # Use median for numeric values to handle outliers
                    composite[category][field] = float(np.median(values))
        
        # Process categorical preferences
        for category, fields in cls.CATEGORICAL_PREFERENCES.items():
            if category not in composite:
                composite[category] = {}
            
            for field, options in fields.items():
                values = [
                    prefs.get(category, {}).get(field)
                    for prefs in preference_sets
                    if prefs.get(category, {}).get(field) in options
                ]
                
                if values:
                    # Use mode (most common) for categorical values
                    composite[category][field] = max(set(values), key=values.count)
        
        # Process boolean preferences
        for category, fields in cls.BOOLEAN_PREFERENCES.items():
            if category not in composite:
                composite[category] = {}
            
            for field in fields:
                values = [
                    prefs.get(category, {}).get(field)
                    for prefs in preference_sets
                    if isinstance(prefs.get(category, {}).get(field), bool)
                ]
                
                if values:
                    # Use majority vote for boolean values
                    composite[category][field] = sum(values) > len(values) / 2
        
        return composite

    @classmethod
    async def update_composite(cls, 
                             composite_id: int, 
                             updates: Dict[str, Any]) -> MultiUserComposite:
        """Update specific preferences in a composite."""
        async with transaction.atomic():
            composite = await MultiUserComposite.objects.aget(id=composite_id)
            
            # Merge updates with existing preferences
            updated_prefs = cls._merge_preferences(
                composite.composite_preferences,
                updates
            )
            
            composite.composite_preferences = updated_prefs
            composite.last_modified = datetime.now(timezone.utc)
            await composite.asave()
            
            return composite

    @classmethod
    async def add_user_to_composite(cls, 
                                  composite_id: int, 
                                  user_id: int) -> MultiUserComposite:
        """Add a new user to an existing composite."""
        async with transaction.atomic():
            composite = await MultiUserComposite.objects.aget(id=composite_id)
            
            if user_id in composite.user_ids:
                raise ValueError("User already in composite")
            
            # Get new user's preferences
            user_settings = await UserSettings.objects.aget(user_id=user_id)
            
            # Add to original preferences
            composite.original_preferences[str(user_id)] = user_settings.preferences
            
            # Recalculate composite preferences
            all_prefs = list(composite.original_preferences.values())
            composite.composite_preferences = await cls.calculate_composite_preferences(all_prefs)
            
            # Update user list
            composite.user_ids = [*composite.user_ids, user_id]
            await composite.asave()
            
            return composite

    @classmethod
    async def remove_user_from_composite(cls, 
                                       composite_id: int, 
                                       user_id: int) -> MultiUserComposite:
        """Remove a user from a composite."""
        async with transaction.atomic():
            composite = await MultiUserComposite.objects.aget(id=composite_id)
            
            if user_id not in composite.user_ids:
                raise ValueError("User not in composite")
            
            # Remove from original preferences
            composite.original_preferences.pop(str(user_id), None)
            
            # Recalculate composite if users remain
            remaining_prefs = list(composite.original_preferences.values())
            if remaining_prefs:
                composite.composite_preferences = await cls.calculate_composite_preferences(remaining_prefs)
            
            # Update user list
            composite.user_ids = [uid for uid in composite.user_ids if uid != user_id]
            await composite.asave()
            
            return composite

    @staticmethod
    def _merge_preferences(base: Dict[str, Any], updates: Dict[str, Any]) -> Dict[str, Any]:
        """Merge preference updates with base preferences."""
        merged = base.copy()
        
        for category, values in updates.items():
            if category not in merged:
                merged[category] = {}
            if isinstance(values, dict):
                merged[category].update(values)
            else:
                merged[category] = values
                
        return merged

    @classmethod
    async def get_active_composites(cls, user_id: int) -> List[MultiUserComposite]:
        """Get all active composites for a user."""
        return await MultiUserComposite.objects.filter(
            user_ids__contains=[user_id],
            is_active=True
        ).order_by('-created_at')

    @classmethod
    async def save_as_personal_preset(cls, 
                                    composite_id: int, 
                                    user_id: int,
                                    preset_name: str) -> None:
        """Save composite preferences as a personal preset."""
        async with transaction.atomic():
            composite = await MultiUserComposite.objects.aget(id=composite_id)
            user_settings = await UserSettings.objects.aget(user_id=user_id)
            
            if not user_settings.preference_presets:
                user_settings.preference_presets = {}
            
            user_settings.preference_presets[preset_name] = {
                'preferences': composite.composite_preferences,
                'created_at': datetime.now(timezone.utc).isoformat(),
                'source_composite_id': composite_id
            }
            
            await user_settings.asave()

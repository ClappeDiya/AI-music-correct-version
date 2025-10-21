from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
import asyncio
import logging
from django.db import transaction
from .models import EphemeralTrigger, UserSettings, EphemeralOverlay

logger = logging.getLogger(__name__)

class EphemeralService:
    """Service for managing behavior-triggered ephemeral preference overlays."""

    SUPPORTED_TRIGGERS = {
        'marathon_playlist': {
            'name': 'Marathon Playlist Mode',
            'description': 'Triggered when starting an extended playlist session',
            'default_overlay': {
                'audio': {
                    'crossfade': 5,
                    'gapless': True,
                    'volume_normalization': True
                },
                'display': {
                    'minimal_ui': True,
                    'show_progress': True
                }
            }
        },
        'dj_session': {
            'name': 'DJ Session Mode',
            'description': 'Triggered when launching DJ mixing features',
            'default_overlay': {
                'audio': {
                    'latency': 'low',
                    'monitoring': True,
                    'show_waveforms': True
                },
                'display': {
                    'advanced_controls': True,
                    'multi_deck_view': True
                }
            }
        },
        'editing_session': {
            'name': 'Audio Editing Mode',
            'description': 'Triggered when using advanced editing features',
            'default_overlay': {
                'audio': {
                    'high_quality': True,
                    'show_spectrum': True,
                    'monitoring': True
                },
                'display': {
                    'detailed_waveform': True,
                    'show_grid': True
                }
            }
        }
    }

    @classmethod
    async def get_active_triggers(cls, user_id: int) -> List[Dict[str, Any]]:
        """Get all active triggers for a user."""
        triggers = await EphemeralTrigger.objects.filter(
            user_id=user_id,
            is_active=True
        ).values()
        return list(triggers)

    @classmethod
    async def create_trigger(cls, 
                           user_id: int, 
                           trigger_type: str, 
                           custom_overlay: Optional[Dict[str, Any]] = None) -> EphemeralTrigger:
        """Create a new trigger with optional custom overlay."""
        if trigger_type not in cls.SUPPORTED_TRIGGERS:
            raise ValueError(f"Unsupported trigger type: {trigger_type}")

        overlay = custom_overlay or cls.SUPPORTED_TRIGGERS[trigger_type]['default_overlay']
        
        trigger = await EphemeralTrigger.objects.acreate(
            user_id=user_id,
            trigger_type=trigger_type,
            overlay_data=overlay,
            is_active=False
        )
        
        return trigger

    @classmethod
    async def activate_trigger(cls, user_id: int, trigger_id: int) -> None:
        """Activate a trigger and apply its overlay."""
        async with transaction.atomic():
            trigger = await EphemeralTrigger.objects.aget(
                id=trigger_id,
                user_id=user_id
            )
            
            if trigger.is_active:
                return
            
            # Create overlay record
            overlay = await EphemeralOverlay.objects.acreate(
                user_id=user_id,
                trigger=trigger,
                original_preferences={},  # Will be filled with current preferences
                overlay_preferences=trigger.overlay_data
            )
            
            # Get current preferences
            user_settings = await UserSettings.objects.aget(user_id=user_id)
            overlay.original_preferences = user_settings.preferences
            await overlay.asave()
            
            # Apply overlay
            merged_preferences = cls._merge_preferences(
                user_settings.preferences,
                trigger.overlay_data
            )
            user_settings.preferences = merged_preferences
            await user_settings.asave()
            
            # Mark trigger as active
            trigger.is_active = True
            trigger.activated_at = datetime.now(timezone.utc)
            await trigger.asave()

    @classmethod
    async def deactivate_trigger(cls, user_id: int, trigger_id: int) -> None:
        """Deactivate a trigger and revert its overlay."""
        async with transaction.atomic():
            trigger = await EphemeralTrigger.objects.aget(
                id=trigger_id,
                user_id=user_id
            )
            
            if not trigger.is_active:
                return
            
            # Get the active overlay
            overlay = await EphemeralOverlay.objects.aget(
                user_id=user_id,
                trigger=trigger,
                is_active=True
            )
            
            # Restore original preferences
            user_settings = await UserSettings.objects.aget(user_id=user_id)
            user_settings.preferences = overlay.original_preferences
            await user_settings.asave()
            
            # Mark overlay as inactive
            overlay.is_active = False
            overlay.deactivated_at = datetime.now(timezone.utc)
            await overlay.asave()
            
            # Mark trigger as inactive
            trigger.is_active = False
            await trigger.asave()

    @staticmethod
    def _merge_preferences(base: Dict[str, Any], overlay: Dict[str, Any]) -> Dict[str, Any]:
        """Merge overlay preferences with base preferences."""
        merged = base.copy()
        
        for category, values in overlay.items():
            if category not in merged:
                merged[category] = {}
            if isinstance(values, dict):
                merged[category].update(values)
            else:
                merged[category] = values
                
        return merged

    @classmethod
    async def get_trigger_history(cls, user_id: int, limit: int = 10) -> List[Dict[str, Any]]:
        """Get history of trigger activations."""
        overlays = await EphemeralOverlay.objects.filter(
            user_id=user_id
        ).order_by('-created_at')[:limit].values(
            'id',
            'trigger__trigger_type',
            'created_at',
            'deactivated_at',
            'is_active'
        )
        return list(overlays)

    @classmethod
    async def cleanup_stale_triggers(cls, user_id: int) -> None:
        """Cleanup any stale triggers that might have been left active."""
        stale_triggers = await EphemeralTrigger.objects.filter(
            user_id=user_id,
            is_active=True,
            activated_at__lt=datetime.now(timezone.utc)
        ).values_list('id', flat=True)
        
        for trigger_id in stale_triggers:
            await cls.deactivate_trigger(user_id, trigger_id)

from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from django.db import transaction
from django.db.models import Q
from .models import UserSettingsHistory, UserSettings, EphemeralSession, PersonaFusion

class VersioningService:
    """Service for managing settings version history and rollback."""

    CHANGE_SOURCES = {
        'manual': 'Manual user change',
        'ephemeral': 'Ephemeral session change',
        'ml_driven': 'ML-based prediction',
        'persona_fusion': 'Persona fusion',
        'rollback': 'Settings rollback',
        'system': 'System-initiated change'
    }

    @classmethod
    async def record_change(cls,
                          user_id: int,
                          preferences: Dict[str, Any],
                          source: str,
                          metadata: Optional[Dict[str, Any]] = None,
                          ephemeral_session_id: Optional[str] = None,
                          persona_fusion_id: Optional[int] = None) -> UserSettingsHistory:
        """Record a settings change in the history."""
        if source not in cls.CHANGE_SOURCES:
            raise ValueError(f"Invalid change source: {source}")

        # Get the previous settings state
        try:
            previous_settings = await UserSettings.objects.aget(user_id=user_id)
            previous_state = previous_settings.preferences
        except UserSettings.DoesNotExist:
            previous_state = {}

        # Create history record
        history = await UserSettingsHistory.objects.acreate(
            user_id=user_id,
            previous_state=previous_state,
            new_state=preferences,
            change_source=source,
            metadata=metadata or {},
            ephemeral_session_id=ephemeral_session_id,
            persona_fusion_id=persona_fusion_id,
            timestamp=datetime.now(timezone.utc)
        )

        return history

    @classmethod
    async def get_history(cls,
                         user_id: int,
                         start_date: Optional[datetime] = None,
                         end_date: Optional[datetime] = None,
                         sources: Optional[List[str]] = None,
                         include_ephemeral: bool = True,
                         include_fusion: bool = True) -> List[UserSettingsHistory]:
        """Get settings history with optional filters."""
        query = Q(user_id=user_id)

        if start_date:
            query &= Q(timestamp__gte=start_date)
        if end_date:
            query &= Q(timestamp__lte=end_date)
        if sources:
            query &= Q(change_source__in=sources)
        if not include_ephemeral:
            query &= Q(ephemeral_session_id__isnull=True)
        if not include_fusion:
            query &= Q(persona_fusion_id__isnull=True)

        history = await UserSettingsHistory.objects.filter(query).order_by('-timestamp')
        return list(history)

    @classmethod
    async def rollback_to_version(cls,
                                user_id: int,
                                version_id: int,
                                preserve_ephemeral: bool = True) -> Dict[str, Any]:
        """Rollback settings to a specific version."""
        async with transaction.atomic():
            # Get target version
            try:
                target_version = await UserSettingsHistory.objects.aget(
                    id=version_id,
                    user_id=user_id
                )
            except UserSettingsHistory.DoesNotExist:
                raise ValueError("Version not found")

            # Get current settings
            current_settings = await UserSettings.objects.aget(user_id=user_id)
            
            # If preserving ephemeral settings, merge them with rollback state
            if preserve_ephemeral and current_settings.ephemeral_session_id:
                try:
                    ephemeral = await EphemeralSession.objects.aget(
                        id=current_settings.ephemeral_session_id
                    )
                    rollback_state = cls._merge_preferences(
                        target_version.new_state,
                        ephemeral.preferences
                    )
                except EphemeralSession.DoesNotExist:
                    rollback_state = target_version.new_state
            else:
                rollback_state = target_version.new_state

            # Apply rollback
            current_settings.preferences = rollback_state
            await current_settings.asave()

            # Record rollback in history
            await cls.record_change(
                user_id=user_id,
                preferences=rollback_state,
                source='rollback',
                metadata={
                    'rolled_back_to': version_id,
                    'preserved_ephemeral': preserve_ephemeral
                }
            )

            return rollback_state

    @classmethod
    async def get_admin_history(cls,
                              user_id: int,
                              admin_user_id: int) -> List[Dict[str, Any]]:
        """Get sanitized history for admin view."""
        # Verify admin permissions (implement your own logic)
        # This is just a placeholder - implement proper admin checks
        is_admin = await cls._verify_admin(admin_user_id)
        if not is_admin:
            raise PermissionError("Insufficient permissions")

        history = await cls.get_history(user_id)
        
        # Sanitize sensitive information
        sanitized_history = []
        for entry in history:
            sanitized_entry = {
                'id': entry.id,
                'timestamp': entry.timestamp,
                'change_source': entry.change_source,
                'has_ephemeral': bool(entry.ephemeral_session_id),
                'has_fusion': bool(entry.persona_fusion_id),
                # Add sanitized preference data as needed
                'preference_categories': list(entry.new_state.keys())
            }
            sanitized_history.append(sanitized_entry)

        return sanitized_history

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

    @staticmethod
    async def _verify_admin(user_id: int) -> bool:
        """Verify if a user has admin permissions."""
        # Implement your admin verification logic here
        # This is just a placeholder
        return True  # Replace with actual admin check

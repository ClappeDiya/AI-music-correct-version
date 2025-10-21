# views.py for settings_module
# This file contains the viewsets for the settings_module app, providing API endpoints for managing user settings and preferences.

from rest_framework import viewsets
from rest_framework import permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters import rest_framework as filters
from .mixins import UserSpecificMixin
from .models import (
    UserSettings,
    UserSettingsHistory,
    PreferenceInheritanceLayer,
    PreferenceSuggestion,
    UserSensoryTheme,
    ContextualProfile,
    PreferenceExternalization,
    EphemeralEventPreference,
    PersonaFusion,
    TranslingualPreference,
    UniversalProfileMapping,
    BehaviorTriggeredOverlay,
    MultiUserComposite,
    PredictivePreferenceModel,
    PredictivePreferenceEvent,
    EphemeralTrigger,
)
from .serializers import (
    UserSettingsSerializer,
    UserSettingsHistorySerializer,
    PreferenceInheritanceLayerSerializer,
    PreferenceSuggestionSerializer,
    UserSensoryThemeSerializer,
    ContextualProfileSerializer,
    PreferenceExternalizationSerializer,
    EphemeralEventPreferenceSerializer,
    PersonaFusionSerializer,
    TranslingualPreferenceSerializer,
    UniversalProfileMappingSerializer,
    BehaviorTriggeredOverlaySerializer,
    MultiUserCompositeSerializer,
    PredictivePreferenceModelSerializer,
    PredictivePreferenceEventSerializer,
    EphemeralTriggerSerializer,
)
from django.utils import timezone


class BaseUserAwareViewSet(UserSpecificMixin, viewsets.ModelViewSet):
    """
    Base viewset that combines UserSpecificMixin and ModelViewSet.
    """
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.DjangoFilterBackend]
    search_fields = []
    ordering_fields = ['id']


class UserSettingsViewSet(BaseUserAwareViewSet):
    """
    ViewSet for the UserSettings model.
    """
    queryset = UserSettings.objects.all()
    serializer_class = UserSettingsSerializer
    filterset_fields = ['user']
    search_fields = ['preferences', 'device_specific_settings']

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activates a user settings profile"""
        settings = self.get_object()
        settings.active = True
        settings.save()
        return Response({'status': 'activated'})

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Deactivates a user settings profile"""
        settings = self.get_object()
        settings.active = False
        settings.save()
        return Response({'status': 'deactivated'})

    @action(detail=True, methods=['post'])
    def duplicate(self, request, pk=None):
        """Creates a copy of the settings profile"""
        original = self.get_object()
        new_settings = UserSettings.objects.create(
            user=request.user,
            preferences=original.preferences,
            device_specific_settings=original.device_specific_settings
        )
        serializer = self.get_serializer(new_settings)
        return Response(serializer.data)

    @action(detail=False, methods=['get', 'post'])
    def currency(self, request):
        """Handles currency preference operations"""
        if request.method == 'GET':
            settings = self.get_queryset().filter(user=request.user).first()
            return Response({'currency': settings.preferences.get('currency', 'USD')})
        else:
            settings = self.get_queryset().filter(user=request.user).first()
            currency = request.data.get('currency')
            if not settings:
                settings = UserSettings.objects.create(user=request.user)
            settings.preferences['currency'] = currency
            settings.save()
            return Response({'status': 'updated', 'currency': currency})


class UserSettingsHistoryViewSet(BaseUserAwareViewSet):
    """
    ViewSet for the UserSettingsHistory model.
    """
    queryset = UserSettingsHistory.objects.all()
    serializer_class = UserSettingsHistorySerializer
    filterset_fields = ['user']
    search_fields = ['old_preferences']

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """
        Activates the user settings history.
        """
        history = self.get_object()
        # Add activation logic here
        return Response({'status': 'activated'})

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """
        Deactivates the user settings history.
        """
        history = self.get_object()
        # Add deactivation logic here
        return Response({'status': 'deactivated'})


class PreferenceInheritanceLayerViewSet(BaseUserAwareViewSet):
    """
    ViewSet for the PreferenceInheritanceLayer model.
    """
    queryset = PreferenceInheritanceLayer.objects.all()
    serializer_class = PreferenceInheritanceLayerSerializer
    filterset_fields = ['user', 'layer_type']
    search_fields = ['layer_reference']

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """
        Activates the preference inheritance layer.
        """
        layer = self.get_object()
        # Add activation logic here
        return Response({'status': 'activated'})

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """
        Deactivates the preference inheritance layer.
        """
        layer = self.get_object()
        # Add deactivation logic here
        return Response({'status': 'deactivated'})


class PreferenceSuggestionViewSet(BaseUserAwareViewSet):
    """
    ViewSet for the PreferenceSuggestion model.
    """
    queryset = PreferenceSuggestion.objects.all()
    serializer_class = PreferenceSuggestionSerializer
    filterset_fields = ['user']
    search_fields = ['suggestion_data']

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """
        Activates the preference suggestion.
        """
        suggestion = self.get_object()
        # Add activation logic here
        return Response({'status': 'activated'})

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """
        Deactivates the preference suggestion.
        """
        suggestion = self.get_object()
        # Add deactivation logic here
        return Response({'status': 'deactivated'})


class UserSensoryThemeViewSet(BaseUserAwareViewSet):
    """
    ViewSet for the UserSensoryTheme model.
    """
    queryset = UserSensoryTheme.objects.all()
    serializer_class = UserSensoryThemeSerializer
    filterset_fields = ['user']
    search_fields = ['sensory_mappings']

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """
        Activates the user sensory theme.
        """
        theme = self.get_object()
        # Add activation logic here
        return Response({'status': 'activated'})

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """
        Deactivates the user sensory theme.
        """
        theme = self.get_object()
        # Add deactivation logic here
        return Response({'status': 'deactivated'})


class ContextualProfileViewSet(BaseUserAwareViewSet):
    """
    ViewSet for the ContextualProfile model.
    """
    queryset = ContextualProfile.objects.all()
    serializer_class = ContextualProfileSerializer
    filterset_fields = ['user']
    search_fields = ['trigger_conditions', 'profile_adjustments']

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """
        Activates the contextual profile.
        """
        profile = self.get_object()
        # Add activation logic here
        return Response({'status': 'activated'})

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """
        Deactivates the contextual profile.
        """
        profile = self.get_object()
        # Add deactivation logic here
        return Response({'status': 'deactivated'})


class PreferenceExternalizationViewSet(BaseUserAwareViewSet):
    """
    ViewSet for the PreferenceExternalization model.
    """
    queryset = PreferenceExternalization.objects.all()
    serializer_class = PreferenceExternalizationSerializer
    filterset_fields = ['user']
    search_fields = ['external_identity_ref', 'exported_preferences_hash']

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """
        Activates the preference externalization.
        """
        externalization = self.get_object()
        # Add activation logic here
        return Response({'status': 'activated'})

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """
        Deactivates the preference externalization.
        """
        externalization = self.get_object()
        # Add deactivation logic here
        return Response({'status': 'deactivated'})

    @action(detail=True, methods=['post'])
    def sync_now(self, request, pk=None):
        externalization = self.get_object()
        externalization.last_sync = timezone.now()
        externalization.save()
        return Response({'status': 'sync initiated'})


class EphemeralEventPreferenceViewSet(BaseUserAwareViewSet):
    """
    ViewSet for the EphemeralEventPreference model.
    """
    queryset = EphemeralEventPreference.objects.all()
    serializer_class = EphemeralEventPreferenceSerializer
    filterset_fields = ['user', 'event_key', 'event_type', 'active']
    search_fields = ['ephemeral_prefs', 'event_key']

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activates the ephemeral event preference."""
        event_pref = self.get_object()
        event_pref.active = True
        event_pref.save()
        return Response({'status': 'activated'})

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Deactivates the ephemeral event preference."""
        event_pref = self.get_object()
        event_pref.active = False
        event_pref.save()
        return Response({'status': 'deactivated'})

    @action(detail=True, methods=['post'])
    def schedule(self, request, pk=None):
        """Schedule an ephemeral event preference for a specific time."""
        event_pref = self.get_object()
        start_time = request.data.get('start_time')
        end_time = request.data.get('end_time')
        
        if not start_time or not end_time:
            return Response({'error': 'Both start_time and end_time are required'}, status=400)
            
        event_pref.start_time = start_time
        event_pref.end_time = end_time
        event_pref.next_scheduled = start_time
        event_pref.save()
        
        return Response({'status': 'scheduled', 'start_time': start_time, 'end_time': end_time})

    @action(detail=True, methods=['post'])
    def apply_concert_mode(self, request, pk=None):
        """Apply concert mode settings for a specific duration."""
        event_pref = self.get_object()
        duration_minutes = request.data.get('duration_minutes', 180)  # Default 3 hours
        
        now = timezone.now()
        event_pref.start_time = now
        event_pref.end_time = now + timezone.timedelta(minutes=duration_minutes)
        event_pref.event_type = 'concert_mode'
        event_pref.priority = 'high'
        event_pref.ephemeral_prefs = {
            'audio': {
                'volume_boost': True,
                'eq_preset': 'live_music',
                'noise_cancellation': 'max'
            },
            'notifications': {
                'mode': 'do_not_disturb',
                'exceptions': ['emergency']
            },
            'display': {
                'brightness': 'auto_ambient',
                'theme': 'concert_dark'
            }
        }
        event_pref.active = True
        event_pref.save()
        
        return Response({
            'status': 'concert_mode_activated',
            'duration_minutes': duration_minutes,
            'end_time': event_pref.end_time
        })

    @action(detail=True, methods=['post'])
    def apply_jam_session(self, request, pk=None):
        """Apply jam session settings for a specific duration."""
        event_pref = self.get_object()
        duration_minutes = request.data.get('duration_minutes', 120)  # Default 2 hours
        
        now = timezone.now()
        event_pref.start_time = now
        event_pref.end_time = now + timezone.timedelta(minutes=duration_minutes)
        event_pref.event_type = 'jam_session'
        event_pref.priority = 'high'
        event_pref.ephemeral_prefs = {
            'audio': {
                'latency_mode': 'ultra_low',
                'monitoring': 'direct',
                'input_gain': 'auto_adjust'
            },
            'recording': {
                'format': 'high_quality',
                'auto_backup': True
            },
            'collaboration': {
                'mode': 'real_time_sync',
                'share_mixer_settings': True
            }
        }
        event_pref.active = True
        event_pref.save()
        
        return Response({
            'status': 'jam_session_activated',
            'duration_minutes': duration_minutes,
            'end_time': event_pref.end_time
        })

    @action(detail=False, methods=['get'])
    def active_events(self, request):
        """Get all currently active ephemeral events."""
        now = timezone.now()
        active_events = self.get_queryset().filter(
            user=request.user,
            active=True,
            start_time__lte=now,
            end_time__gt=now
        ).order_by('-priority')
        
        serializer = self.get_serializer(active_events, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def cleanup_expired(self, request):
        """Deactivate all expired ephemeral events."""
        now = timezone.now()
        expired_events = self.get_queryset().filter(
            user=request.user,
            active=True,
            end_time__lt=now
        )
        
        count = expired_events.count()
        expired_events.update(active=False)
        
        return Response({
            'status': 'cleanup_completed',
            'deactivated_count': count
        })


class PersonaFusionViewSet(BaseUserAwareViewSet):
    """ViewSet for the PersonaFusion model."""
    queryset = PersonaFusion.objects.all()
    serializer_class = PersonaFusionSerializer
    filterset_fields = ['user', 'is_active']
    search_fields = ['name', 'description', 'source_personas']

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activates this persona fusion."""
        fusion = self.get_object()
        fusion.is_active = True
        fusion.save()  # This will automatically deactivate other fusions
        
        # Apply the fused profile to user settings
        user_settings = UserSettings.objects.get(user=request.user)
        user_settings.preferences = fusion.fused_profile
        user_settings.save()
        
        return Response({'status': 'activated'})

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Deactivates this persona fusion."""
        fusion = self.get_object()
        fusion.is_active = False
        fusion.save()
        return Response({'status': 'deactivated'})

    @action(detail=False, methods=['post'])
    async def preview_fusion(self, request):
        """Preview the result of fusing multiple personas."""
        from .services import PersonaFusionService
        
        source_personas = request.data.get('source_personas', [])
        if not source_personas:
            return Response({'error': 'No source personas provided'}, status=400)
            
        try:
            # Get current user settings as base
            user_settings = UserSettings.objects.get(user=request.user)
            current_preferences = user_settings.preferences or {}
            
            # Perform fusion
            fused_profile, confidence = PersonaFusionService.fuse_personas(source_personas)
            
            # Generate preview diff
            preview = PersonaFusionService.preview_fusion(fused_profile, current_preferences)
            
            return Response({
                'preview': preview,
                'confidence_score': confidence
            })
        except Exception as e:
            return Response({'error': str(e)}, status=400)

    @action(detail=True, methods=['post'])
    def rollback(self, request, pk=None):
        """Rollback to previous settings if user dislikes the fusion."""
        fusion = self.get_object()
        
        # Get the previous active fusion or default settings
        previous_fusion = PersonaFusion.objects.filter(
            user=request.user,
            last_used__isnull=False
        ).exclude(pk=fusion.pk).order_by('-last_used').first()
        
        if previous_fusion:
            # Reactivate previous fusion
            previous_fusion.is_active = True
            previous_fusion.save()
            
            # Update user settings
            user_settings = UserSettings.objects.get(user=request.user)
            user_settings.preferences = previous_fusion.fused_profile
            user_settings.save()
            
            # Deactivate and delete current fusion
            fusion.delete()
            
            return Response({
                'status': 'rolled_back',
                'activated_fusion': previous_fusion.name
            })
        else:
            # If no previous fusion, revert to default settings
            user_settings = UserSettings.objects.get(user=request.user)
            user_settings.preferences = {}  # Or your default preferences
            user_settings.save()
            
            # Delete the fusion
            fusion.delete()
            
            return Response({
                'status': 'rolled_back',
                'message': 'Reverted to default settings'
            })

    def perform_create(self, serializer):
        """Override create to automatically fuse personas."""
        from .services import PersonaFusionService
        
        # Get source personas from request
        source_personas = self.request.data.get('source_personas', [])
        if not source_personas:
            raise ValidationError('No source personas provided')
            
        try:
            # Perform fusion
            fused_profile, confidence = PersonaFusionService.fuse_personas(source_personas)
            
            # Calculate weights
            weights = PersonaFusionService.calculate_fusion_weights(source_personas)
            
            # Save the fusion
            serializer.save(
                user=self.request.user,
                fused_profile=fused_profile,
                confidence_score=confidence,
                fusion_weights=weights
            )
        except Exception as e:
            raise ValidationError(str(e))


class TranslingualPreferenceViewSet(BaseUserAwareViewSet):
    """
    ViewSet for the TranslingualPreference model.
    """
    queryset = TranslingualPreference.objects.all()
    serializer_class = TranslingualPreferenceSerializer
    filterset_fields = ['user']
    search_fields = ['universal_preference_profile']

    @action(detail=False, methods=['post'])
    async def update_locale(self, request):
        """Update preferences for a new locale."""
        from .translingual_service import TranslingualService
        
        new_locale = request.data.get('locale')
        if not new_locale:
            return Response({'error': 'Locale is required'}, status=400)
            
        if new_locale not in TranslingualService.LOCALE_MAPPINGS:
            return Response({'error': 'Unsupported locale'}, status=400)
            
        try:
            await TranslingualService.update_user_locale(request.user.id, new_locale)
            return Response({'status': 'preferences_updated'})
        except Exception as e:
            return Response({'error': str(e)}, status=400)

    @action(detail=False, methods=['post'])
    async def store_preferences(self, request):
        """Store current preferences in universal format."""
        from .translingual_service import TranslingualService
        
        preferences = request.data.get('preferences')
        source_locale = request.data.get('locale')
        
        if not preferences or not source_locale:
            return Response({'error': 'Preferences and locale are required'}, status=400)
            
        if source_locale not in TranslingualService.LOCALE_MAPPINGS:
            return Response({'error': 'Unsupported locale'}, status=400)
            
        try:
            await TranslingualService.store_universal_preferences(
                request.user.id,
                preferences,
                source_locale
            )
            return Response({'status': 'preferences_stored'})
        except Exception as e:
            return Response({'error': str(e)}, status=400)

    @action(detail=False, methods=['get'])
    def supported_locales(self, request):
        """Get list of supported locales."""
        from .translingual_service import TranslingualService
        
        return Response({
            'locales': list(TranslingualService.LOCALE_MAPPINGS.keys())
        })

    @action(detail=False, methods=['get'])
    def preference_keys(self, request):
        """Get universal preference keys and their locale mappings."""
        from .translingual_service import TranslingualService
        
        locale = request.query_params.get('locale', 'en')
        if locale not in TranslingualService.LOCALE_MAPPINGS:
            return Response({'error': 'Unsupported locale'}, status=400)
            
        return Response({
            'universal_keys': TranslingualService.UNIVERSAL_KEYS,
            'locale_mappings': TranslingualService.LOCALE_MAPPINGS[locale],
            'value_mappings': TranslingualService.VALUE_MAPPINGS
        })


class UniversalProfileMappingViewSet(BaseUserAwareViewSet):
    """
    ViewSet for the UniversalProfileMapping model.
    """
    queryset = UniversalProfileMapping.objects.all()
    serializer_class = UniversalProfileMappingSerializer
    filterset_fields = ['user', 'external_profile_format']

    @action(detail=False, methods=['post'])
    async def export_preferences(self, request):
        """Export user preferences in a portable format."""
        from .universal_profile_service import UniversalProfileService
        
        format_type = request.data.get('format_type', 'w3c_did')
        include_metadata = request.data.get('include_metadata', True)
        
        try:
            portable_format = await UniversalProfileService.export_preferences(
                request.user.id,
                format_type=format_type,
                include_metadata=include_metadata
            )
            
            # Create JWT token for secure transport
            token = UniversalProfileService.create_jwt_token(
                portable_format,
                request.user.id
            )
            
            return Response({
                'format': format_type,
                'token': token,
                'portable_format': portable_format
            })
        except ValueError as e:
            return Response({'error': str(e)}, status=400)
        except Exception as e:
            return Response({'error': 'Failed to export preferences'}, status=500)

    @action(detail=False, methods=['get'])
    def supported_formats(self, request):
        """Get list of supported export formats."""
        return Response({
            'formats': ['w3c_did'],
            'default': 'w3c_did'
        })

    @action(detail=False, methods=['get'])
    def preference_schemas(self, request):
        """Get preference schemas for validation."""
        from .universal_profile_service import UniversalProfileService
        
        return Response({
            'schemas': UniversalProfileService.PREFERENCE_SCHEMAS,
            'w3c_context': UniversalProfileService.W3C_CONTEXT
        })

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """
        Activates the universal profile mapping.
        """
        mapping = self.get_object()
        # Add activation logic here
        return Response({'status': 'activated'})

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """
        Deactivates the universal profile mapping.
        """
        mapping = self.get_object()
        # Add deactivation logic here
        return Response({'status': 'deactivated'})


class BehaviorTriggeredOverlayViewSet(BaseUserAwareViewSet):
    """
    ViewSet for the BehaviorTriggeredOverlay model.
    """
    queryset = BehaviorTriggeredOverlay.objects.all()
    serializer_class = BehaviorTriggeredOverlaySerializer
    filterset_fields = ['user']
    search_fields = ['trigger_conditions', 'overlay_prefs']

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """
        Activates the behavior triggered overlay.
        """
        overlay = self.get_object()
        # Add activation logic here
        return Response({'status': 'activated'})

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """
        Deactivates the behavior triggered overlay.
        """
        overlay = self.get_object()
        # Add deactivation logic here
        return Response({'status': 'deactivated'})

    @action(detail=True, methods=['post'])
    def preview(self, request, pk=None):
        overlay = self.get_object()
        # Implementation for preview functionality
        return Response({'status': 'preview generated'})


class MultiUserCompositeViewSet(BaseUserAwareViewSet):
    """ViewSet for managing multi-user composite preferences."""
    queryset = MultiUserComposite.objects.all()
    serializer_class = MultiUserCompositeSerializer
    filterset_fields = ['session_id', 'is_active']

    @action(detail=False, methods=['post'])
    async def create_composite(self, request):
        """Create a new multi-user composite."""
        from .composite_service import CompositeService
        
        session_id = request.data.get('session_id')
        user_ids = request.data.get('user_ids', [])
        name = request.data.get('name')
        
        if not session_id or not user_ids:
            return Response({
                'error': 'session_id and user_ids are required'
            }, status=400)
        
        if request.user.id not in user_ids:
            user_ids.append(request.user.id)
        
        try:
            composite = await CompositeService.create_composite(
                session_id,
                user_ids,
                name
            )
            return Response(self.get_serializer(composite).data)
        except ValueError as e:
            return Response({'error': str(e)}, status=400)
        except Exception as e:
            return Response({'error': 'Failed to create composite'}, status=500)

    @action(detail=True, methods=['post'])
    async def update_preferences(self, request, pk=None):
        """Update specific preferences in a composite."""
        from .composite_service import CompositeService
        
        updates = request.data.get('updates')
        if not updates:
            return Response({'error': 'updates are required'}, status=400)
        
        try:
            composite = await CompositeService.update_composite(pk, updates)
            return Response(self.get_serializer(composite).data)
        except Exception as e:
            return Response({'error': str(e)}, status=400)

    @action(detail=True, methods=['post'])
    async def add_user(self, request, pk=None):
        """Add a user to the composite."""
        from .composite_service import CompositeService
        
        user_id = request.data.get('user_id')
        if not user_id:
            return Response({'error': 'user_id is required'}, status=400)
        
        try:
            composite = await CompositeService.add_user_to_composite(pk, user_id)
            return Response(self.get_serializer(composite).data)
        except ValueError as e:
            return Response({'error': str(e)}, status=400)
        except Exception as e:
            return Response({'error': 'Failed to add user'}, status=500)

    @action(detail=True, methods=['post'])
    async def remove_user(self, request, pk=None):
        """Remove a user from the composite."""
        from .composite_service import CompositeService
        
        user_id = request.data.get('user_id')
        if not user_id:
            return Response({'error': 'user_id is required'}, status=400)
        
        try:
            composite = await CompositeService.remove_user_from_composite(pk, user_id)
            return Response(self.get_serializer(composite).data)
        except ValueError as e:
            return Response({'error': str(e)}, status=400)
        except Exception as e:
            return Response({'error': 'Failed to remove user'}, status=500)

    @action(detail=False, methods=['get'])
    async def active_composites(self, request):
        """Get active composites for the current user."""
        from .composite_service import CompositeService
        
        composites = await CompositeService.get_active_composites(request.user.id)
        return Response(self.get_serializer(composites, many=True).data)

    @action(detail=True, methods=['post'])
    async def save_as_preset(self, request, pk=None):
        """Save composite preferences as a personal preset."""
        from .composite_service import CompositeService
        
        preset_name = request.data.get('preset_name')
        if not preset_name:
            return Response({'error': 'preset_name is required'}, status=400)
        
        try:
            await CompositeService.save_as_personal_preset(
                pk,
                request.user.id,
                preset_name
            )
            return Response({'status': 'preset_saved'})
        except Exception as e:
            return Response({'error': str(e)}, status=400)

    @action(detail=True, methods=['get'])
    def preference_categories(self, request, pk=None):
        """Get available preference categories for composites."""
        from .composite_service import CompositeService
        
        return Response({
            'numeric': CompositeService.NUMERIC_PREFERENCES,
            'categorical': CompositeService.CATEGORICAL_PREFERENCES,
            'boolean': CompositeService.BOOLEAN_PREFERENCES
        })


class PredictivePreferenceModelViewSet(BaseUserAwareViewSet):
    """ViewSet for managing ML-based predictive preferences."""
    queryset = PredictivePreferenceModel.objects.all()
    serializer_class = PredictivePreferenceModelSerializer
    filterset_fields = ['user', 'is_active']

    @action(detail=False, methods=['post'])
    async def train_model(self, request):
        """Train a new ML model for the user."""
        from .predictive_service import PredictiveService
        
        try:
            model = await PredictiveService.train_model(request.user.id)
            return Response(self.get_serializer(model).data)
        except ValueError as e:
            return Response({'error': str(e)}, status=400)
        except Exception as e:
            return Response({'error': 'Failed to train model'}, status=500)

    @action(detail=False, methods=['post'])
    async def predict(self, request):
        """Get preference predictions for current context."""
        from .predictive_service import PredictiveService
        
        context = request.data.get('context')
        if not context:
            return Response({'error': 'context is required'}, status=400)
            
        try:
            predictions, reason = await PredictiveService.predict_preferences(
                request.user.id,
                context
            )
            return Response({
                'predictions': predictions,
                'reason': reason
            })
        except Exception as e:
            return Response({'error': str(e)}, status=400)

    @action(detail=False, methods=['post'])
    async def apply_prediction(self, request):
        """Apply predicted preferences."""
        from .predictive_service import PredictiveService
        
        context = request.data.get('context')
        if not context:
            return Response({'error': 'context is required'}, status=400)
            
        try:
            event = await PredictiveService.apply_prediction(
                request.user.id,
                context
            )
            
            if not event:
                return Response({'status': 'no_prediction_available'})
                
            return Response({
                'status': 'prediction_applied',
                'event': PredictivePreferenceEventSerializer(event).data
            })
        except Exception as e:
            return Response({'error': str(e)}, status=400)

    @action(detail=False, methods=['get'])
    async def active_predictions(self, request):
        """Get active predictions for the user."""
        from .predictive_service import PredictiveService
        
        predictions = await PredictiveService.get_active_predictions(request.user.id)
        return Response(PredictivePreferenceEventSerializer(predictions, many=True).data)


class PredictivePreferenceEventViewSet(BaseUserAwareViewSet):
    """ViewSet for managing predictive preference events."""
    queryset = PredictivePreferenceEvent.objects.all()
    serializer_class = PredictivePreferenceEventSerializer
    filterset_fields = ['user', 'is_active', 'user_accepted']

    @action(detail=True, methods=['post'])
    async def revert(self, request, pk=None):
        """Revert a predictive preference change."""
        from .predictive_service import PredictiveService
        
        try:
            await PredictiveService.revert_prediction(pk)
            return Response({'status': 'prediction_reverted'})
        except Exception as e:
            return Response({'error': str(e)}, status=400)

    @action(detail=True, methods=['post'])
    async def accept(self, request, pk=None):
        """Accept a prediction."""
        from .predictive_service import PredictiveService
        
        try:
            await PredictiveService.accept_prediction(pk)
            return Response({'status': 'prediction_accepted'})
        except Exception as e:
            return Response({'error': str(e)}, status=400)

    @action(detail=False, methods=['get'])
    def prediction_rules(self, request):
        """Get available prediction rules."""
        from .predictive_service import PredictiveService
        
        return Response({
            'rules': {
                name: {
                    'description': name.replace('_', ' ').title(),
                    'preferences': rule['preferences']
                }
                for name, rule in PredictiveService.PREDICTION_RULES.items()
            }
        })


class EphemeralTriggerViewSet(BaseUserAwareViewSet):
    """ViewSet for managing ephemeral triggers and overlays."""
    queryset = EphemeralTrigger.objects.all()
    serializer_class = EphemeralTriggerSerializer
    filterset_fields = ['user', 'trigger_type', 'is_active']

    @action(detail=False, methods=['get'])
    def supported_triggers(self, request):
        """Get list of supported trigger types."""
        from .ephemeral_service import EphemeralService
        return Response(EphemeralService.SUPPORTED_TRIGGERS)

    @action(detail=False, methods=['get'])
    async def active_triggers(self, request):
        """Get user's active triggers."""
        from .ephemeral_service import EphemeralService
        triggers = await EphemeralService.get_active_triggers(request.user.id)
        return Response(triggers)

    @action(detail=False, methods=['post'])
    async def create_trigger(self, request):
        """Create a new trigger."""
        from .ephemeral_service import EphemeralService
        
        trigger_type = request.data.get('trigger_type')
        custom_overlay = request.data.get('custom_overlay')
        
        if not trigger_type:
            return Response({'error': 'trigger_type is required'}, status=400)
            
        try:
            trigger = await EphemeralService.create_trigger(
                request.user.id,
                trigger_type,
                custom_overlay
            )
            return Response(self.get_serializer(trigger).data)
        except ValueError as e:
            return Response({'error': str(e)}, status=400)
        except Exception as e:
            return Response({'error': 'Failed to create trigger'}, status=500)

    @action(detail=True, methods=['post'])
    async def activate(self, request, pk=None):
        """Activate a trigger."""
        from .ephemeral_service import EphemeralService
        
        try:
            await EphemeralService.activate_trigger(request.user.id, pk)
            return Response({'status': 'trigger_activated'})
        except Exception as e:
            return Response({'error': str(e)}, status=400)

    @action(detail=True, methods=['post'])
    async def deactivate(self, request, pk=None):
        """Deactivate a trigger."""
        from .ephemeral_service import EphemeralService
        
        try:
            await EphemeralService.deactivate_trigger(request.user.id, pk)
            return Response({'status': 'trigger_deactivated'})
        except Exception as e:
            return Response({'error': str(e)}, status=400)

    @action(detail=False, methods=['get'])
    async def history(self, request):
        """Get trigger activation history."""
        from .ephemeral_service import EphemeralService
        
        limit = int(request.query_params.get('limit', 10))
        history = await EphemeralService.get_trigger_history(request.user.id, limit)
        return Response(history)

    @action(detail=False, methods=['post'])
    async def cleanup(self, request):
        """Cleanup stale triggers."""
        from .ephemeral_service import EphemeralService
        
        await EphemeralService.cleanup_stale_triggers(request.user.id)
        return Response({'status': 'cleanup_complete'})

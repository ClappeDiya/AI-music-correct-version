# admin.py for settings_module
# This file defines the admin interface for the settings_module app, allowing administrators to manage user settings and preferences.

from django.contrib import admin
from django.utils.translation import gettext_lazy as _
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
)


@admin.register(UserSettings)
class UserSettingsAdmin(admin.ModelAdmin):
    """
    Admin class for the UserSettings model.
    """
    list_display = ['id', 'user', 'last_updated']
    list_filter = ['user', 'last_updated']
    search_fields = ['preferences', 'device_specific_settings', 'user__username', 'user__email']
    readonly_fields = ['id', 'last_updated']
    autocomplete_fields = ['user']
    list_select_related = ['user']

    def get_queryset(self, request):
        """
        Limit non-superusers to their own records.
        """
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        return qs.filter(user=request.user)


@admin.register(UserSettingsHistory)
class UserSettingsHistoryAdmin(admin.ModelAdmin):
    """
    Admin class for the UserSettingsHistory model.
    """
    list_display = ['id', 'user', 'changed_at']
    list_filter = ['user', 'changed_at']
    search_fields = ['old_preferences', 'user__username', 'user__email']
    readonly_fields = ['id', 'changed_at']
    autocomplete_fields = ['user']
    list_select_related = ['user']


@admin.register(PreferenceInheritanceLayer)
class PreferenceInheritanceLayerAdmin(admin.ModelAdmin):
    """
    Admin class for the PreferenceInheritanceLayer model.
    """
    list_display = ['id', 'user', 'layer_type', 'layer_reference', 'priority']
    list_filter = ['user', 'layer_type', 'priority']
    search_fields = ['layer_reference', 'user__username', 'layer_type']
    readonly_fields = ['id']
    autocomplete_fields = ['user']
    list_select_related = ['user']


@admin.register(PreferenceSuggestion)
class PreferenceSuggestionAdmin(admin.ModelAdmin):
    """
    Admin class for the PreferenceSuggestion model.
    """
    list_display = ['id', 'user', 'suggested_at']
    list_filter = ['user', 'suggested_at']
    search_fields = ['suggestion_data', 'user__username']
    readonly_fields = ['id', 'suggested_at']
    autocomplete_fields = ['user']
    list_select_related = ['user']


@admin.register(UserSensoryTheme)
class UserSensoryThemeAdmin(admin.ModelAdmin):
    """
    Admin class for the UserSensoryTheme model.
    """
    list_display = ['id', 'user', 'updated_at']
    list_filter = ['user', 'updated_at']
    search_fields = ['sensory_mappings', 'user__username']
    readonly_fields = ['id', 'updated_at']
    autocomplete_fields = ['user']
    list_select_related = ['user']


@admin.register(ContextualProfile)
class ContextualProfileAdmin(admin.ModelAdmin):
    """
    Admin class for the ContextualProfile model.
    """
    list_display = ['id', 'user', 'get_trigger_conditions_summary']
    list_filter = ['user']
    search_fields = ['trigger_conditions', 'profile_adjustments', 'user__username']
    readonly_fields = ['id']
    autocomplete_fields = ['user']
    list_select_related = ['user']

    def get_trigger_conditions_summary(self, obj):
        if obj.trigger_conditions:
            return str(obj.trigger_conditions)[:100] + '...'
        return '-'
    get_trigger_conditions_summary.short_description = _('Trigger Conditions')


@admin.register(PreferenceExternalization)
class PreferenceExternalizationAdmin(admin.ModelAdmin):
    """
    Admin class for the PreferenceExternalization model.
    """
    list_display = ['id', 'user', 'service_name', 'active', 'sync_frequency', 'last_sync', 'created_at']
    list_filter = ['active', 'sync_frequency', 'service_name', 'created_at', 'last_sync']
    search_fields = ['service_name', 'description', 'user__username', 'external_identity_ref']
    readonly_fields = ['id', 'created_at', 'updated_at', 'last_sync']
    autocomplete_fields = ['user']
    list_select_related = ['user']


@admin.register(EphemeralEventPreference)
class EphemeralEventPreferenceAdmin(admin.ModelAdmin):
    """
    Admin class for the EphemeralEventPreference model.
    """
    list_display = ['id', 'user', 'event_key', 'event_type', 'active', 'priority', 'start_time', 'end_time', 'next_scheduled']
    list_filter = ['active', 'event_type', 'priority', 'created_at']
    search_fields = ['event_type', 'event_key', 'user__username']
    readonly_fields = ['id', 'created_at', 'updated_at']
    autocomplete_fields = ['user']
    list_select_related = ['user']


@admin.register(PersonaFusion)
class PersonaFusionAdmin(admin.ModelAdmin):
    """
    Admin class for the PersonaFusion model.
    """
    list_display = ['id', 'name', 'user', 'is_active', 'confidence_score', 'last_used', 'created_at']
    list_filter = ['is_active', 'created_at', 'last_used']
    search_fields = ['name', 'description', 'user__username', 'source_personas']
    readonly_fields = ['id', 'created_at', 'updated_at', 'last_used']
    autocomplete_fields = ['user']
    list_select_related = ['user']


@admin.register(TranslingualPreference)
class TranslingualPreferenceAdmin(admin.ModelAdmin):
    """
    Admin class for the TranslingualPreference model.
    """
    list_display = ['id', 'user', 'updated_at']
    list_filter = ['user', 'updated_at']
    search_fields = ['universal_preference_profile', 'user__username']
    readonly_fields = ['id', 'updated_at']
    autocomplete_fields = ['user']
    list_select_related = ['user']


@admin.register(UniversalProfileMapping)
class UniversalProfileMappingAdmin(admin.ModelAdmin):
    """
    Admin class for the UniversalProfileMapping model.
    """
    list_display = ['id', 'user', 'external_profile_format', 'updated_at']
    list_filter = ['user', 'external_profile_format', 'updated_at']
    search_fields = ['mapping_data', 'user__username', 'external_profile_format']
    readonly_fields = ['id', 'updated_at']
    autocomplete_fields = ['user']
    list_select_related = ['user']


@admin.register(BehaviorTriggeredOverlay)
class BehaviorTriggeredOverlayAdmin(admin.ModelAdmin):
    """
    Admin class for the BehaviorTriggeredOverlay model.
    """
    list_display = ['id', 'name', 'active', 'created_at', 'updated_at']
    list_filter = ['active', 'created_at']
    search_fields = ['name', 'overlay_data']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(MultiUserComposite)
class MultiUserCompositeAdmin(admin.ModelAdmin):
    """
    Admin class for the MultiUserComposite model.
    """
    list_display = ['id', 'get_participants_count', 'created_at']
    list_filter = ['created_at']
    search_fields = ['participant_user_ids', 'composite_prefs']
    readonly_fields = ['id', 'created_at']

    def get_participants_count(self, obj):
        return len(obj.participant_user_ids)
    get_participants_count.short_description = _('Number of Participants')


@admin.register(PredictivePreferenceModel)
class PredictivePreferenceModelAdmin(admin.ModelAdmin):
    """
    Admin class for the PredictivePreferenceModel model.
    """
    list_display = ['id', 'user', 'get_model_type', 'get_last_trained']
    list_filter = ['user']
    search_fields = ['model_metadata', 'user__username']
    readonly_fields = ['id']
    autocomplete_fields = ['user']
    list_select_related = ['user']

    def get_model_type(self, obj):
        return obj.model_metadata.get('model_type', '-') if obj.model_metadata else '-'
    get_model_type.short_description = _('Model Type')

    def get_last_trained(self, obj):
        return obj.model_metadata.get('last_trained', '-') if obj.model_metadata else '-'
    get_last_trained.short_description = _('Last Trained')


@admin.register(PredictivePreferenceEvent)
class PredictivePreferenceEventAdmin(admin.ModelAdmin):
    """
    Admin class for the PredictivePreferenceEvent model.
    """
    list_display = ['id', 'user', 'applied_at', 'reason']
    list_filter = ['user', 'applied_at']
    search_fields = ['applied_changes', 'reason', 'user__username']
    readonly_fields = ['id', 'applied_at']
    autocomplete_fields = ['user']
    list_select_related = ['user']

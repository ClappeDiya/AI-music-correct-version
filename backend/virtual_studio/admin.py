# admin.py for Virtual Studio and Instrument Simulation Module
# This file defines how the models are displayed and managed in the Django admin interface.

from django.contrib import admin
from .models import (
    Instrument,
    Effect,
    StudioSession,
    Track,
    TrackInstrument,
    TrackEffect,
    InstrumentPreset,
    EffectPreset,
    SessionTemplate,
    ExportedFile,
    VrArSetting,
    AiSuggestion,
    AdaptiveAutomationEvent,
)


@admin.register(Instrument)
class InstrumentAdmin(admin.ModelAdmin):
    """
    Admin class for the Instrument model.
    """
    list_display = ('id', 'name', 'instrument_type', 'created_by', 'is_public', 'created_at', 'updated_at')
    list_filter = ('instrument_type', 'is_public', 'created_at', 'updated_at')
    search_fields = ('name', 'instrument_type')
    readonly_fields = ('created_at', 'updated_at')
    autocomplete_fields = ['created_by']


@admin.register(Effect)
class EffectAdmin(admin.ModelAdmin):
    """
    Admin class for the Effect model.
    """
    list_display = ('id', 'name', 'effect_type', 'created_by', 'is_public', 'created_at', 'updated_at')
    list_filter = ('effect_type', 'is_public', 'created_at', 'updated_at')
    search_fields = ('name', 'effect_type')
    readonly_fields = ('created_at', 'updated_at')
    autocomplete_fields = ['created_by']


@admin.register(StudioSession)
class StudioSessionAdmin(admin.ModelAdmin):
    """
    Admin class for the StudioSession model.
    """
    list_display = ('id', 'user', 'session_name', 'is_public', 'created_at', 'updated_at')
    list_filter = ('is_public', 'created_at', 'updated_at')
    search_fields = ('user__username', 'session_name', 'description')
    readonly_fields = ('created_at', 'updated_at')
    filter_horizontal = ('collaborators',)
    autocomplete_fields = ['user']


@admin.register(Track)
class TrackAdmin(admin.ModelAdmin):
    """
    Admin class for the Track model.
    """
    list_display = ('id', 'session', 'track_name', 'track_type', 'position', 'created_at')
    list_filter = ('track_type', 'created_at')
    search_fields = ('track_name', 'session__session_name')
    readonly_fields = ('created_at',)
    autocomplete_fields = ['session']


@admin.register(TrackInstrument)
class TrackInstrumentAdmin(admin.ModelAdmin):
    """
    Admin class for the TrackInstrument model.
    """
    list_display = ('id', 'track', 'instrument', 'created_by', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('track__track_name', 'instrument__name')
    readonly_fields = ('created_at',)
    autocomplete_fields = ['track', 'instrument', 'created_by']


@admin.register(TrackEffect)
class TrackEffectAdmin(admin.ModelAdmin):
    """
    Admin class for the TrackEffect model.
    """
    list_display = ('id', 'track', 'effect', 'created_by', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('track__track_name', 'effect__name')
    readonly_fields = ('created_at',)
    autocomplete_fields = ['track', 'effect', 'created_by']


@admin.register(InstrumentPreset)
class InstrumentPresetAdmin(admin.ModelAdmin):
    """
    Admin class for the InstrumentPreset model.
    """
    list_display = ('id', 'user', 'instrument', 'preset_name', 'is_public', 'created_at')
    list_filter = ('is_public', 'created_at')
    search_fields = ('user__username', 'instrument__name', 'preset_name')
    readonly_fields = ('created_at',)
    autocomplete_fields = ['user', 'instrument']


@admin.register(EffectPreset)
class EffectPresetAdmin(admin.ModelAdmin):
    """
    Admin class for the EffectPreset model.
    """
    list_display = ('id', 'user', 'effect', 'preset_name', 'is_public', 'created_at')
    list_filter = ('is_public', 'created_at')
    search_fields = ('user__username', 'effect__name', 'preset_name')
    readonly_fields = ('created_at',)
    autocomplete_fields = ['user', 'effect']


@admin.register(SessionTemplate)
class SessionTemplateAdmin(admin.ModelAdmin):
    """
    Admin class for the SessionTemplate model.
    """
    list_display = ('id', 'user', 'template_name', 'is_public', 'created_at')
    list_filter = ('is_public', 'created_at')
    search_fields = ('user__username', 'template_name')
    readonly_fields = ('created_at',)
    autocomplete_fields = ['user']


@admin.register(ExportedFile)
class ExportedFileAdmin(admin.ModelAdmin):
    """
    Admin class for the ExportedFile model.
    """
    list_display = ('id', 'session', 'format', 'spatial_audio', 'created_by', 'created_at')
    list_filter = ('format', 'spatial_audio', 'created_at')
    search_fields = ('session__session_name', 'file_url', 'format')
    readonly_fields = ('created_at',)
    autocomplete_fields = ['session', 'created_by']


@admin.register(VrArSetting)
class VrArSettingAdmin(admin.ModelAdmin):
    """
    Admin class for the VrArSetting model.
    """
    list_display = ('id', 'session', 'created_by', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('session__session_name',)
    readonly_fields = ('created_at',)
    autocomplete_fields = ['session', 'created_by']


@admin.register(AiSuggestion)
class AiSuggestionAdmin(admin.ModelAdmin):
    """
    Admin class for the AiSuggestion model.
    """
    list_display = ('id', 'session', 'suggestion_type', 'applied', 'created_by', 'created_at')
    list_filter = ('suggestion_type', 'applied', 'created_at')
    search_fields = ('session__session_name', 'suggestion_type')
    readonly_fields = ('created_at',)
    autocomplete_fields = ['session', 'created_by']


@admin.register(AdaptiveAutomationEvent)
class AdaptiveAutomationEventAdmin(admin.ModelAdmin):
    """
    Admin class for the AdaptiveAutomationEvent model.
    """
    list_display = ('id', 'session', 'event_type', 'created_by', 'created_at')
    list_filter = ('event_type', 'created_at')
    search_fields = ('session__session_name', 'event_type')
    readonly_fields = ('created_at',)
    autocomplete_fields = ['session', 'created_by']

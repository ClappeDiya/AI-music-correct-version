# admin.py for voice_cloning
# This file defines how the models are displayed and managed in the Django admin interface.

from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import (
    Language,
    Emotion,
    VoiceCloningSettings,
    VoiceRecordingSession,
    VoiceSample,
    VoiceModel,
    VoiceModelVersion,
    VoiceModelShare,
    VoiceModelPermission,
    VoiceModelConsentScope,
    VoiceModelUsageLog,
    VoiceModelAdaptiveEvent,
    VoiceAnalysis
)


@admin.register(Language)
class LanguageAdmin(admin.ModelAdmin):
    """
    Admin class for the Language model.
    """
    list_display = ('id', 'code', 'name', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('code', 'name')
    readonly_fields = ('created_at',)


@admin.register(Emotion)
class EmotionAdmin(admin.ModelAdmin):
    """
    Admin class for the Emotion model.
    """
    list_display = ('id', 'label', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('label',)
    readonly_fields = ('created_at',)


@admin.register(VoiceCloningSettings)
class VoiceCloningSettingsAdmin(admin.ModelAdmin):
    """
    Admin class for the VoiceCloningSettings model.
    """
    list_display = ('id', 'setting_key', 'setting_value', 'created_at', 'updated_at')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('setting_key', 'setting_value')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(VoiceRecordingSession)
class VoiceRecordingSessionAdmin(admin.ModelAdmin):
    """
    Admin class for the VoiceRecordingSession model.
    """
    list_display = ('id', 'user', 'session_name', 'language_code', 'instructions_shown', 'created_at', 'ended_at')
    list_filter = ('instructions_shown', 'created_at', 'ended_at')
    search_fields = ('user__username', 'session_name', 'language_code')
    readonly_fields = ('created_at', 'ended_at')


@admin.register(VoiceSample)
class VoiceSampleAdmin(admin.ModelAdmin):
    """
    Admin class for the VoiceSample model.
    """
    list_display = ('id', 'session', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('session__session_name', 'file_url')
    readonly_fields = ('created_at',)


@admin.register(VoiceModel)
class VoiceModelAdmin(admin.ModelAdmin):
    """
    Admin class for the VoiceModel model.
    """
    list_display = ('id', 'user', 'name', 'is_active', 'created_at', 'updated_at')
    list_filter = ('is_active', 'created_at', 'updated_at')
    search_fields = ('user__username', 'name', 'description')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(VoiceModelVersion)
class VoiceModelVersionAdmin(admin.ModelAdmin):
    """
    Admin class for the VoiceModelVersion model.
    """
    list_display = ('id', 'model', 'version_number', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('model__name', 'changes')
    readonly_fields = ('created_at',)


@admin.register(VoiceModelShare)
class VoiceModelShareAdmin(admin.ModelAdmin):
    """
    Admin class for the VoiceModelShare model.
    """
    list_display = ('id', 'model', 'user', 'permission', 'created_at')
    list_filter = ('permission', 'created_at')
    search_fields = ('model__name', 'user__username')
    readonly_fields = ('created_at',)


@admin.register(VoiceModelPermission)
class VoiceModelPermissionAdmin(admin.ModelAdmin):
    """
    Admin class for the VoiceModelPermission model.
    """
    list_display = ('id', 'user', 'voice_model', 'consent_granted_at', 'consent_revoked_at')
    list_filter = ('consent_granted_at', 'consent_revoked_at')
    search_fields = ('user__username', 'voice_model__name')
    readonly_fields = ('consent_granted_at', 'consent_revoked_at')


@admin.register(VoiceModelConsentScope)
class VoiceModelConsentScopeAdmin(admin.ModelAdmin):
    """
    Admin class for the VoiceModelConsentScope model.
    """
    list_display = ('id', 'voice_model', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('voice_model__name',)
    readonly_fields = ('created_at',)


@admin.register(VoiceModelUsageLog)
class VoiceModelUsageLogAdmin(admin.ModelAdmin):
    """
    Admin class for the VoiceModelUsageLog model.
    """
    list_display = ('id', 'voice_model', 'used_in_context', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('voice_model__name', 'used_in_context')
    readonly_fields = ('created_at',)


@admin.register(VoiceModelAdaptiveEvent)
class VoiceModelAdaptiveEventAdmin(admin.ModelAdmin):
    """
    Admin class for the VoiceModelAdaptiveEvent model.
    """
    list_display = ('id', 'voice_model', 'event_type', 'triggered_by', 'created_at')
    list_filter = ('event_type', 'triggered_by', 'created_at')
    search_fields = ('voice_model__name', 'event_type', 'triggered_by')
    readonly_fields = ('created_at',)


@admin.register(VoiceAnalysis)
class VoiceAnalysisAdmin(admin.ModelAdmin):
    """
    Admin class for the VoiceAnalysis model.
    """
    list_display = ('id', 'user', 'voice_model', 'status', 'progress_percentage', 'current_step', 'created_at', 'updated_at')
    list_filter = ('status', 'created_at', 'updated_at')
    search_fields = ('user__username', 'voice_model__name', 'current_step')
    readonly_fields = ('created_at', 'updated_at')

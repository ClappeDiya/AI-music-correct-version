from django.contrib import admin
from .models import (
    LLMProvider,
    AIMusicRequest,
    AIMusicParams,
    GeneratedTrack,
    ModelUsageLog,
    SavedComposition,
    CompositionVersion,
    Genre,
    Region,
    ModelCapability,
    ModelRouter,
    ModelRouterAssignment,
    UserFeedback,
    UserPreference,
    MusicTradition,
    CrossCulturalBlend,
    TraditionBlendWeight,
    MultilingualLyrics,
    TrackLayer,
    ArrangementSection,
    TrackAutomation,
    VocalLine,
    HarmonyGroup,
    HarmonyVoicing,
    MasteringPreset,
    MasteringSession,
    SpectralMatch,
    CreativeChallenge,
    ChallengeSubmission,
    ContentModeration
)
from django.utils.translation import gettext_lazy as _


@admin.register(LLMProvider)
class LLMProviderAdmin(admin.ModelAdmin):
    """
    Admin class for the LLMProvider model.
    """
    list_display = ('id', 'name', 'provider_type', 'active', 'created_at', 'updated_at')
    list_filter = ('provider_type', 'active', 'created_at', 'updated_at')
    search_fields = ('name', 'provider_type', 'api_endpoint')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        (_('Provider Information'), {
            'fields': ('name', 'provider_type', 'api_endpoint', 'api_credentials', 'active')
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(AIMusicRequest)
class AIMusicRequestAdmin(admin.ModelAdmin):
    """
    Admin class for the AIMusicRequest model.
    """
    list_display = ('id', 'user', 'provider', 'status', 'created_at', 'updated_at')
    list_filter = ('status', 'provider', 'created_at', 'updated_at')
    search_fields = ('user__username', 'prompt_text', 'status')
    readonly_fields = ('created_at', 'updated_at')
    list_select_related = ['user', 'provider']
    fieldsets = (
        (_('Request Information'), {
            'fields': ('user', 'provider', 'prompt_text', 'status')
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(AIMusicParams)
class AIMusicParamsAdmin(admin.ModelAdmin):
    """
    Admin class for the AIMusicParams model.
    """
    list_display = ('id', 'request', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('request__prompt_text',)
    readonly_fields = ('created_at',)
    list_select_related = ['request']
    fieldsets = (
        (_('Parameters'), {
            'fields': ('request', 'parameters')
        }),
        (_('Timestamps'), {
            'fields': ('created_at',)
        }),
    )


@admin.register(GeneratedTrack)
class GeneratedTrackAdmin(admin.ModelAdmin):
    """
    Admin class for the GeneratedTrack model.
    """
    list_display = ('id', 'request', 'created_at', 'finalization_timestamp')
    list_filter = ('created_at', 'finalization_timestamp')
    search_fields = ('request__prompt_text', 'audio_file_url')
    readonly_fields = ('created_at', 'finalization_timestamp')
    list_select_related = ['request']
    fieldsets = (
        (_('Track Information'), {
            'fields': ('request', 'audio_file_url', 'waveform_data', 'notation_data')
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'finalization_timestamp')
        }),
    )


@admin.register(ModelUsageLog)
class ModelUsageLogAdmin(admin.ModelAdmin):
    """
    Admin class for the ModelUsageLog model.
    """
    list_display = ('id', 'request', 'provider', 'created_at')
    list_filter = ('provider', 'created_at')
    search_fields = ('request__prompt_text', 'prompt_sent')
    readonly_fields = ('created_at',)
    list_select_related = ['request', 'provider']
    fieldsets = (
        (_('Log Information'), {
            'fields': ('request', 'provider', 'prompt_sent', 'response_metadata')
        }),
        (_('Timestamps'), {
            'fields': ('created_at',)
        }),
    )


@admin.register(SavedComposition)
class SavedCompositionAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'title', 'is_public', 'created_at', 'updated_at')
    list_filter = ('is_public', 'created_at', 'updated_at')
    search_fields = ('user__username', 'title', 'description')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(CompositionVersion)
class CompositionVersionAdmin(admin.ModelAdmin):
    list_display = ('id', 'composition', 'version_number', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('composition__title', 'version_notes')
    readonly_fields = ('created_at',)


@admin.register(Genre)
class GenreAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'created_at')
    search_fields = ('name', 'description')
    readonly_fields = ('created_at',)


@admin.register(Region)
class RegionAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'code', 'created_at')
    search_fields = ('name', 'code')
    readonly_fields = ('created_at',)


@admin.register(ModelCapability)
class ModelCapabilityAdmin(admin.ModelAdmin):
    list_display = ('id', 'provider', 'capability_type', 'confidence_score', 'latency_ms')
    list_filter = ('provider', 'capability_type')
    search_fields = ('provider__name', 'capability_type')


@admin.register(ModelRouter)
class ModelRouterAdmin(admin.ModelAdmin):
    list_display = ('id', 'request', 'routing_strategy', 'created_at', 'completed_at')
    list_filter = ('routing_strategy', 'created_at', 'completed_at')
    search_fields = ('request__prompt_text',)
    readonly_fields = ('created_at', 'completed_at')


@admin.register(ModelRouterAssignment)
class ModelRouterAssignmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'router', 'provider', 'task_type', 'status', 'priority')
    list_filter = ('status', 'task_type', 'priority')
    search_fields = ('provider__name', 'task_type')
    readonly_fields = ('started_at', 'completed_at')


@admin.register(UserFeedback)
class UserFeedbackAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'generated_track', 'feedback_type', 'rating', 'created_at')
    list_filter = ('feedback_type', 'rating', 'created_at')
    search_fields = ('user__username', 'feedback_text')
    readonly_fields = ('created_at',)


@admin.register(UserPreference)
class UserPreferenceAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'complexity_preference', 'learning_rate', 'exploration_rate', 'last_updated')
    list_filter = ('last_updated',)
    search_fields = ('user__username',)
    readonly_fields = ('last_updated',)


@admin.register(MusicTradition)
class MusicTraditionAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'region', 'created_at', 'updated_at')
    list_filter = ('region', 'created_at', 'updated_at')
    search_fields = ('name', 'description')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(CrossCulturalBlend)
class CrossCulturalBlendAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'blend_strategy', 'created_at', 'updated_at')
    list_filter = ('blend_strategy', 'created_at', 'updated_at')
    search_fields = ('name', 'description')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(TraditionBlendWeight)
class TraditionBlendWeightAdmin(admin.ModelAdmin):
    list_display = ('id', 'blend', 'tradition', 'weight')
    list_filter = ('blend', 'tradition')
    search_fields = ('blend__name', 'tradition__name')


@admin.register(MultilingualLyrics)
class MultilingualLyricsAdmin(admin.ModelAdmin):
    list_display = ('id', 'track', 'primary_language', 'created_at', 'updated_at')
    list_filter = ('primary_language', 'created_at', 'updated_at')
    search_fields = ('original_lyrics', 'track__request__prompt_text')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(TrackLayer)
class TrackLayerAdmin(admin.ModelAdmin):
    list_display = ('id', 'composition', 'name', 'track_type', 'instrument', 'created_at')
    list_filter = ('track_type', 'instrument', 'created_at')
    search_fields = ('name', 'composition__title')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(ArrangementSection)
class ArrangementSectionAdmin(admin.ModelAdmin):
    list_display = ('id', 'composition', 'name', 'section_type', 'start_time', 'duration')
    list_filter = ('section_type', 'created_at')
    search_fields = ('name', 'composition__title')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(TrackAutomation)
class TrackAutomationAdmin(admin.ModelAdmin):
    list_display = ('id', 'track', 'parameter_name', 'interpolation_type', 'created_at')
    list_filter = ('parameter_name', 'interpolation_type', 'created_at')
    search_fields = ('track__name',)
    readonly_fields = ('created_at', 'updated_at')


@admin.register(VocalLine)
class VocalLineAdmin(admin.ModelAdmin):
    list_display = ('id', 'composition', 'voice_type', 'is_harmony', 'created_at')
    list_filter = ('voice_type', 'is_harmony', 'created_at')
    search_fields = ('composition__title',)
    readonly_fields = ('created_at', 'updated_at')


@admin.register(HarmonyGroup)
class HarmonyGroupAdmin(admin.ModelAdmin):
    list_display = ('id', 'composition', 'name', 'voicing_type', 'created_at')
    list_filter = ('voicing_type', 'created_at')
    search_fields = ('name', 'composition__title')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(HarmonyVoicing)
class HarmonyVoicingAdmin(admin.ModelAdmin):
    list_display = ('id', 'harmony_group', 'vocal_line', 'voice_order', 'created_at')
    list_filter = ('voice_order', 'created_at')
    search_fields = ('harmony_group__name', 'vocal_line__voice_type')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(MasteringPreset)
class MasteringPresetAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'preset_type', 'target_lufs', 'target_peak', 'created_at')
    list_filter = ('preset_type', 'created_at')
    search_fields = ('name', 'description')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(MasteringSession)
class MasteringSessionAdmin(admin.ModelAdmin):
    list_display = ('id', 'composition_version', 'preset', 'processing_status', 'created_at')
    list_filter = ('processing_status', 'created_at')
    search_fields = ('composition_version__composition__title', 'preset__name')
    readonly_fields = ('created_at', 'completed_at')


@admin.register(SpectralMatch)
class SpectralMatchAdmin(admin.ModelAdmin):
    list_display = ('id', 'mastering_session', 'match_quality', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('mastering_session__composition_version__composition__title',)
    readonly_fields = ('created_at',)


@admin.register(CreativeChallenge)
class CreativeChallengeAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'challenge_type', 'status', 'start_date', 'end_date')
    list_filter = ('challenge_type', 'status', 'start_date', 'end_date')
    search_fields = ('title', 'description')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(ChallengeSubmission)
class ChallengeSubmissionAdmin(admin.ModelAdmin):
    list_display = ('id', 'challenge', 'composition', 'participant', 'moderation_status')
    list_filter = ('moderation_status', 'created_at')
    search_fields = ('challenge__title', 'composition__title', 'participant__username')
    readonly_fields = ('created_at',)


@admin.register(ContentModeration)
class ContentModerationAdmin(admin.ModelAdmin):
    list_display = ('id', 'composition', 'check_type', 'status', 'confidence_score')
    list_filter = ('check_type', 'status', 'admin_reviewed')
    search_fields = ('composition__title', 'admin_notes')
    readonly_fields = ('created_at', 'updated_at')

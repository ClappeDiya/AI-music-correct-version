from django.contrib import admin
from .models import (
    LLMProvider,
    LyricPrompt,
    LyricDraft,
    LyricEdit,
    FinalLyrics,
    LyricTimeline,
    Language,
    LyricInfluencer,
    LyricModelVersion,
    LyricVrArSettings,
    LyricSignature,
    LyricAdaptiveFeedback,
    CollaborativeLyricSession,
    LyricShareLink,
    CollaboratorPresence,
    CollaborativeEdit
)

@admin.register(LLMProvider)
class LLMProviderAdmin(admin.ModelAdmin):
    """
    Admin class for the LLMProvider model.
    Allows administrators to manage LLM providers through the Django admin interface.
    """
    list_display = ['name', 'provider_type', 'active', 'created_at', 'updated_at']
    list_filter = ['provider_type', 'active']
    search_fields = ['name', 'provider_type']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(LyricPrompt)
class LyricPromptAdmin(admin.ModelAdmin):
    """
    Admin class for the LyricPrompt model.
    Allows administrators to manage lyric prompts through the Django admin interface.
    """
    list_display = ['id', 'user', 'provider', 'language_code', 'created_at']
    list_filter = ['created_at', 'language_code']
    search_fields = ['user__username', 'prompt_text']
    readonly_fields = ['created_at']
    list_select_related = ['user', 'provider']


@admin.register(LyricDraft)
class LyricDraftAdmin(admin.ModelAdmin):
    """
    Admin class for the LyricDraft model.
    Allows administrators to manage lyric drafts through the Django admin interface.
    """
    list_display = ['id', 'prompt', 'created_at']
    list_filter = ['created_at']
    search_fields = ['draft_content']
    readonly_fields = ['created_at']
    list_select_related = ['prompt']


@admin.register(LyricEdit)
class LyricEditAdmin(admin.ModelAdmin):
    """
    Admin class for the LyricEdit model.
    Allows administrators to manage lyric edits through the Django admin interface.
    """
    list_display = ['id', 'draft', 'created_at']
    list_filter = ['created_at']
    search_fields = ['edited_content', 'edit_notes']
    readonly_fields = ['created_at']
    list_select_related = ['draft']


@admin.register(FinalLyrics)
class FinalLyricsAdmin(admin.ModelAdmin):
    """
    Admin class for the FinalLyrics model.
    Allows administrators to manage final lyrics through the Django admin interface.
    """
    list_display = ['id', 'user', 'track_id', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'lyrics_content']
    readonly_fields = ['created_at']
    list_select_related = ['user']


@admin.register(LyricTimeline)
class LyricTimelineAdmin(admin.ModelAdmin):
    """
    Admin class for the LyricTimeline model.
    Allows administrators to manage lyric timelines through the Django admin interface.
    """
    list_display = ['id', 'final_lyrics', 'start_time_seconds', 'end_time_seconds', 'created_at']
    list_filter = ['created_at']
    search_fields = ['lyric_segment']
    readonly_fields = ['created_at']
    list_select_related = ['final_lyrics']


@admin.register(Language)
class LanguageAdmin(admin.ModelAdmin):
    """
    Admin class for the Language model.
    Allows administrators to manage languages through the Django admin interface.
    """
    list_display = ['code', 'name', 'created_at']
    list_filter = ['code']
    search_fields = ['code', 'name']
    readonly_fields = ['created_at']


@admin.register(LyricInfluencer)
class LyricInfluencerAdmin(admin.ModelAdmin):
    """
    Admin class for the LyricInfluencer model.
    Allows administrators to manage lyric influencers through the Django admin interface.
    """
    list_display = ['name', 'created_at']
    search_fields = ['name']
    readonly_fields = ['created_at']


@admin.register(LyricModelVersion)
class LyricModelVersionAdmin(admin.ModelAdmin):
    """
    Admin class for the LyricModelVersion model.
    Allows administrators to manage lyric model versions through the Django admin interface.
    """
    list_display = ['id', 'prompt', 'model_version', 'created_at']
    list_filter = ['created_at', 'model_version']
    search_fields = ['model_version']
    readonly_fields = ['created_at']
    list_select_related = ['prompt']


@admin.register(LyricVrArSettings)
class LyricVrArSettingsAdmin(admin.ModelAdmin):
    """
    Admin class for the LyricVrArSettings model.
    Allows administrators to manage lyric VR/AR settings through the Django admin interface.
    """
    list_display = ['id', 'final_lyrics', 'created_at']
    list_filter = ['created_at']
    search_fields = ['vr_ar_config']
    readonly_fields = ['created_at']
    list_select_related = ['final_lyrics']


@admin.register(LyricSignature)
class LyricSignatureAdmin(admin.ModelAdmin):
    """
    Admin class for the LyricSignature model.
    Allows administrators to manage lyric signatures through the Django admin interface.
    """
    list_display = ['id', 'final_lyrics', 'created_at']
    list_filter = ['created_at']
    search_fields = ['signature_hash']
    readonly_fields = ['created_at']
    list_select_related = ['final_lyrics']


@admin.register(LyricAdaptiveFeedback)
class LyricAdaptiveFeedbackAdmin(admin.ModelAdmin):
    """
    Admin class for the LyricAdaptiveFeedback model.
    Allows administrators to manage lyric adaptive feedback through the Django admin interface.
    """
    list_display = ['id', 'final_lyrics', 'event_type', 'created_at']
    list_filter = ['created_at', 'event_type']
    search_fields = ['event_type']
    readonly_fields = ['created_at']
    list_select_related = ['final_lyrics']

@admin.register(CollaborativeLyricSession)
class CollaborativeLyricSessionAdmin(admin.ModelAdmin):
    """
    Admin class for the CollaborativeLyricSession model.
    """
    list_display = ['id', 'owner', 'created_at', 'expires_at', 'is_active']
    list_filter = ['is_active', 'created_at']
    search_fields = ['owner__username', 'id']
    readonly_fields = ['created_at']
    list_select_related = ['owner']

@admin.register(LyricShareLink)
class LyricShareLinkAdmin(admin.ModelAdmin):
    """
    Admin class for the LyricShareLink model.
    """
    list_display = ['id', 'session', 'created_by', 'expires_at', 'times_used', 'max_uses']
    list_filter = ['created_at', 'expires_at']
    search_fields = ['token', 'created_by__username']
    readonly_fields = ['created_at', 'token']
    list_select_related = ['session', 'created_by']

@admin.register(CollaboratorPresence)
class CollaboratorPresenceAdmin(admin.ModelAdmin):
    """
    Admin class for the CollaboratorPresence model.
    """
    list_display = ['session', 'user', 'last_seen', 'is_active', 'connected_at']
    list_filter = ['is_active', 'connected_at']
    search_fields = ['user__username']
    readonly_fields = ['connected_at', 'last_seen']
    list_select_related = ['session', 'user']

@admin.register(CollaborativeEdit)
class CollaborativeEditAdmin(admin.ModelAdmin):
    """
    Admin class for the CollaborativeEdit model.
    """
    list_display = ['id', 'session', 'editor', 'edit_type', 'created_at']
    list_filter = ['edit_type', 'created_at']
    search_fields = ['editor__username', 'content']
    readonly_fields = ['created_at']
    list_select_related = ['session', 'editor']

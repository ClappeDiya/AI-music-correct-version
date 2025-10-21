# admin.py for mood_based_music
# This file configures the Django admin interface for the mood_based_music app,
# allowing administrators to manage moods, custom moods, mood requests, generated tracks,
# feedback, and profiles.

from django.contrib import admin
from .models import (
    Mood,
    CustomMood,
    MoodRequest,
    GeneratedMoodTrack,
    MoodFeedback,
    MoodProfile,
    ExternalMoodReference,
    MoodEmbedding,
    ContextualTrigger,
    LiveMoodSession,
    CollaborativeMoodSpace,
    AdvancedMoodParameter,
    MoodPlaylist,
)

class UserSpecificAdmin(admin.ModelAdmin):
    """
    Base admin class that implements user-specific filtering
    """
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        if hasattr(qs.model, 'user'):
            return qs.filter(user=request.user)
        return qs

@admin.register(Mood)
class MoodAdmin(admin.ModelAdmin):
    """
    Admin configuration for the Mood model.
    """
    list_display = ['name', 'description', 'created_at', 'updated_at']
    list_filter = ['created_at', 'updated_at']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(CustomMood)
class CustomMoodAdmin(UserSpecificAdmin):
    """
    Admin configuration for the CustomMood model.
    """
    list_display = ['mood_name', 'user', 'created_at']
    list_filter = ['created_at']
    search_fields = ['mood_name', 'user__username']
    autocomplete_fields = ['user']
    readonly_fields = ['created_at']

@admin.register(MoodRequest)
class MoodRequestAdmin(UserSpecificAdmin, admin.ModelAdmin):
    """
    Admin configuration for the MoodRequest model.
    """
    list_display = ['user', 'selected_mood', 'custom_mood', 'intensity', 'created_at']
    list_filter = ['created_at', 'intensity']
    search_fields = ['user__username', 'selected_mood__name', 'custom_mood__mood_name']
    autocomplete_fields = ['user', 'selected_mood', 'custom_mood']
    readonly_fields = ['created_at']

@admin.register(GeneratedMoodTrack)
class GeneratedMoodTrackAdmin(UserSpecificAdmin, admin.ModelAdmin):
    """
    Admin configuration for the GeneratedMoodTrack model.
    """
    list_display = ['mood_request', 'track_id', 'file_url', 'created_at']
    list_filter = ['created_at']
    search_fields = ['mood_request__user__username', 'track_id', 'file_url']
    autocomplete_fields = ['mood_request']
    readonly_fields = ['created_at']

@admin.register(MoodFeedback)
class MoodFeedbackAdmin(UserSpecificAdmin, admin.ModelAdmin):
    """
    Admin configuration for the MoodFeedback model.
    """
    list_display = ['user', 'generated_track', 'feedback_type', 'created_at']
    list_filter = ['created_at', 'feedback_type']
    search_fields = ['user__username', 'generated_track__mood_request__user__username', 'feedback_notes']
    autocomplete_fields = ['user', 'generated_track']
    readonly_fields = ['created_at']

@admin.register(MoodProfile)
class MoodProfileAdmin(UserSpecificAdmin, admin.ModelAdmin):
    """
    Admin configuration for the MoodProfile model.
    """
    list_display = ['user', 'last_updated']
    search_fields = ['user__username']
    autocomplete_fields = ['user']
    readonly_fields = ['last_updated']

@admin.register(ExternalMoodReference)
class ExternalMoodReferenceAdmin(UserSpecificAdmin, admin.ModelAdmin):
    """
    Admin configuration for the ExternalMoodReference model.
    """
    list_display = ['reference_type', 'created_at']
    list_filter = ['created_at', 'reference_type']
    search_fields = ['reference_type', 'data']
    readonly_fields = ['created_at']

@admin.register(MoodEmbedding)
class MoodEmbeddingAdmin(UserSpecificAdmin, admin.ModelAdmin):
    """
    Admin configuration for the MoodEmbedding model.
    """
    list_display = ['user', 'dimensionality', 'created_at']
    search_fields = ['user__username']
    autocomplete_fields = ['user']
    readonly_fields = ['created_at']

@admin.register(ContextualTrigger)
class ContextualTriggerAdmin(UserSpecificAdmin, admin.ModelAdmin):
    """
    Admin configuration for the ContextualTrigger model.
    """
    list_display = ['user', 'created_at']
    search_fields = ['user__username', 'trigger_data']
    autocomplete_fields = ['user']
    readonly_fields = ['created_at']

@admin.register(LiveMoodSession)
class LiveMoodSessionAdmin(UserSpecificAdmin, admin.ModelAdmin):
    """
    Admin configuration for the LiveMoodSession model.
    """
    list_display = ['user', 'session_name', 'active', 'last_update']
    list_filter = ['active', 'last_update']
    search_fields = ['user__username', 'session_name']
    autocomplete_fields = ['user']
    readonly_fields = ['last_update']

@admin.register(CollaborativeMoodSpace)
class CollaborativeMoodSpaceAdmin(UserSpecificAdmin, admin.ModelAdmin):
    """
    Admin configuration for the CollaborativeMoodSpace model.
    """
    list_display = ['space_name', 'created_at']
    search_fields = ['space_name']
    readonly_fields = ['created_at']

@admin.register(AdvancedMoodParameter)
class AdvancedMoodParameterAdmin(UserSpecificAdmin, admin.ModelAdmin):
    """
    Admin configuration for the AdvancedMoodParameter model.
    """
    list_display = ['user', 'created_at']
    search_fields = ['user__username', 'model_tweaks']
    autocomplete_fields = ['user']
    readonly_fields = ['created_at']

@admin.register(MoodPlaylist)
class MoodPlaylistAdmin(UserSpecificAdmin, admin.ModelAdmin):
    """
    Admin configuration for the MoodPlaylist model.
    """
    list_display = ['user', 'playlist_name', 'auto_update', 'created_at']
    list_filter = ['auto_update', 'created_at']
    search_fields = ['user__username', 'playlist_name']
    autocomplete_fields = ['user']
    readonly_fields = ['created_at']

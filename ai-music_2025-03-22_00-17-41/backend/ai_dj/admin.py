from django.contrib import admin
from .models import (
    Track,
    TrackTranslation,
    TrackLyrics,
    AIDJSession,
    AIDJPlayHistory,
    AIDJRecommendation,
    AIDJFeedback,
    AIDJSavedSet
)

@admin.register(Track)
class TrackAdmin(admin.ModelAdmin):
    """
    Admin class for the Track model.
    Defines how Track objects are displayed and managed in the Django admin interface.
    """
    list_display = ('id', 'title', 'artist', 'album', 'genre', 'duration_seconds', 'original_language', 'created_at', 'updated_at')
    list_filter = ('genre', 'original_language', 'created_at', 'updated_at')
    search_fields = ('title', 'artist', 'album', 'genre')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(TrackTranslation)
class TrackTranslationAdmin(admin.ModelAdmin):
    """
    Admin class for the TrackTranslation model.
    Defines how TrackTranslation objects are displayed and managed in the Django admin interface.
    """
    list_display = ('id', 'track', 'language_code', 'title', 'artist', 'album', 'created_at', 'updated_at')
    list_filter = ('language_code', 'created_at', 'updated_at')
    search_fields = ('track__title', 'title', 'artist', 'album')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(TrackLyrics)
class TrackLyricsAdmin(admin.ModelAdmin):
    """
    Admin class for the TrackLyrics model.
    Defines how TrackLyrics objects are displayed and managed in the Django admin interface.
    """
    list_display = ('id', 'track', 'language_code', 'is_original', 'verified', 'translation_source', 'created_at', 'updated_at')
    list_filter = ('language_code', 'is_original', 'verified', 'translation_source', 'created_at', 'updated_at')
    search_fields = ('track__title', 'lyrics_text')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(AIDJSession)
class AIDJSessionAdmin(admin.ModelAdmin):
    """
    Admin class for the AIDJSession model.
    Defines how AIDJSession objects are displayed and managed in the Django admin interface.
    """
    list_display = ('id', 'user', 'command_language', 'preferred_language', 'voice_style', 'voice_accent', 'announcement_frequency', 'enable_announcements', 'updated_at')
    list_filter = ('command_language', 'preferred_language', 'voice_style', 'announcement_frequency', 'enable_announcements', 'updated_at')
    search_fields = ('user__username', 'last_voice_command', 'last_announcement')
    readonly_fields = ('updated_at',)


@admin.register(AIDJPlayHistory)
class AIDJPlayHistoryAdmin(admin.ModelAdmin):
    """
    Admin class for the AIDJPlayHistory model.
    Defines how AIDJPlayHistory objects are displayed and managed in the Django admin interface.
    """
    list_display = ('id', 'user', 'track', 'played_at')
    list_filter = ('played_at',)
    search_fields = ('user__username', 'track__title')
    readonly_fields = ('played_at',)


@admin.register(AIDJRecommendation)
class AIDJRecommendationAdmin(admin.ModelAdmin):
    """
    Admin class for the AIDJRecommendation model.
    Defines how AIDJRecommendation objects are displayed and managed in the Django admin interface.
    """
    list_display = ('id', 'user', 'recommended_at')
    list_filter = ('recommended_at',)
    search_fields = ('user__username',)
    readonly_fields = ('recommended_at',)


@admin.register(AIDJFeedback)
class AIDJFeedbackAdmin(admin.ModelAdmin):
    """
    Admin class for the AIDJFeedback model.
    Defines how AIDJFeedback objects are displayed and managed in the Django admin interface.
    """
    list_display = ('id', 'user', 'track', 'recommendation', 'feedback_type', 'created_at')
    list_filter = ('feedback_type', 'created_at')
    search_fields = ('user__username', 'track__title', 'feedback_notes')
    readonly_fields = ('created_at',)


@admin.register(AIDJSavedSet)
class AIDJSavedSetAdmin(admin.ModelAdmin):
    """
    Admin class for the AIDJSavedSet model.
    Defines how AIDJSavedSet objects are displayed and managed in the Django admin interface.
    """
    list_display = ('id', 'user', 'set_name', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__username', 'set_name')
    readonly_fields = ('created_at',)

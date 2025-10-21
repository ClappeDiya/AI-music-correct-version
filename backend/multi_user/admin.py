from django.contrib import admin
from .models import (
    DJSession,
    SessionParticipant,
    TrackRequest,
    TrackVote,
    SessionMessage,
    SessionAnalytics
)

@admin.register(DJSession)
class DJSessionAdmin(admin.ModelAdmin):
    list_display = ('name', 'host', 'is_active', 'is_public', 'created_at', 'max_participants')
    list_filter = ('is_active', 'is_public', 'created_at')
    search_fields = ('name', 'host__username', 'join_code')
    readonly_fields = ('created_at', 'updated_at')
    date_hierarchy = 'created_at'

@admin.register(SessionParticipant)
class SessionParticipantAdmin(admin.ModelAdmin):
    list_display = ('user', 'session', 'role', 'joined_at', 'is_online')
    list_filter = ('role', 'is_online', 'joined_at')
    search_fields = ('user__username', 'session__name')
    readonly_fields = ('joined_at', 'last_active')

@admin.register(TrackRequest)
class TrackRequestAdmin(admin.ModelAdmin):
    list_display = ('track_title', 'track_artist', 'requested_by', 'session', 'status', 'position_in_queue')
    list_filter = ('status', 'requested_at')
    search_fields = ('track_title', 'track_artist', 'requested_by__user__username')
    readonly_fields = ('requested_at', 'played_at')
    ordering = ('position_in_queue', 'requested_at')

@admin.register(TrackVote)
class TrackVoteAdmin(admin.ModelAdmin):
    list_display = ('track_request', 'voter', 'vote', 'voted_at')
    list_filter = ('vote', 'voted_at')
    search_fields = ('voter__user__username', 'track_request__track_title')
    readonly_fields = ('voted_at',)

@admin.register(SessionMessage)
class SessionMessageAdmin(admin.ModelAdmin):
    list_display = ('session', 'sender', 'message_type', 'content_preview', 'sent_at')
    list_filter = ('message_type', 'sent_at')
    search_fields = ('content', 'sender__user__username', 'session__name')
    readonly_fields = ('sent_at',)

    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Content'

@admin.register(SessionAnalytics)
class SessionAnalyticsAdmin(admin.ModelAdmin):
    list_display = ('session', 'peak_participants', 'total_tracks_played', 'total_votes', 'average_track_rating')
    list_filter = ('peak_participants', 'total_tracks_played')
    search_fields = ('session__name',)
    readonly_fields = ('session_duration',)

    fieldsets = (
        ('Session Info', {
            'fields': ('session', 'session_duration')
        }),
        ('Participation Metrics', {
            'fields': ('peak_participants', 'total_tracks_played', 'total_votes', 'total_messages')
        }),
        ('Engagement Metrics', {
            'fields': ('average_track_rating', 'most_requested_genres', 'participant_engagement')
        }),
    ) 
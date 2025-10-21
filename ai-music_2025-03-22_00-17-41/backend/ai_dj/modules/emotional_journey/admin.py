from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import (
    EmotionalState,
    EmotionalJourney,
    JourneyWaypoint,
    SessionJourney,
    EmotionalSnapshot,
    JourneyFeedback,
    EmotionalAnalytics
)


@admin.register(EmotionalState)
class EmotionalStateAdmin(admin.ModelAdmin):
    list_display = ('name', 'valence', 'arousal', 'color_code', 'created_at')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('name', 'description')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        (None, {
            'fields': ('name', 'description', 'color_code')
        }),
        (_('Emotional Parameters'), {
            'fields': ('valence', 'arousal')
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )


class JourneyWaypointInline(admin.TabularInline):
    model = JourneyWaypoint
    extra = 1
    ordering = ('position',)


@admin.register(EmotionalJourney)
class EmotionalJourneyAdmin(admin.ModelAdmin):
    list_display = ('name', 'duration_minutes', 'created_by', 'is_public', 'created_at')
    list_filter = ('is_public', 'created_at', 'created_by')
    search_fields = ('name', 'description', 'tags')
    readonly_fields = ('created_at', 'updated_at')
    inlines = [JourneyWaypointInline]
    fieldsets = (
        (None, {
            'fields': ('name', 'description', 'duration_minutes')
        }),
        (_('Settings'), {
            'fields': ('created_by', 'is_public', 'tags')
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )


@admin.register(JourneyWaypoint)
class JourneyWaypointAdmin(admin.ModelAdmin):
    list_display = ('journey', 'emotional_state', 'position', 'duration_minutes', 'intensity')
    list_filter = ('journey', 'emotional_state', 'transition_type')
    search_fields = ('journey__name', 'emotional_state__name')
    ordering = ('journey', 'position')


@admin.register(SessionJourney)
class SessionJourneyAdmin(admin.ModelAdmin):
    list_display = ('session', 'journey', 'start_time', 'end_time', 'progress', 'status')
    list_filter = ('status', 'start_time', 'end_time')
    search_fields = ('session__id', 'journey__name')
    readonly_fields = ('start_time',)
    fieldsets = (
        (None, {
            'fields': ('session', 'journey', 'current_waypoint')
        }),
        (_('Progress'), {
            'fields': ('progress', 'status')
        }),
        (_('Timing'), {
            'fields': ('start_time', 'end_time')
        })
    )


@admin.register(EmotionalSnapshot)
class EmotionalSnapshotAdmin(admin.ModelAdmin):
    list_display = ('session_journey', 'emotional_state', 'intensity', 'confidence_score', 'timestamp')
    list_filter = ('emotional_state', 'timestamp')
    search_fields = ('session_journey__journey__name', 'emotional_state__name')
    readonly_fields = ('timestamp',)


@admin.register(JourneyFeedback)
class JourneyFeedbackAdmin(admin.ModelAdmin):
    list_display = ('user', 'session_journey', 'rating', 'emotional_impact', 'timestamp')
    list_filter = ('rating', 'timestamp')
    search_fields = ('user__username', 'feedback_text', 'session_journey__journey__name')
    readonly_fields = ('timestamp',)


@admin.register(EmotionalAnalytics)
class EmotionalAnalyticsAdmin(admin.ModelAdmin):
    list_display = ('journey', 'time_period', 'usage_count', 'average_rating', 'generated_at')
    list_filter = ('time_period', 'generated_at')
    search_fields = ('journey__name',)
    readonly_fields = ('generated_at',)
    fieldsets = (
        (None, {
            'fields': ('journey', 'time_period')
        }),
        (_('Analytics Data'), {
            'fields': ('usage_count', 'average_rating', 'emotional_impact_data', 'user_demographics')
        }),
        (_('Timestamp'), {
            'fields': ('generated_at',),
            'classes': ('collapse',)
        })
    ) 
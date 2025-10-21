from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import (
    DJPersona,
    PersonaSession,
    PersonaInteraction,
    PersonaPreference,
    PersonaAdaptation,
    PersonaAnalytics,
    PersonaBlend,
    PersonaBlendComponent,
    PersonaPreset
)


@admin.register(DJPersona)
class DJPersonaAdmin(admin.ModelAdmin):
    """
    Admin interface for managing DJ personas.
    """
    list_display = ('id', 'name', 'is_active', 'created_at', 'updated_at')
    list_filter = ('is_active', 'created_at', 'updated_at')
    search_fields = ('name', 'description')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ['name']
    fieldsets = (
        (None, {
            'fields': ('name', 'description', 'is_active')
        }),
        (_('Personality & Style'), {
            'fields': ('personality_traits', 'music_preferences', 'mixing_style', 'interaction_style')
        }),
        (_('Voice & Expertise'), {
            'fields': ('voice_characteristics', 'expertise_areas')
        }),
        (_('Learning'), {
            'fields': ('learning_parameters',)
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )


@admin.register(PersonaSession)
class PersonaSessionAdmin(admin.ModelAdmin):
    """
    Admin interface for managing persona sessions.
    """
    list_display = ('id', 'session', 'persona', 'start_time', 'end_time')
    list_filter = ('start_time', 'end_time')
    search_fields = ('session__id', 'persona__name')
    readonly_fields = ('start_time',)
    ordering = ['-start_time']
    fieldsets = (
        (None, {
            'fields': ('session', 'persona', 'start_time', 'end_time')
        }),
        (_('Performance & Feedback'), {
            'fields': ('performance_metrics', 'user_feedback')
        }),
        (_('Context & History'), {
            'fields': ('session_context', 'interaction_log', 'adaptation_history')
        })
    )


@admin.register(PersonaInteraction)
class PersonaInteractionAdmin(admin.ModelAdmin):
    """
    Admin interface for managing persona interactions.
    """
    list_display = ('id', 'persona_session', 'interaction_type', 'sentiment_score', 'response_time', 'success_rating', 'timestamp')
    list_filter = ('interaction_type', 'timestamp', 'success_rating')
    search_fields = ('content', 'user_response', 'persona_session__persona__name')
    readonly_fields = ('timestamp',)
    ordering = ['-timestamp']
    fieldsets = (
        (None, {
            'fields': ('persona_session', 'interaction_type', 'content')
        }),
        (_('User Response'), {
            'fields': ('user_response', 'sentiment_score')
        }),
        (_('Performance'), {
            'fields': ('response_time', 'success_rating')
        }),
        (_('Additional Data'), {
            'fields': ('context', 'interaction_metadata')
        })
    )


@admin.register(PersonaPreference)
class PersonaPreferenceAdmin(admin.ModelAdmin):
    """
    Admin interface for managing persona preferences.
    """
    list_display = ('id', 'user', 'persona', 'preference_score', 'is_favorite', 'last_used')
    list_filter = ('is_favorite', 'last_used')
    search_fields = ('user__username', 'persona__name')
    readonly_fields = ('last_used',)
    ordering = ['-preference_score']
    fieldsets = (
        (None, {
            'fields': ('user', 'persona', 'preference_score', 'is_favorite', 'last_used')
        }),
        (_('Preferences'), {
            'fields': ('custom_settings', 'preferred_interaction_modes', 'context_specific_preferences')
        }),
        (_('History'), {
            'fields': ('interaction_history', 'feedback_history')
        })
    )


@admin.register(PersonaAdaptation)
class PersonaAdaptationAdmin(admin.ModelAdmin):
    """
    Admin interface for managing persona adaptations.
    """
    list_display = ('id', 'persona', 'user', 'effectiveness_score', 'learning_rate', 'is_active', 'updated_at')
    list_filter = ('is_active', 'created_at', 'updated_at')
    search_fields = ('persona__name', 'user__username')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ['-updated_at']
    fieldsets = (
        (None, {
            'fields': ('persona', 'user', 'is_active')
        }),
        (_('Learning'), {
            'fields': ('learning_rate', 'effectiveness_score', 'adaptation_data')
        }),
        (_('History & Context'), {
            'fields': ('adaptation_history', 'context_adaptations')
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )


@admin.register(PersonaAnalytics)
class PersonaAnalyticsAdmin(admin.ModelAdmin):
    """
    Admin interface for managing persona analytics.
    """
    list_display = ('id', 'persona', 'time_period', 'user_satisfaction', 'generated_at')
    list_filter = ('time_period', 'generated_at')
    search_fields = ('persona__name',)
    readonly_fields = ('generated_at',)
    ordering = ['-generated_at']
    fieldsets = (
        (None, {
            'fields': ('persona', 'time_period')
        }),
        (_('Basic Metrics'), {
            'fields': ('usage_stats', 'performance_metrics', 'user_satisfaction')
        }),
        (_('Advanced Analytics'), {
            'fields': ('interaction_patterns', 'adaptation_effectiveness', 'demographic_insights')
        }),
        (_('Timestamp'), {
            'fields': ('generated_at',),
            'classes': ('collapse',)
        })
    )


@admin.register(PersonaBlend)
class PersonaBlendAdmin(admin.ModelAdmin):
    """
    Admin interface for managing persona blends.
    """
    list_display = ('id', 'session', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('session__id',)
    readonly_fields = ('created_at',)
    ordering = ['-created_at']
    fieldsets = (
        (None, {
            'fields': ('session', 'is_active')
        }),
        (_('Blend Configuration'), {
            'fields': ('blend_parameters', 'effectiveness_metrics')
        }),
        (_('Timestamp'), {
            'fields': ('created_at',),
            'classes': ('collapse',)
        })
    )


@admin.register(PersonaBlendComponent)
class PersonaBlendComponentAdmin(admin.ModelAdmin):
    """
    Admin interface for managing persona blend components.
    """
    list_display = ('id', 'blend', 'persona', 'weight', 'role')
    list_filter = ('blend', 'persona', 'role')
    search_fields = ('blend__id', 'persona__name', 'role')
    ordering = ['blend', 'persona']
    fieldsets = (
        (None, {
            'fields': ('blend', 'persona')
        }),
        (_('Component Configuration'), {
            'fields': ('weight', 'role', 'adaptation_parameters')
        })
    )


@admin.register(PersonaPreset)
class PersonaPresetAdmin(admin.ModelAdmin):
    """
    Admin interface for managing persona presets.
    """
    list_display = ('id', 'name', 'category', 'persona', 'is_public', 'created_at')
    list_filter = ('category', 'is_public', 'created_at')
    search_fields = ('name', 'description', 'persona__name')
    readonly_fields = ('created_at',)
    ordering = ['category', 'name']
    fieldsets = (
        (None, {
            'fields': ('name', 'description', 'category', 'persona', 'is_public')
        }),
        (_('Configuration'), {
            'fields': ('settings', 'usage_context', 'compatibility_data')
        }),
        (_('Timestamp'), {
            'fields': ('created_at',),
            'classes': ('collapse',)
        })
    ) 
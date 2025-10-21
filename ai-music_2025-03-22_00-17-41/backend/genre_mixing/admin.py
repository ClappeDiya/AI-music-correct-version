# admin.py for genre_mixing
# This file defines how the models are displayed and managed in the Django admin interface.

from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import (
    Genre,
    MixingSession,
    MixingSessionGenre,
    MixingSessionParams,
    MixingOutput,
    TrackReference
)
from user_management.models import User


@admin.register(Genre)
class GenreAdmin(admin.ModelAdmin):
    """
    Admin class for the Genre model.
    Defines how Genre objects are displayed and managed in the Django admin interface.
    """
    list_display = ('genre_name', 'created_by', 'created_at', 'updated_at')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('genre_name', 'description', 'created_by__username')
    readonly_fields = ('created_at', 'updated_at')

    def get_queryset(self, request):
        """
        Override get_queryset to filter by user permissions.
        """
        qs = super().get_queryset(request)
        if not request.user.is_superuser:
            return qs.filter(created_by=request.user)
        return qs


@admin.register(MixingSession)
class MixingSessionAdmin(admin.ModelAdmin):
    """
    Admin class for the MixingSession model.
    """
    list_display = ('id', 'user', 'session_name', 'status', 'created_at', 'updated_at')
    list_filter = ('status', 'created_at', 'updated_at')
    search_fields = ('session_name', 'user__username')
    autocomplete_fields = ['user']
    readonly_fields = ('created_at', 'updated_at')
    list_select_related = ['user']
    ordering = ['-created_at']

    def get_queryset(self, request):
        """
        Override get_queryset to filter by user access.
        """
        qs = super().get_queryset(request)
        if not request.user.is_superuser:
            return qs.filter(user=request.user)
        return qs


@admin.register(MixingSessionGenre)
class MixingSessionGenreAdmin(admin.ModelAdmin):
    """
    Admin class for the MixingSessionGenre model.
    """
    list_display = ('session', 'genre', 'weight')
    list_filter = ('genre',)
    search_fields = ('session__session_name', 'genre__genre_name')
    autocomplete_fields = ['session', 'genre']
    ordering = ['session', 'genre']

    def get_queryset(self, request):
        """
        Override get_queryset to filter by user access.
        """
        qs = super().get_queryset(request)
        if not request.user.is_superuser:
            return qs.filter(session__user=request.user)
        return qs


@admin.register(MixingSessionParams)
class MixingSessionParamsAdmin(admin.ModelAdmin):
    """
    Admin class for the MixingSessionParams model.
    """
    list_display = ('id', 'session', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('session__session_name',)
    autocomplete_fields = ['session']
    readonly_fields = ('created_at',)
    ordering = ['-created_at']

    def get_queryset(self, request):
        """
        Override get_queryset to filter by user access.
        """
        qs = super().get_queryset(request)
        if not request.user.is_superuser:
            return qs.filter(session__user=request.user)
        return qs


@admin.register(MixingOutput)
class MixingOutputAdmin(admin.ModelAdmin):
    """
    Admin class for the MixingOutput model.
    """
    list_display = ('id', 'session', 'created_at', 'finalization_timestamp')
    list_filter = ('created_at', 'finalization_timestamp')
    search_fields = ('session__session_name', 'audio_file_url')
    autocomplete_fields = ['session']
    readonly_fields = ('created_at', 'finalization_timestamp')
    ordering = ['-created_at']

    def get_queryset(self, request):
        """
        Override get_queryset to filter by user access.
        """
        qs = super().get_queryset(request)
        if not request.user.is_superuser:
            return qs.filter(session__user=request.user)
        return qs


@admin.register(TrackReference)
class TrackReferenceAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'artist', 'created_by', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('title', 'artist', 'created_by__username')
    readonly_fields = ('created_at',)

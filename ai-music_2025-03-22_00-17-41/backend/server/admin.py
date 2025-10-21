from django.contrib import admin
from .models import Recommendation, DynamicPreference, ThemePreference

@admin.register(Recommendation)
class RecommendationAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'target_user', 'score', 'created_at')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('user__username', 'target_user__username')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(DynamicPreference)
class DynamicPreferenceAdmin(admin.ModelAdmin):
    list_display = ('user', 'preferences')
    search_fields = ('user__username',)
    readonly_fields = ('user',)

@admin.register(ThemePreference)
class ThemePreferenceAdmin(admin.ModelAdmin):
    list_display = ('user', 'theme', 'updated_at')
    list_filter = ('theme', 'updated_at')
    search_fields = ('user__username',)
    readonly_fields = ('user', 'updated_at')
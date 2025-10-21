# admin.py for accessibility_localization
# This file defines the admin interface for the accessibility_localization app,
# allowing administrators to manage languages, locales, user accessibility settings,
# translations, and other related data.

from django.contrib import admin
from .models import (
    Language,
    Locale,
    UserAccessibilitySettings,
    Translation,
    LocalizedFormat,
    GenreLocalization,
    UserGenrePreferences,
    AdvancedAdaptationSettings,
    SignLanguageAsset,
    BrailleHapticProfile,
    VoiceSynthesisProfile,
    CulturalNuance,
    AccessibilityUsageLog,
    AccessibilityRecommendation,
    ScriptLayoutRule,
)

@admin.register(Language)
class LanguageAdmin(admin.ModelAdmin):
    """
    Admin interface for the Language model.
    Allows administrators to manage languages.
    """
    list_display = ('id', 'language_code', 'language_name', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('language_code', 'language_name')
    readonly_fields = ('created_at',)


@admin.register(Locale)
class LocaleAdmin(admin.ModelAdmin):
    """
    Admin interface for the Locale model.
    Allows administrators to manage locales.
    """
    list_display = ('id', 'language', 'region_code', 'date_format', 'currency_symbol', 'created_at')
    list_filter = ('language', 'region_code', 'created_at')
    search_fields = ('language__language_name', 'region_code')
    readonly_fields = ('created_at',)


@admin.register(UserAccessibilitySettings)
class UserAccessibilitySettingsAdmin(admin.ModelAdmin):
    """
    Admin interface for the UserAccessibilitySettings model.
    Allows administrators to manage user accessibility settings.
    """
    list_display = ('id', 'user', 'updated_at')
    list_filter = ('updated_at',)
    search_fields = ('user__username',)
    readonly_fields = ('updated_at',)


@admin.register(Translation)
class TranslationAdmin(admin.ModelAdmin):
    """
    Admin interface for the Translation model.
    Allows administrators to manage translations.
    """
    list_display = ('id', 'key', 'language', 'updated_at')
    list_filter = ('language', 'updated_at')
    search_fields = ('key', 'translated_text', 'language__language_name')
    readonly_fields = ('updated_at',)


@admin.register(LocalizedFormat)
class LocalizedFormatAdmin(admin.ModelAdmin):
    """
    Admin interface for the LocalizedFormat model.
    Allows administrators to manage localized formats.
    """
    list_display = ('id', 'user', 'locale', 'updated_at')
    list_filter = ('locale', 'updated_at')
    search_fields = ('user__username', 'locale__language__language_name')
    readonly_fields = ('updated_at',)


@admin.register(GenreLocalization)
class GenreLocalizationAdmin(admin.ModelAdmin):
    """
    Admin interface for the GenreLocalization model.
    Allows administrators to manage genre localizations.
    """
    list_display = ('id', 'genre_id', 'language', 'localized_name', 'is_default', 'fallback_order', 'updated_at')
    list_filter = ('language', 'is_default', 'updated_at')
    search_fields = ('genre_id', 'localized_name', 'language__language_name')
    readonly_fields = ('updated_at',)
    ordering = ('language', 'fallback_order')


@admin.register(UserGenrePreferences)
class UserGenrePreferencesAdmin(admin.ModelAdmin):
    """
    Admin interface for the UserGenrePreferences model.
    Allows administrators to manage user genre preferences.
    """
    list_display = ('id', 'user', 'genre_id', 'is_shared', 'shared_by', 'updated_at')
    list_filter = ('is_shared', 'updated_at')
    search_fields = ('user__username', 'genre_id', 'preferred_name')
    readonly_fields = ('updated_at',)


@admin.register(AdvancedAdaptationSettings)
class AdvancedAdaptationSettingsAdmin(admin.ModelAdmin):
    """
    Admin interface for the AdvancedAdaptationSettings model.
    Allows administrators to manage advanced adaptation settings.
    """
    list_display = ('id', 'updated_at')
    list_filter = ('updated_at',)
    readonly_fields = ('updated_at',)


@admin.register(SignLanguageAsset)
class SignLanguageAssetAdmin(admin.ModelAdmin):
    """
    Admin interface for the SignLanguageAsset model.
    Allows administrators to manage sign language assets.
    """
    list_display = ('id', 'translation_key', 'language', 'asset_url', 'updated_at')
    list_filter = ('language', 'updated_at')
    search_fields = ('translation_key', 'asset_url')
    readonly_fields = ('updated_at',)


@admin.register(BrailleHapticProfile)
class BrailleHapticProfileAdmin(admin.ModelAdmin):
    """
    Admin interface for the BrailleHapticProfile model.
    Allows administrators to manage braille/haptic profiles.
    """
    list_display = ('id', 'user', 'updated_at')
    list_filter = ('updated_at',)
    search_fields = ('user__username',)
    readonly_fields = ('updated_at',)


@admin.register(VoiceSynthesisProfile)
class VoiceSynthesisProfileAdmin(admin.ModelAdmin):
    """
    Admin interface for the VoiceSynthesisProfile model.
    Allows administrators to manage voice synthesis profiles.
    """
    list_display = ('id', 'user', 'updated_at')
    list_filter = ('updated_at',)
    search_fields = ('user__username',)
    readonly_fields = ('updated_at',)


@admin.register(CulturalNuance)
class CulturalNuanceAdmin(admin.ModelAdmin):
    """
    Admin interface for the CulturalNuance model.
    Allows administrators to manage cultural nuances.
    """
    list_display = ('id', 'language', 'key', 'updated_at')
    list_filter = ('language', 'updated_at')
    search_fields = ('key', 'language__language_name')
    readonly_fields = ('updated_at',)


@admin.register(AccessibilityUsageLog)
class AccessibilityUsageLogAdmin(admin.ModelAdmin):
    """
    Admin interface for the AccessibilityUsageLog model.
    Allows administrators to manage accessibility usage logs.
    """
    list_display = ('id', 'user', 'action_type', 'occurred_at')
    list_filter = ('action_type', 'occurred_at')
    search_fields = ('user__username', 'action_type')
    readonly_fields = ('occurred_at',)


@admin.register(AccessibilityRecommendation)
class AccessibilityRecommendationAdmin(admin.ModelAdmin):
    """
    Admin interface for the AccessibilityRecommendation model.
    Allows administrators to manage accessibility recommendations.
    """
    list_display = ('id', 'user', 'generated_at')
    list_filter = ('generated_at',)
    search_fields = ('user__username',)
    readonly_fields = ('generated_at',)


@admin.register(ScriptLayoutRule)
class ScriptLayoutRuleAdmin(admin.ModelAdmin):
    """
    Admin interface for the ScriptLayoutRule model.
    Allows administrators to manage script layout rules.
    """
    list_display = ('id', 'language', 'updated_at')
    list_filter = ('language', 'updated_at')
    search_fields = ('language__language_name',)
    readonly_fields = ('updated_at',)

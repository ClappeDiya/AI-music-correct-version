# urls.py for accessibility_localization
# This file defines the URL patterns for the accessibility_localization app,
# including routes for languages, locales, user accessibility settings,
# translations, and other related data.

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'accessibility_localization'

router = DefaultRouter()

router.register(r'languages', views.LanguageViewSet, basename='language')
router.register(r'locales', views.LocaleViewSet, basename='locale')
router.register(r'user-accessibility-settings', views.UserAccessibilitySettingsViewSet, basename='user-accessibility-settings')
router.register(r'translations', views.TranslationViewSet, basename='translation')
router.register(r'localized-formats', views.LocalizedFormatViewSet, basename='localized-format')
router.register(r'genre-localizations', views.GenreLocalizationViewSet, basename='genre-localization')
router.register(r'user-genre-preferences', views.UserGenrePreferencesViewSet, basename='user-genre-preference')

# Add custom endpoints for genre localization
urlpatterns = [
    path('', include(router.urls)),
    path(
        'genre-localizations/get-localized-genre/',
        views.GenreLocalizationViewSet.as_view({'get': 'get_localized_genre'}),
        name='get-localized-genre'
    ),
]
router.register(r'advanced-adaptation-settings', views.AdvancedAdaptationSettingsViewSet, basename='advanced-adaptation-settings')
router.register(r'sign-language-assets', views.SignLanguageAssetViewSet, basename='sign-language-asset')
router.register(r'braille-haptic-profiles', views.BrailleHapticProfileViewSet, basename='braille-haptic-profile')
router.register(r'voice-synthesis-profiles', views.VoiceSynthesisProfileViewSet, basename='voice-synthesis-profile')
router.register(r'cultural-nuances', views.CulturalNuanceViewSet, basename='cultural-nuance')
router.register(r'accessibility-usage-logs', views.AccessibilityUsageLogViewSet, basename='accessibility-usage-log')
router.register(r'accessibility-recommendations', views.AccessibilityRecommendationViewSet, basename='accessibility-recommendation')
router.register(r'script-layout-rules', views.ScriptLayoutRuleViewSet, basename='script-layout-rule')


urlpatterns = [
    path('', include(router.urls)),
]

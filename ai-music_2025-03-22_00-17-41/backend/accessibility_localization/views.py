# views.py for accessibility_localization
# This file contains the viewsets for the accessibility_localization app,
# providing API endpoints for managing languages, locales, user accessibility settings,
# translations, and other related data.

from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters import rest_framework as filters
from .mixins import SRLMixin
from django.db.models import Q
from .models import (
    Language,
    Locale,
    UserAccessibilitySettings,
    Translation,
    LocalizedFormat,
    GenreLocalization,
    AdvancedAdaptationSettings,
    SignLanguageAsset,
    BrailleHapticProfile,
    VoiceSynthesisProfile,
    CulturalNuance,
    AccessibilityUsageLog,
    AccessibilityRecommendation,
    ScriptLayoutRule,
    UserGenrePreferences,
)
from .serializers import (
    LanguageSerializer,
    LocaleSerializer,
    UserAccessibilitySettingsSerializer,
    TranslationSerializer,
    LocalizedFormatSerializer,
    GenreLocalizationSerializer,
    AdvancedAdaptationSettingsSerializer,
    SignLanguageAssetSerializer,
    BrailleHapticProfileSerializer,
    VoiceSynthesisProfileSerializer,
    CulturalNuanceSerializer,
    AccessibilityUsageLogSerializer,
    AccessibilityRecommendationSerializer,
    ScriptLayoutRuleSerializer,
)


class BaseSRLViewSet(SRLMixin, viewsets.ModelViewSet):
    """
    Base viewset that provides SRL-based access control and basic CRUD operations.
    """
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.DjangoFilterBackend]


class LanguageViewSet(BaseSRLViewSet):
    """ViewSet for managing languages with role-based access."""
    queryset = Language.objects.all()
    serializer_class = LanguageSerializer
    search_fields = ['language_code', 'language_name']
    filterset_fields = ['language_code']
    
    def get_permissions(self):
        """Only staff can modify languages"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]


class LocaleViewSet(BaseSRLViewSet):
    """ViewSet for managing locales with role-based access."""
    queryset = Locale.objects.all()
    serializer_class = LocaleSerializer
    search_fields = ['region_code', 'date_format']
    filterset_fields = ['language_id', 'region_code']
    
    def get_permissions(self):
        """Only staff can modify locales"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]


class UserAccessibilitySettingsViewSet(BaseSRLViewSet):
    """ViewSet for managing user-specific accessibility settings."""
    queryset = UserAccessibilitySettings.objects.all()
    serializer_class = UserAccessibilitySettingsSerializer
    filterset_fields = ['user_id']

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class TranslationViewSet(BaseSRLViewSet):
    """
    ViewSet for the Translation model.
    Provides API endpoints for managing translations.
    """
    queryset = Translation.objects.all()
    serializer_class = TranslationSerializer
    search_fields = ['key', 'translated_text']
    filterset_fields = ['language_id', 'key']


class LocalizedFormatViewSet(BaseSRLViewSet):
    """
    ViewSet for the LocalizedFormat model.
    Provides API endpoints for managing localized formats.
    """
    queryset = LocalizedFormat.objects.all()
    serializer_class = LocalizedFormatSerializer
    filterset_fields = ['user_id', 'locale_id']


class UserGenrePreferencesViewSet(BaseSRLViewSet):
    """
    ViewSet for the UserGenrePreferences model.
    Provides API endpoints for managing user-specific genre preferences.
    """
    queryset = UserGenrePreferences.objects.all()
    serializer_class = UserGenrePreferencesSerializer
    search_fields = ['preferred_name', 'preferred_description']
    filterset_fields = ['user_id', 'genre_id', 'is_shared']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        
        # Show user's own preferences and shared preferences
        return queryset.filter(
            Q(user=user) |
            Q(is_shared=True)
        ).order_by('genre_id')


class GenreLocalizationViewSet(BaseSRLViewSet):
    """ViewSet for managing genre localizations with role-based access."""
    queryset = GenreLocalization.objects.all()
    serializer_class = GenreLocalizationSerializer
    search_fields = ['localized_name', 'localized_description']
    filterset_fields = ['genre_id', 'language_id', 'is_default']
    
    def get_permissions(self):
        """Only staff can modify genre localizations"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]

    @action(detail=False, methods=['get'])
    def get_localized_genre(self, request):
        """Get localized genre with user preferences."""
        genre_id = request.query_params.get('genre_id')
        if genre_id:
            try:
                genre_id = int(genre_id)
            except ValueError:
                return Response(
                    {'error': 'Invalid genre_id format'},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        language_code = request.query_params.get('language')
        
        if not genre_id or not language_code:
            return Response(
                {'error': 'Both genre_id and language parameters are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            # Get user's preference first
            user_pref = UserGenrePreferences.objects.filter(
                user=request.user,
                genre_id=genre_id
            ).first()
            
            if user_pref and user_pref.preferred_name:
                return Response({
                    'localized_name': user_pref.preferred_name,
                    'localized_description': user_pref.preferred_description,
                    'source': 'user_preference'
                })
                
            # Then try language-specific translation
            translations = self.get_queryset().filter(
                genre_id=genre_id,
                language__language_code=language_code
            ).order_by('fallback_order')
            
            if translations.exists():
                return Response({
                    'localized_name': translations[0].localized_name,
                    'localized_description': translations[0].localized_description,
                    'source': 'translation'
                })
                
            # Finally, try default English translation
            default_translation = self.get_queryset().filter(
                genre_id=genre_id,
                language__language_code='en',
                is_default=True
            ).first()
            
            if default_translation:
                return Response({
                    'localized_name': default_translation.localized_name,
                    'localized_description': default_translation.localized_description,
                    'source': 'default_fallback'
                })
                
            return Response(
                {'error': 'No localization found for this genre'},
                status=status.HTTP_404_NOT_FOUND
            )
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class AdvancedAdaptationSettingsViewSet(BaseSRLViewSet):
    """
    ViewSet for the AdvancedAdaptationSettings model.
    Provides API endpoints for managing advanced adaptation settings.
    """
    queryset = AdvancedAdaptationSettings.objects.all()
    serializer_class = AdvancedAdaptationSettingsSerializer


class SignLanguageAssetViewSet(BaseSRLViewSet):
    """
    ViewSet for the SignLanguageAsset model.
    Provides API endpoints for managing sign language assets.
    """
    queryset = SignLanguageAsset.objects.all()
    serializer_class = SignLanguageAssetSerializer
    search_fields = ['translation_key', 'asset_url']
    filterset_fields = ['language_id', 'translation_key']


class BrailleHapticProfileViewSet(BaseSRLViewSet):
    """
    ViewSet for the BrailleHapticProfile model.
    Provides API endpoints for managing braille/haptic profiles.
    """
    queryset = BrailleHapticProfile.objects.all()
    serializer_class = BrailleHapticProfileSerializer
    filterset_fields = ['user_id']


class VoiceSynthesisProfileViewSet(BaseSRLViewSet):
    """
    ViewSet for the VoiceSynthesisProfile model.
    Provides API endpoints for managing voice synthesis profiles.
    """
    queryset = VoiceSynthesisProfile.objects.all()
    serializer_class = VoiceSynthesisProfileSerializer
    filterset_fields = ['user_id']


class CulturalNuanceViewSet(BaseSRLViewSet):
    """
    ViewSet for the CulturalNuance model.
    Provides API endpoints for managing cultural nuances.
    """
    queryset = CulturalNuance.objects.all()
    serializer_class = CulturalNuanceSerializer
    search_fields = ['key', 'nuance_data']
    filterset_fields = ['language_id', 'key']


class AccessibilityUsageLogViewSet(BaseSRLViewSet):
    """
    ViewSet for the AccessibilityUsageLog model.
    Provides API endpoints for managing accessibility usage logs.
    """
    queryset = AccessibilityUsageLog.objects.all()
    serializer_class = AccessibilityUsageLogSerializer
    filterset_fields = ['user_id', 'action_type']


class AccessibilityRecommendationViewSet(BaseSRLViewSet):
    """
    ViewSet for the AccessibilityRecommendation model.
    Provides API endpoints for managing accessibility recommendations.
    """
    queryset = AccessibilityRecommendation.objects.all()
    serializer_class = AccessibilityRecommendationSerializer
    filterset_fields = ['user_id']


class ScriptLayoutRuleViewSet(BaseSRLViewSet):
    """
    ViewSet for the ScriptLayoutRule model.
    Provides API endpoints for managing script layout rules.
    """
    queryset = ScriptLayoutRule.objects.all()
    serializer_class = ScriptLayoutRuleSerializer
    filterset_fields = ['language_id']

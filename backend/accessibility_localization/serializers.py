from rest_framework import serializers
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
)


class LanguageSerializer(serializers.ModelSerializer):
    """Serializer for Language model."""
    class Meta:
        model = Language
        fields = ['id', 'language_code', 'language_name', 'created_at']
        read_only_fields = ['id', 'created_at']


class LocaleSerializer(serializers.ModelSerializer):
    """
    Serializer for the Locale model.
    Handles serialization and deserialization of Locale objects.
    Includes a nested serializer for the related Language model.
    """
    language = LanguageSerializer(read_only=True)
    language_id = serializers.PrimaryKeyRelatedField(
        queryset=Language.objects.all(), source='language', write_only=True, required=True
    )

    class Meta:
        model = Locale
        fields = ['id', 'language', 'language_id', 'region_code', 'date_format', 'currency_symbol', 'numeric_format', 'created_at']
        read_only_fields = ['id', 'created_at']


class UserAccessibilitySettingsSerializer(serializers.ModelSerializer):
    """
    Serializer for the UserAccessibilitySettings model.
    Handles serialization and deserialization of UserAccessibilitySettings objects.
    """
    user_id = serializers.IntegerField(source='user.id', read_only=True)

    class Meta:
        model = UserAccessibilitySettings
        fields = ['id', 'user_id', 'settings', 'updated_at']
        read_only_fields = ['id', 'updated_at', 'user_id']


class TranslationSerializer(serializers.ModelSerializer):
    """
    Serializer for the Translation model.
    Handles serialization and deserialization of Translation objects.
    Includes a nested serializer for the related Language model.
    """
    language = LanguageSerializer(read_only=True)
    language_id = serializers.PrimaryKeyRelatedField(
        queryset=Language.objects.all(), source='language', write_only=True, required=True
    )

    class Meta:
        model = Translation
        fields = ['id', 'key', 'language', 'language_id', 'translated_text', 'updated_at']
        read_only_fields = ['id', 'updated_at']


class LocalizedFormatSerializer(serializers.ModelSerializer):
    """
    Serializer for the LocalizedFormat model.
    Handles serialization and deserialization of LocalizedFormat objects.
    Includes nested serializers for the related User and Locale models.
    """
    user_id = serializers.IntegerField(source='user.id', read_only=True, allow_null=True)
    locale = LocaleSerializer(read_only=True)
    locale_id = serializers.PrimaryKeyRelatedField(
        queryset=Locale.objects.all(), source='locale', write_only=True, required=True
    )

    class Meta:
        model = LocalizedFormat
        fields = ['id', 'user_id', 'locale', 'locale_id', 'override_formats', 'updated_at']
        read_only_fields = ['id', 'updated_at']


class GenreLocalizationSerializer(serializers.ModelSerializer):
    """
    Serializer for the GenreLocalization model.
    Handles serialization and deserialization of GenreLocalization objects.
    Includes a nested serializer for the related Language model.
    """
    language = LanguageSerializer(read_only=True)
    language_id = serializers.PrimaryKeyRelatedField(
        queryset=Language.objects.all(), source='language', write_only=True, required=True
    )

    class Meta:
        model = GenreLocalization
        fields = [
            'id', 'genre_id', 'language', 'language_id',
            'localized_name', 'localized_description',
            'is_default', 'fallback_order', 'updated_at'
        ]
        read_only_fields = ['id', 'updated_at']
        extra_kwargs = {
            'fallback_order': {'min_value': 0},
            'is_default': {'default': False}
        }

class UserGenrePreferencesSerializer(serializers.ModelSerializer):
    """
    Serializer for the UserGenrePreferences model.
    Handles serialization and deserialization of user-specific genre preferences.
    """
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    shared_by_id = serializers.IntegerField(source='shared_by.id', read_only=True, allow_null=True)

    class Meta:
        model = UserGenrePreferences
        fields = [
            'id', 'user_id', 'genre_id', 'preferred_name',
            'preferred_description', 'is_shared', 'shared_by_id',
            'updated_at'
        ]
        read_only_fields = ['id', 'updated_at', 'user_id', 'shared_by_id']
        extra_kwargs = {
            'genre_id': {'required': True},
            'is_shared': {'default': False}
        }

    def validate(self, data):
        if data.get('is_shared') and not self.context.get('request').user.is_staff:
            raise serializers.ValidationError("Only staff members can share preferences")
        return data


class AdvancedAdaptationSettingsSerializer(serializers.ModelSerializer):
    """
    Serializer for the AdvancedAdaptationSettings model.
    Handles serialization and deserialization of AdvancedAdaptationSettings objects.
    """
    class Meta:
        model = AdvancedAdaptationSettings
        fields = ['id', 'adaptation_rules', 'updated_at']
        read_only_fields = ['id', 'updated_at']


class SignLanguageAssetSerializer(serializers.ModelSerializer):
    """
    Serializer for the SignLanguageAsset model.
    Handles serialization and deserialization of SignLanguageAsset objects.
    Includes a nested serializer for the related Language model.
    """
    language = LanguageSerializer(read_only=True)
    language_id = serializers.PrimaryKeyRelatedField(
        queryset=Language.objects.all(), source='language', write_only=True, required=True
    )

    class Meta:
        model = SignLanguageAsset
        fields = ['id', 'translation_key', 'asset_url', 'language', 'language_id', 'updated_at']
        read_only_fields = ['id', 'updated_at']


class BrailleHapticProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for the BrailleHapticProfile model.
    Handles serialization and deserialization of BrailleHapticProfile objects.
    """
    user_id = serializers.IntegerField(source='user.id', read_only=True, allow_null=True)

    class Meta:
        model = BrailleHapticProfile
        fields = ['id', 'user_id', 'profile_data', 'updated_at']
        read_only_fields = ['id', 'updated_at', 'user_id']


class VoiceSynthesisProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for the VoiceSynthesisProfile model.
    Handles serialization and deserialization of VoiceSynthesisProfile objects.
    """
    user_id = serializers.IntegerField(source='user.id', read_only=True, allow_null=True)

    class Meta:
        model = VoiceSynthesisProfile
        fields = ['id', 'user_id', 'synthesis_params', 'updated_at']
        read_only_fields = ['id', 'updated_at', 'user_id']


class CulturalNuanceSerializer(serializers.ModelSerializer):
    """
    Serializer for the CulturalNuance model.
    Handles serialization and deserialization of CulturalNuance objects.
    Includes a nested serializer for the related Language model.
    """
    language = LanguageSerializer(read_only=True)
    language_id = serializers.PrimaryKeyRelatedField(
        queryset=Language.objects.all(), source='language', write_only=True, required=True
    )

    class Meta:
        model = CulturalNuance
        fields = ['id', 'language', 'language_id', 'key', 'nuance_data', 'updated_at']
        read_only_fields = ['id', 'updated_at']


class AccessibilityUsageLogSerializer(serializers.ModelSerializer):
    """
    Serializer for the AccessibilityUsageLog model.
    Handles serialization and deserialization of AccessibilityUsageLog objects.
    """
    user_id = serializers.IntegerField(source='user.id', read_only=True, allow_null=True)

    class Meta:
        model = AccessibilityUsageLog
        fields = ['id', 'user_id', 'action_type', 'context', 'occurred_at']
        read_only_fields = ['id', 'occurred_at', 'user_id']


class AccessibilityRecommendationSerializer(serializers.ModelSerializer):
    """
    Serializer for the AccessibilityRecommendation model.
    Handles serialization and deserialization of AccessibilityRecommendation objects.
    """
    user_id = serializers.IntegerField(source='user.id', read_only=True, allow_null=True)

    class Meta:
        model = AccessibilityRecommendation
        fields = ['id', 'user_id', 'recommendation_data', 'generated_at']
        read_only_fields = ['id', 'generated_at', 'user_id']


class ScriptLayoutRuleSerializer(serializers.ModelSerializer):
    """
    Serializer for the ScriptLayoutRule model.
    Handles serialization and deserialization of ScriptLayoutRule objects.
    Includes a nested serializer for the related Language model.
    """
    language = LanguageSerializer(read_only=True)
    language_id = serializers.PrimaryKeyRelatedField(
        queryset=Language.objects.all(), source='language', write_only=True, required=True
    )

    class Meta:
        model = ScriptLayoutRule
        fields = ['id', 'language', 'language_id', 'layout_data', 'updated_at']
        read_only_fields = ['id', 'updated_at']

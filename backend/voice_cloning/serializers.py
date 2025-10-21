from rest_framework import serializers
from .models import (
    Language,
    Emotion,
    VoiceCloningSettings,
    VoiceRecordingSession,
    VoiceSample,
    VoiceModel,
    VoiceModelVersion,
    VoiceModelPermission,
    VoiceModelConsentScope,
    VoiceModelUsageLog,
    VoiceModelAdaptiveEvent,
    VoiceModelShare,
    VoiceAnalysis,
)
from user_management.serializers import UserSerializer  # Import the custom user serializer


class BaseUserSpecificSerializer(serializers.ModelSerializer):
    """
    Base serializer that implements user-specific validation.
    """
    def validate(self, data):
        request = self.context.get('request')
        if not request or not request.user:
            raise serializers.ValidationError("User context is required")
        return data


class LanguageSerializer(serializers.ModelSerializer):
    """
    Serializer for the Language model.
    """
    class Meta:
        model = Language
        fields = ['id', 'code', 'name', 'created_at']
        read_only_fields = ['id', 'created_at']


class EmotionSerializer(serializers.ModelSerializer):
    """
    Serializer for the Emotion model.
    """
    class Meta:
        model = Emotion
        fields = ['id', 'label', 'created_at']
        read_only_fields = ['id', 'created_at']


class VoiceCloningSettingsSerializer(serializers.ModelSerializer):
    """
    Serializer for the VoiceCloningSettings model.
    """
    class Meta:
        model = VoiceCloningSettings
        fields = ['id', 'setting_key', 'setting_value', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class VoiceRecordingSessionSerializer(BaseUserSpecificSerializer):
    """
    Serializer for the VoiceRecordingSession model.
    """
    user = UserSerializer(read_only=True)  # Use the custom user serializer
    class Meta:
        model = VoiceRecordingSession
        fields = ['id', 'user', 'session_name', 'instructions_shown', 'created_at', 'ended_at', 'language_code']
        read_only_fields = ['id', 'created_at']


class VoiceSampleSerializer(BaseUserSpecificSerializer):
    """
    Serializer for the VoiceSample model.
    """
    session = VoiceRecordingSessionSerializer(read_only=True)
    class Meta:
        model = VoiceSample
        fields = ['id', 'session', 'file_url', 'metadata', 'created_at', 'emotion_tags']
        read_only_fields = ['id', 'created_at']


# Forward declarations to break circular dependencies
class VoiceModelVersionSerializer(serializers.ModelSerializer):
    """
    Serializer for the VoiceModelVersion model.
    """
    class Meta:
        model = VoiceModelVersion
        fields = ['version_number', 'changes', 'created_at']


class VoiceModelShareSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(write_only=True)
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = VoiceModelShare
        fields = ['id', 'user', 'user_email', 'user_name', 'permission', 'created_at']
        read_only_fields = ['user']

    def get_user_name(self, obj):
        return obj.user.get_full_name() or obj.user.username


class VoiceModelSerializer(serializers.ModelSerializer):
    """
    Serializer for the VoiceModel model.
    """
    user = UserSerializer(read_only=True)
    versions = VoiceModelVersionSerializer(many=True, read_only=True)
    shares = VoiceModelShareSerializer(many=True, read_only=True)
    is_shared = serializers.SerializerMethodField()

    class Meta:
        model = VoiceModel
        fields = [
            'id', 'name', 'user', 'version', 'status', 'is_active',
            'is_encrypted', 'supported_languages', 'created_at',
            'updated_at', 'versions', 'shares', 'is_shared'
        ]
        read_only_fields = ['user', 'version']

    def get_is_shared(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.shares.filter(user=request.user).exists()
        return False


# Update VoiceModelVersionSerializer with a nested relationship to avoid circular reference
class VoiceModelVersionSerializerWithNested(serializers.ModelSerializer):
    """
    Serializer for the VoiceModelVersion model with nested relationship.
    """
    class Meta:
        model = VoiceModelVersion
        fields = ['version_number', 'changes', 'created_at']


class VoiceModelPermissionSerializer(serializers.ModelSerializer):
    """
    Serializer for the VoiceModelPermission model.
    """
    user = UserSerializer(read_only=True)
    voice_model = VoiceModelSerializer(read_only=True)
    class Meta:
        model = VoiceModelPermission
        fields = ['id', 'user', 'voice_model', 'consent_granted_at', 'consent_revoked_at', 'usage_scope']
        read_only_fields = ['id']


class VoiceModelConsentScopeSerializer(serializers.ModelSerializer):
    """
    Serializer for the VoiceModelConsentScope model.
    """
    voice_model = VoiceModelSerializer(read_only=True)
    class Meta:
        model = VoiceModelConsentScope
        fields = ['id', 'voice_model', 'scope_data', 'created_at']
        read_only_fields = ['id', 'created_at']


class VoiceModelUsageLogSerializer(serializers.ModelSerializer):
    """
    Serializer for the VoiceModelUsageLog model.
    """
    voice_model = VoiceModelSerializer(read_only=True)
    class Meta:
        model = VoiceModelUsageLog
        fields = ['id', 'voice_model', 'used_in_context', 'details', 'created_at']
        read_only_fields = ['id', 'created_at']


class VoiceModelAdaptiveEventSerializer(serializers.ModelSerializer):
    """
    Serializer for the VoiceModelAdaptiveEvent model.
    """
    voice_model = VoiceModelSerializer(read_only=True)
    class Meta:
        model = VoiceModelAdaptiveEvent
        fields = ['id', 'voice_model', 'event_type', 'event_details', 'triggered_by', 'created_at']
        read_only_fields = ['id', 'created_at']


class VoiceAnalysisSerializer(serializers.ModelSerializer):
    class Meta:
        model = VoiceAnalysis
        fields = [
            'id', 'status', 'progress_percentage', 'current_step',
            'estimated_time_remaining', 'results', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

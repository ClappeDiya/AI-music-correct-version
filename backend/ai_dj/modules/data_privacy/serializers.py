from rest_framework import serializers
from .models import (
    PrivacySettings,
    EphemeralVoiceData,
    EmotionalAnalysisLog,
    DataDeletionRequest
)


class PrivacySettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrivacySettings
        fields = [
            'id', 'user', 'store_voice_data',
            'store_emotional_data', 'data_retention_days',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class EphemeralVoiceDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = EphemeralVoiceData
        fields = [
            'id', 'user', 'file', 'voice_print_hash',
            'created_at', 'expiry_time', 'is_processed'
        ]
        read_only_fields = ['created_at', 'expiry_time', 'voice_print_hash']


class EmotionalAnalysisLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmotionalAnalysisLog
        fields = [
            'id', 'user', 'session_id', 'emotion_data',
            'created_at', 'expiry_time', 'is_anonymized'
        ]
        read_only_fields = ['created_at', 'expiry_time']


class DataDeletionRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = DataDeletionRequest
        fields = [
            'id', 'user', 'request_type', 'status',
            'created_at', 'completed_at'
        ]
        read_only_fields = ['created_at', 'completed_at', 'status']

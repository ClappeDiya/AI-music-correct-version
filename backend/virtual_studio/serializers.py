from rest_framework import serializers
from .models import (
    Instrument,
    Effect,
    StudioSession,
    Track,
    TrackInstrument,
    TrackEffect,
    InstrumentPreset,
    EffectPreset,
    SessionTemplate,
    ExportedFile,
    VrArSetting,
    AiSuggestion,
    AdaptiveAutomationEvent,
)
from django.contrib.auth.models import User


class InstrumentSerializer(serializers.ModelSerializer):
    """
    Serializer for the Instrument model.
    """
    created_by = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Instrument
        fields = ['id', 'name', 'instrument_type', 'base_parameters', 'created_at', 'updated_at', 'created_by', 'is_public']
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by']


class EffectSerializer(serializers.ModelSerializer):
    """
    Serializer for the Effect model.
    """
    created_by = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Effect
        fields = ['id', 'name', 'effect_type', 'base_parameters', 'created_at', 'updated_at', 'created_by', 'is_public']
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by']


class StudioSessionSerializer(serializers.ModelSerializer):
    """
    Serializer for the StudioSession model.
    """
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    collaborators = serializers.PrimaryKeyRelatedField(many=True, read_only=False, required=False, queryset=User.objects.all())

    class Meta:
        model = StudioSession
        fields = ['id', 'user', 'session_name', 'description', 'created_at', 'updated_at', 'collaborators', 'is_public']
        read_only_fields = ['id', 'created_at', 'updated_at', 'user']


class TrackSerializer(serializers.ModelSerializer):
    """
    Serializer for the Track model.
    """
    class Meta:
        model = Track
        fields = ['id', 'session', 'track_name', 'track_type', 'created_at', 'position']
        read_only_fields = ['id', 'created_at']


class TrackInstrumentSerializer(serializers.ModelSerializer):
    """
    Serializer for the TrackInstrument model.
    """
    created_by = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = TrackInstrument
        fields = ['id', 'track', 'instrument', 'parameters', 'created_at', 'created_by']
        read_only_fields = ['id', 'created_at', 'created_by']


class TrackEffectSerializer(serializers.ModelSerializer):
    """
    Serializer for the TrackEffect model.
    """
    created_by = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = TrackEffect
        fields = ['id', 'track', 'effect', 'parameters', 'created_at', 'created_by']
        read_only_fields = ['id', 'created_at', 'created_by']


class InstrumentPresetSerializer(serializers.ModelSerializer):
    """
    Serializer for the InstrumentPreset model.
    """
    user = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = InstrumentPreset
        fields = ['id', 'user', 'instrument', 'preset_name', 'preset_parameters', 'created_at', 'is_public']
        read_only_fields = ['id', 'created_at', 'user']


class EffectPresetSerializer(serializers.ModelSerializer):
    """
    Serializer for the EffectPreset model.
    """
    user = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = EffectPreset
        fields = ['id', 'user', 'effect', 'preset_name', 'preset_parameters', 'created_at', 'is_public']
        read_only_fields = ['id', 'created_at', 'user']


class SessionTemplateSerializer(serializers.ModelSerializer):
    """
    Serializer for the SessionTemplate model.
    """
    user = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = SessionTemplate
        fields = ['id', 'user', 'template_name', 'template_data', 'created_at', 'is_public']
        read_only_fields = ['id', 'created_at', 'user']


class ExportedFileSerializer(serializers.ModelSerializer):
    """
    Serializer for the ExportedFile model.
    """
    created_by = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = ExportedFile
        fields = ['id', 'session', 'file_url', 'format', 'spatial_audio', 'cryptographic_signature', 'created_at', 'created_by']
        read_only_fields = ['id', 'created_at', 'created_by']


class VrArSettingSerializer(serializers.ModelSerializer):
    """
    Serializer for the VrArSetting model.
    """
    created_by = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = VrArSetting
        fields = ['id', 'session', 'config', 'created_at', 'created_by']
        read_only_fields = ['id', 'created_at', 'created_by']


class AiSuggestionSerializer(serializers.ModelSerializer):
    """
    Serializer for the AiSuggestion model.
    """
    created_by = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = AiSuggestion
        fields = ['id', 'session', 'suggestion_type', 'suggestion_data', 'applied', 'created_at', 'created_by']
        read_only_fields = ['id', 'created_at', 'created_by']


class AdaptiveAutomationEventSerializer(serializers.ModelSerializer):
    """
    Serializer for the AdaptiveAutomationEvent model.
    """
    created_by = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = AdaptiveAutomationEvent
        fields = ['id', 'session', 'event_type', 'event_details', 'created_at', 'created_by']
        read_only_fields = ['id', 'created_at', 'created_by']

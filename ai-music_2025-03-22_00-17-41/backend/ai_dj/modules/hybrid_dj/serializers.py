from rest_framework import serializers
from .models import (
    HumanDJPreference,
    TransitionPreset,
    HumanDJAction,
    AIRecommendation
)
from ...serializers import TrackSerializer

class HumanDJPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = HumanDJPreference
        fields = [
            'id', 'user', 'preferred_bpm_range_min',
            'preferred_bpm_range_max', 'preferred_transition_length',
            'auto_suggestions_enabled', 'auto_transitions_enabled',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def validate(self, data):
        if data.get('preferred_bpm_range_min', 0) >= data.get('preferred_bpm_range_max', 0):
            raise serializers.ValidationError(
                "Minimum BPM must be less than maximum BPM"
            )
        return data

class TransitionPresetSerializer(serializers.ModelSerializer):
    effect_type_display = serializers.CharField(
        source='get_effect_type_display',
        read_only=True
    )

    class Meta:
        model = TransitionPreset
        fields = [
            'id', 'name', 'created_by', 'effect_type',
            'effect_type_display', 'duration', 'effect_parameters',
            'is_public', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def validate_effect_parameters(self, value):
        effect_type = self.initial_data.get('effect_type')
        required_params = {
            'filter': ['cutoff_start', 'cutoff_end', 'resonance'],
            'echo': ['feedback', 'delay_time'],
            'reverb': ['room_size', 'damping', 'wet_level'],
            'power_down': ['pitch_end', 'filter_cutoff'],
            'custom': ['effect_chain']
        }

        if effect_type in required_params:
            missing = [
                param for param in required_params[effect_type]
                if param not in value
            ]
            if missing:
                raise serializers.ValidationError(
                    f"Missing required parameters for {effect_type}: {', '.join(missing)}"
                )
        return value

class HumanDJActionSerializer(serializers.ModelSerializer):
    action_type_display = serializers.CharField(
        source='get_action_type_display',
        read_only=True
    )
    track_details = TrackSerializer(source='track', read_only=True)

    class Meta:
        model = HumanDJAction
        fields = [
            'id', 'session', 'user', 'action_type',
            'action_type_display', 'track', 'track_details',
            'parameters', 'created_at'
        ]
        read_only_fields = ['created_at']

    def validate_parameters(self, value):
        action_type = self.initial_data.get('action_type')
        required_params = {
            'transition_adjust': ['duration', 'effect_type'],
            'effect_adjust': ['effect_type', 'parameters'],
            'suggestion_reject': ['reason']
        }

        if action_type in required_params:
            missing = [
                param for param in required_params[action_type]
                if param not in value
            ]
            if missing:
                raise serializers.ValidationError(
                    f"Missing required parameters for {action_type}: {', '.join(missing)}"
                )
        return value

class AIRecommendationSerializer(serializers.ModelSerializer):
    recommendation_type_display = serializers.CharField(
        source='get_recommendation_type_display',
        read_only=True
    )
    current_track_details = TrackSerializer(
        source='current_track',
        read_only=True
    )
    suggested_track_details = TrackSerializer(
        source='suggested_track',
        read_only=True
    )

    class Meta:
        model = AIRecommendation
        fields = [
            'id', 'session', 'recommendation_type',
            'recommendation_type_display', 'current_track',
            'current_track_details', 'suggested_track',
            'suggested_track_details', 'confidence_score',
            'parameters', 'was_accepted', 'created_at'
        ]
        read_only_fields = ['created_at']

    def validate_confidence_score(self, value):
        if not 0 <= value <= 1:
            raise serializers.ValidationError(
                "Confidence score must be between 0 and 1"
            )
        return value

    def validate_parameters(self, value):
        rec_type = self.initial_data.get('recommendation_type')
        required_params = {
            'transition': ['duration', 'effect_type', 'parameters'],
            'effect': ['effect_type', 'parameters'],
            'energy_level': ['target_energy', 'transition_duration']
        }

        if rec_type in required_params:
            missing = [
                param for param in required_params[rec_type]
                if param not in value
            ]
            if missing:
                raise serializers.ValidationError(
                    f"Missing required parameters for {rec_type}: {', '.join(missing)}"
                )
        return value

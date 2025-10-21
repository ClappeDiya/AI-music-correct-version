from rest_framework import serializers
from .models import WearableDevice, BiometricData, BiometricPreference, GroupEmotionalState, EmotionalPreference

class WearableDeviceSerializer(serializers.ModelSerializer):
    class Meta:
        model = WearableDevice
        fields = ['device_id', 'name', 'type', 'status', 'last_connected', 'battery_level']

class BiometricDataSerializer(serializers.ModelSerializer):
    device_name = serializers.CharField(source='device.name', read_only=True)
    device_type = serializers.CharField(source='device.type', read_only=True)
    
    class Meta:
        model = BiometricData
        fields = [
            'id', 'device_name', 'device_type', 'timestamp',
            'heart_rate', 'stress_level', 'energy_level',
            'movement', 'mood'
        ]

class BiometricPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = BiometricPreference
        fields = [
            'target_heart_rate', 'target_energy_level',
            'stress_management', 'mood_matching'
        ]

class GroupEmotionalStateSerializer(serializers.ModelSerializer):
    class Meta:
        model = GroupEmotionalState
        fields = [
            'id', 'session', 'timestamp', 'median_heart_rate',
            'median_energy_level', 'median_stress_level',
            'dominant_emotion', 'emotion_distribution',
            'consensus_strength', 'participant_count'
        ]
        read_only_fields = ['id', 'timestamp']

class EmotionalPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmotionalPreference
        fields = [
            'id', 'user', 'session', 'emotion_weight',
            'prefer_emotional_sync', 'emotion_influence_radius'
        ]
        read_only_fields = ['id']

    def validate_emotion_weight(self, value):
        if not 0 <= value <= 2:
            raise serializers.ValidationError("Emotion weight must be between 0 and 2")
        return value

    def validate_emotion_influence_radius(self, value):
        if not 0 <= value <= 1:
            raise serializers.ValidationError("Emotion influence radius must be between 0 and 1")
        return value

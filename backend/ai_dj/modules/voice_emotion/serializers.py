from rest_framework import serializers
from .models import VoiceEmotionData, EmotionalMusicPreference, EmotionalPlaylistTemplate

class VoiceEmotionDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = VoiceEmotionData
        fields = [
            'id',
            'session',
            'timestamp',
            'emotion',
            'confidence',
            'pitch',
            'tempo',
            'energy',
            'valence',
        ]
        read_only_fields = ['timestamp']

class EmotionalMusicPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmotionalMusicPreference
        fields = [
            'id',
            'session',
            'prefer_mood_matching',
            'prefer_mood_improvement',
            'min_energy',
            'max_energy',
            'gradual_mood_transition',
            'transition_duration',
        ]

class EmotionalPlaylistTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmotionalPlaylistTemplate
        fields = [
            'id',
            'name',
            'target_mood',
            'description',
            'tempo_range_min',
            'tempo_range_max',
            'energy_level',
            'valence_level',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']

    def validate(self, data):
        """
        Check that tempo_range_min is less than tempo_range_max
        """
        if data['tempo_range_min'] > data['tempo_range_max']:
            raise serializers.ValidationError({
                'tempo_range_min': 'Minimum tempo must be less than maximum tempo'
            })
        return data

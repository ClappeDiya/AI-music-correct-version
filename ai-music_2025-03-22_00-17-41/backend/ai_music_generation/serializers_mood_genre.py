from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models_mood_genre import (
    MoodTimeline,
    MoodPoint,
    GenreBlend,
    GenreWeight,
    ChordProgression,
    TransitionPoint,
    CreativeRole
)

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


class MoodPointSerializer(serializers.ModelSerializer):
    class Meta:
        model = MoodPoint
        fields = [
            'id', 'timeline', 'timestamp', 'intensity',
            'mood_type', 'transition_type'
        ]


class MoodTimelineSerializer(serializers.ModelSerializer):
    creator = UserSerializer(read_only=True)
    mood_points = MoodPointSerializer(many=True, read_only=True)
    
    class Meta:
        model = MoodTimeline
        fields = [
            'id', 'session', 'creator', 'created_at',
            'updated_at', 'is_active', 'mood_points'
        ]
        read_only_fields = ['created_at', 'updated_at']


class GenreWeightSerializer(serializers.ModelSerializer):
    class Meta:
        model = GenreWeight
        fields = ['id', 'blend', 'genre', 'weight']


class GenreBlendSerializer(serializers.ModelSerializer):
    creator = UserSerializer(read_only=True)
    genre_weights = GenreWeightSerializer(many=True)
    
    class Meta:
        model = GenreBlend
        fields = [
            'id', 'session', 'creator', 'start_time',
            'duration', 'created_at', 'genre_weights'
        ]
        read_only_fields = ['created_at']

    def create(self, validated_data):
        genre_weights_data = validated_data.pop('genre_weights')
        genre_blend = GenreBlend.objects.create(**validated_data)
        
        for weight_data in genre_weights_data:
            GenreWeight.objects.create(blend=genre_blend, **weight_data)
        
        return genre_blend

    def update(self, instance, validated_data):
        genre_weights_data = validated_data.pop('genre_weights', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if genre_weights_data is not None:
            instance.genre_weights.all().delete()
            for weight_data in genre_weights_data:
                GenreWeight.objects.create(blend=instance, **weight_data)
        
        return instance


class ChordProgressionSerializer(serializers.ModelSerializer):
    creator = UserSerializer(read_only=True)
    
    class Meta:
        model = ChordProgression
        fields = [
            'id', 'session', 'creator', 'start_time',
            'duration', 'progression', 'created_at'
        ]
        read_only_fields = ['created_at']


class TransitionPointSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransitionPoint
        fields = [
            'id', 'session', 'start_time', 'duration',
            'transition_type', 'parameters', 'created_at'
        ]
        read_only_fields = ['created_at']


class CreativeRoleSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = CreativeRole
        fields = [
            'id', 'session', 'user', 'role_type',
            'assigned_at'
        ]
        read_only_fields = ['assigned_at']


class TimelineStateSerializer(serializers.Serializer):
    """
    Serializer for the complete timeline state at a given point.
    """
    timestamp = serializers.FloatField()
    mood_intensities = serializers.DictField(
        child=serializers.FloatField()
    )
    active_genres = serializers.DictField(
        child=serializers.FloatField()
    )
    current_chord = serializers.CharField()
    next_chord = serializers.CharField()
    upcoming_transition = serializers.DictField(
        child=serializers.JSONField(),
        required=False
    )


class CollaborativeUpdateSerializer(serializers.Serializer):
    """
    Serializer for collaborative updates from multiple users.
    """
    update_type = serializers.ChoiceField(choices=[
        'mood', 'genre', 'chord', 'transition'
    ])
    timestamp = serializers.FloatField()
    user = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all()
    )
    data = serializers.JSONField()


class MoodAnalysisSerializer(serializers.Serializer):
    """
    Serializer for mood analysis results.
    """
    section_start = serializers.FloatField()
    section_end = serializers.FloatField()
    dominant_mood = serializers.CharField()
    mood_distribution = serializers.DictField(
        child=serializers.FloatField()
    )
    intensity_curve = serializers.ListField(
        child=serializers.FloatField()
    )
    suggested_genres = serializers.ListField(
        child=serializers.CharField()
    )


class GenreTransitionSerializer(serializers.Serializer):
    """
    Serializer for genre transition analysis and suggestions.
    """
    transition_start = serializers.FloatField()
    transition_end = serializers.FloatField()
    source_genres = serializers.DictField(
        child=serializers.FloatField()
    )
    target_genres = serializers.DictField(
        child=serializers.FloatField()
    )
    suggested_techniques = serializers.ListField(
        child=serializers.DictField(
            child=serializers.JSONField()
        )
    )
    compatibility_score = serializers.FloatField()


class HarmonicAnalysisSerializer(serializers.Serializer):
    """
    Serializer for harmonic analysis of chord progressions.
    """
    progression_id = serializers.IntegerField()
    key = serializers.CharField()
    chord_functions = serializers.ListField(
        child=serializers.CharField()
    )
    tension_points = serializers.ListField(
        child=serializers.FloatField()
    )
    resolution_suggestions = serializers.ListField(
        child=serializers.CharField()
    )
    genre_compatibility = serializers.DictField(
        child=serializers.FloatField()
    )

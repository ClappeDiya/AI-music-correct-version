from rest_framework import serializers
from .models_mood_genre import CoCreationSession as CollaborativeSession, CreativeRole, TimelineState
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class CollaborativeSessionSerializer(serializers.ModelSerializer):
    participants = UserSerializer(many=True, read_only=True)
    creator = serializers.PrimaryKeyRelatedField(
        read_only=True,
        default=serializers.CurrentUserDefault()
    )

    class Meta:
        model = CollaborativeSession
        fields = [
            'id', 'title', 'description', 'created_at',
            'participants', 'creator', 'is_active'
        ]
        read_only_fields = ['created_at', 'participants']

    def create(self, validated_data):
        validated_data['creator'] = self.context['request'].user
        return super().create(validated_data)

class CreativeRoleSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    session = serializers.PrimaryKeyRelatedField(
        queryset=CollaborativeSession.objects.all()
    )

    class Meta:
        model = CreativeRole
        fields = [
            'id', 'user', 'session', 'role_type',
            'assigned_at', 'is_active'
        ]
        read_only_fields = ['assigned_at']

    def validate(self, data):
        # Check if role is already taken
        if CreativeRole.objects.filter(
            session=data['session'],
            role_type=data['role_type'],
            is_active=True
        ).exists():
            raise serializers.ValidationError(
                f"Role {data['role_type']} is already taken in this session"
            )
        return data

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class TimelineStateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimelineState
        fields = [
            'id', 'session', 'timestamp',
            'mood_intensities', 'active_genres',
            'current_progression'
        ]
        read_only_fields = ['timestamp']

class MoodUpdateSerializer(serializers.Serializer):
    mood_type = serializers.CharField()
    timestamp = serializers.FloatField()
    intensity = serializers.FloatField(min_value=0.0, max_value=1.0)
    transition_type = serializers.ChoiceField(
        choices=['linear', 'exponential', 'sudden', 'gradual'],
        default='linear'
    )

class GenreWeightSerializer(serializers.Serializer):
    genre = serializers.CharField()
    weight = serializers.FloatField(min_value=0.0, max_value=1.0)

class GenreUpdateSerializer(serializers.Serializer):
    weights = GenreWeightSerializer(many=True)
    duration = serializers.IntegerField(default=4)  # in bars

    def validate_weights(self, value):
        # Ensure weights sum to 1.0
        total = sum(w['weight'] for w in value)
        if not (0.99 <= total <= 1.01):  # Allow small floating point errors
            raise serializers.ValidationError(
                f"Genre weights must sum to 1.0 (got {total})"
            )
        return value

class ChordSerializer(serializers.Serializer):
    root = serializers.CharField()
    quality = serializers.CharField(allow_blank=True)
    duration = serializers.FloatField(min_value=0.25)  # in bars

class ChordUpdateSerializer(serializers.Serializer):
    chords = ChordSerializer(many=True)
    timestamp = serializers.FloatField()

class TransitionPointSerializer(serializers.Serializer):
    start_time = serializers.FloatField()
    duration = serializers.FloatField(min_value=0.1)
    type = serializers.CharField()
    parameters = serializers.JSONField()

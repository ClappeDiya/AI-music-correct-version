from rest_framework import serializers
from .models import Genre, MixingSession, MixingSessionGenre, MixingSessionParams, MixingOutput, TrackReference
from user_management.serializers import UserSerializer


class GenreSerializer(serializers.ModelSerializer):
    """
    Serializer for the Genre model.
    Handles serialization and deserialization of Genre objects.
    """
    class Meta:
        model = Genre # The model associated with this serializer
        fields = ['id', 'name', 'description', 'created_at', 'updated_at'] # Explicitly list all fields to be serialized
        read_only_fields = ['id', 'created_at', 'updated_at'] # Fields that should not be modified during updates


class MixingSessionSerializer(serializers.ModelSerializer):
    """
    Serializer for the MixingSession model.
    Handles serialization and deserialization of MixingSession objects.
    Includes nested serializers for related models.
    """
    user = UserSerializer(read_only=True) # Nested serializer for the user field, read-only
    class Meta:
        model = MixingSession # The model associated with this serializer
        fields = ['id', 'user', 'session_name', 'status', 'created_at', 'updated_at'] # Explicitly list all fields to be serialized
        read_only_fields = ['id', 'created_at', 'updated_at'] # Fields that should not be modified during updates


class MixingSessionGenreSerializer(serializers.ModelSerializer):
    """
    Serializer for the MixingSessionGenre model.
    Handles serialization and deserialization of MixingSessionGenre objects.
    """
    genre = GenreSerializer(read_only=True) # Nested serializer for the genre field, read-only
    class Meta:
        model = MixingSessionGenre # The model associated with this serializer
        fields = ['id', 'session', 'genre', 'weight'] # Explicitly list all fields to be serialized
        read_only_fields = ['id'] # Fields that should not be modified during updates


class MixingSessionParamsSerializer(serializers.ModelSerializer):
    """
    Serializer for the MixingSessionParams model.
    Handles serialization and deserialization of MixingSessionParams objects.
    """
    class Meta:
        model = MixingSessionParams # The model associated with this serializer
        fields = ['id', 'session', 'parameters', 'created_at'] # Explicitly list all fields to be serialized
        read_only_fields = ['id', 'created_at'] # Fields that should not be modified during updates


class MixingOutputSerializer(serializers.ModelSerializer):
    """
    Serializer for the MixingOutput model.
    Handles serialization and deserialization of MixingOutput objects.
    """
    class Meta:
        model = MixingOutput # The model associated with this serializer
        fields = ['id', 'session', 'audio_file_url', 'notation_data', 'waveform_data', 'created_at', 'finalization_timestamp'] # Explicitly list all fields to be serialized
        read_only_fields = ['id', 'created_at', 'finalization_timestamp'] # Fields that should not be modified during updates


class TrackReferenceSerializer(serializers.ModelSerializer):
    """
    Serializer for the TrackReference model
    """
    class Meta:
        model = TrackReference
        fields = ['id', 'session', 'version', 'created_at', 'updated_at', 
                 'metadata', 'analysis_data', 'visibility']
        read_only_fields = ['created_at', 'updated_at', 'created_by']

from rest_framework import serializers
from .models import (
    Mood,
    CustomMood,
    MoodRequest,
    GeneratedMoodTrack,
    MoodFeedback,
    MoodProfile,
    ExternalMoodReference,
    MoodEmbedding,
    ContextualTrigger,
    LiveMoodSession,
    CollaborativeMoodSpace,
    AdvancedMoodParameter,
    MoodPlaylist,
)
from user_management.serializers import UserSerializer

class BaseUserAwareSerializer(serializers.ModelSerializer):
    """
    Base serializer that implements user-specific validation and access control.
    """
    def validate(self, attrs):
        # Ensure user field is set to the authenticated user
        if hasattr(self.Meta.model, 'user'):
            attrs['user'] = self.context['request'].user
        return super().validate(attrs)


class MoodSerializer(serializers.ModelSerializer):
    """
    Serializer for the Mood model.
    """
    class Meta:
        model = Mood
        fields = ['id', 'name', 'description', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class CustomMoodSerializer(BaseUserAwareSerializer):
    """
    Serializer for the CustomMood model.
    """
    user = UserSerializer(read_only=True)

    class Meta:
        model = CustomMood
        fields = ['id', 'user', 'mood_name', 'mood_parameters', 'created_at']
        read_only_fields = ['id', 'created_at', 'user']


class MoodRequestSerializer(BaseUserAwareSerializer):
    """
    Serializer for the MoodRequest model.
    """
    user = UserSerializer(read_only=True)
    selected_mood = MoodSerializer(read_only=True)
    custom_mood = CustomMoodSerializer(read_only=True)

    class Meta:
        model = MoodRequest
        fields = ['id', 'user', 'selected_mood', 'custom_mood', 'intensity', 'parameters', 'created_at']
        read_only_fields = ['id', 'created_at', 'user', 'selected_mood', 'custom_mood']


class GeneratedMoodTrackSerializer(BaseUserAwareSerializer):
    """
    Serializer for the GeneratedMoodTrack model.
    """
    mood_request = MoodRequestSerializer(read_only=True)

    class Meta:
        model = GeneratedMoodTrack
        fields = ['id', 'mood_request', 'track_id', 'file_url', 'metadata', 'created_at']
        read_only_fields = ['id', 'created_at', 'mood_request']


class MoodFeedbackSerializer(BaseUserAwareSerializer):
    """
    Serializer for the MoodFeedback model.
    """
    user = UserSerializer(read_only=True)
    generated_track = GeneratedMoodTrackSerializer(read_only=True)

    class Meta:
        model = MoodFeedback
        fields = ['id', 'generated_track', 'user', 'feedback_type', 'feedback_notes', 'created_at']
        read_only_fields = ['id', 'created_at', 'user', 'generated_track']


class MoodProfileSerializer(BaseUserAwareSerializer):
    """
    Serializer for the MoodProfile model.
    """
    user = UserSerializer(read_only=True)

    class Meta:
        model = MoodProfile
        fields = ['id', 'user', 'aggregated_preferences', 'last_updated']
        read_only_fields = ['id', 'last_updated', 'user']


class ExternalMoodReferenceSerializer(serializers.ModelSerializer):
    """
    Serializer for the ExternalMoodReference model.
    """
    class Meta:
        model = ExternalMoodReference
        fields = ['id', 'reference_type', 'data', 'created_at']
        read_only_fields = ['id', 'created_at']


class MoodEmbeddingSerializer(BaseUserAwareSerializer):
    """
    Serializer for the MoodEmbedding model.
    """
    user = UserSerializer(read_only=True)

    class Meta:
        model = MoodEmbedding
        fields = ['id', 'user', 'embedding_vector', 'dimensionality', 'created_at']
        read_only_fields = ['id', 'created_at', 'user']


class ContextualTriggerSerializer(BaseUserAwareSerializer):
    """
    Serializer for the ContextualTrigger model.
    """
    user = UserSerializer(read_only=True)

    class Meta:
        model = ContextualTrigger
        fields = ['id', 'user', 'trigger_data', 'created_at']
        read_only_fields = ['id', 'created_at', 'user']


class LiveMoodSessionSerializer(BaseUserAwareSerializer):
    """
    Serializer for the LiveMoodSession model.
    """
    user = UserSerializer(read_only=True)

    class Meta:
        model = LiveMoodSession
        fields = ['id', 'user', 'session_name', 'active', 'current_mood_state', 'last_update']
        read_only_fields = ['id', 'last_update', 'user']


class CollaborativeMoodSpaceSerializer(serializers.ModelSerializer):
    """
    Serializer for the CollaborativeMoodSpace model.
    """
    class Meta:
        model = CollaborativeMoodSpace
        fields = ['id', 'space_name', 'participant_ids', 'combined_mood_state', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate(self, attrs):
        # Ensure current user is in participant_ids
        user_id = self.context['request'].user.id
        if 'participant_ids' in attrs and user_id not in attrs['participant_ids']:
            attrs['participant_ids'].append(user_id)
        return super().validate(attrs)


class AdvancedMoodParameterSerializer(BaseUserAwareSerializer):
    """
    Serializer for the AdvancedMoodParameter model.
    """
    user = UserSerializer(read_only=True)

    class Meta:
        model = AdvancedMoodParameter
        fields = ['id', 'user', 'model_tweaks', 'created_at']
        read_only_fields = ['id', 'created_at', 'user']


class MoodPlaylistSerializer(BaseUserAwareSerializer):
    """
    Serializer for the MoodPlaylist model.
    """
    user = UserSerializer(read_only=True)

    class Meta:
        model = MoodPlaylist
        fields = ['id', 'user', 'playlist_name', 'mood_profile', 'auto_update', 'created_at']
        read_only_fields = ['id', 'created_at', 'user']

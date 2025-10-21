from rest_framework import serializers
from .models import (
    LLMProvider, LyricPrompt, LyricDraft, LyricEdit, FinalLyrics,
    LyricTimeline, Language, LyricInfluencer, LyricModelVersion,
    LyricVrArSettings, LyricSignature, LyricAdaptiveFeedback,
    CollaborativeLyricSession, LyricShareLink, CollaboratorPresence,
    CollaborativeEdit
)

# Existing serializers remain unchanged...

class CollaboratorPresenceSerializer(serializers.ModelSerializer):
    """
    Serializer for the CollaboratorPresence model.
    Used for tracking and displaying collaborator activity.
    """
    user_name = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = CollaboratorPresence
        fields = ['id', 'user', 'user_name', 'last_seen', 'cursor_position', 'is_active', 'connected_at']
        read_only_fields = ['connected_at', 'last_seen']

class CollaborativeEditSerializer(serializers.ModelSerializer):
    """
    Serializer for the CollaborativeEdit model.
    Used for tracking and syncing collaborative edits.
    """
    editor_name = serializers.CharField(source='editor.username', read_only=True)
    
    class Meta:
        model = CollaborativeEdit
        fields = ['id', 'session', 'editor', 'editor_name', 'content', 'edit_type', 
                 'position', 'length', 'created_at']
        read_only_fields = ['created_at']

class CollaborativeLyricSessionSerializer(serializers.ModelSerializer):
    """
    Serializer for the CollaborativeLyricSession model.
    Used for managing collaborative editing sessions.
    """
    collaborators = CollaboratorPresenceSerializer(source='collaborator_presence', many=True, read_only=True)
    recent_edits = serializers.SerializerMethodField()
    owner_name = serializers.CharField(source='owner.username', read_only=True)
    
    class Meta:
        model = CollaborativeLyricSession
        fields = ['id', 'final_lyrics', 'owner', 'owner_name', 'created_at', 
                 'expires_at', 'is_active', 'collaborators', 'recent_edits']
        read_only_fields = ['created_at']

    def get_recent_edits(self, obj):
        """Get the 50 most recent edits for the session"""
        recent_edits = obj.collaborative_edits.all()[:50]
        return CollaborativeEditSerializer(recent_edits, many=True).data

class LyricShareLinkSerializer(serializers.ModelSerializer):
    """
    Serializer for the LyricShareLink model.
    Used for managing shareable collaboration links.
    """
    is_valid = serializers.BooleanField(read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = LyricShareLink
        fields = ['id', 'session', 'token', 'created_at', 'expires_at', 
                 'max_uses', 'times_used', 'created_by', 'created_by_name', 'is_valid']
        read_only_fields = ['token', 'created_at', 'times_used']
        extra_kwargs = {
            'token': {'write_only': True}  # Token should not be returned in responses
        }

    def create(self, validated_data):
        """
        Create a new share link with default expiration if not provided
        """
        if 'expires_at' not in validated_data:
            validated_data['expires_at'] = timezone.now() + timedelta(days=7)
        return super().create(validated_data)

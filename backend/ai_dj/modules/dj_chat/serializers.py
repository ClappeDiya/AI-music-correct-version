from rest_framework import serializers
from .models import (
    ChatSession,
    ChatMessage,
    UserPreference,
    MusicFact,
    ChatPersonality
)


class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = [
            'id', 'session', 'is_ai', 'content',
            'context', 'created_at'
        ]
        read_only_fields = ['created_at']


class ChatSessionSerializer(serializers.ModelSerializer):
    messages = ChatMessageSerializer(many=True, read_only=True)
    
    class Meta:
        model = ChatSession
        fields = [
            'id', 'session', 'user', 'is_ephemeral',
            'created_at', 'last_interaction', 'messages'
        ]
        read_only_fields = ['created_at', 'last_interaction']


class UserPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPreference
        fields = [
            'id', 'user', 'favorite_genres',
            'favorite_artists', 'mood_preferences',
            'listening_history', 'updated_at'
        ]
        read_only_fields = ['updated_at']


class MusicFactSerializer(serializers.ModelSerializer):
    class Meta:
        model = MusicFact
        fields = [
            'id', 'title', 'content', 'source',
            'categories', 'verified', 'created_at'
        ]
        read_only_fields = ['created_at']


class ChatPersonalitySerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatPersonality
        fields = [
            'id', 'name', 'description', 'traits',
            'response_templates', 'active', 'created_at'
        ]
        read_only_fields = ['created_at']


class ChatResponseSerializer(serializers.Serializer):
    message = serializers.CharField()
    context = serializers.JSONField(required=False)
    suggestions = serializers.ListField(
        child=serializers.CharField(),
        required=False
    )
    music_fact = MusicFactSerializer(required=False)
    
    def create(self, validated_data):
        return validated_data
    
    def update(self, instance, validated_data):
        return validated_data

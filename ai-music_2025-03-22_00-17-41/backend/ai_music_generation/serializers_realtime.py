from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models_realtime import (
    CoCreationSession,
    SessionParticipant,
    RealtimeEdit,
    AIContribution,
    SessionChat
)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ['id', 'username', 'email']


class SessionParticipantSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = SessionParticipant
        fields = [
            'id', 'session', 'user', 'role',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class CoCreationSessionSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    participants = SessionParticipantSerializer(many=True, read_only=True)
    
    class Meta:
        model = CoCreationSession
        fields = [
            'id', 'name', 'description', 'created_by',
            'active', 'max_participants', 'session_type',
            'current_composition', 'created_at', 'updated_at',
            'participants'
        ]
        read_only_fields = ['created_at', 'updated_at']


class RealtimeEditSerializer(serializers.ModelSerializer):
    participant = SessionParticipantSerializer(read_only=True)
    
    class Meta:
        model = RealtimeEdit
        fields = [
            'id', 'session', 'participant', 'edit_type',
            'position', 'edit_data', 'created_at'
        ]
        read_only_fields = ['created_at']


class AIContributionSerializer(serializers.ModelSerializer):
    requested_by = SessionParticipantSerializer(read_only=True)
    
    class Meta:
        model = AIContribution
        fields = [
            'id', 'session', 'requested_by', 'contribution_type',
            'context', 'content', 'explanation', 'created_at'
        ]
        read_only_fields = ['created_at']


class SessionChatSerializer(serializers.ModelSerializer):
    participant = SessionParticipantSerializer(read_only=True)
    
    class Meta:
        model = SessionChat
        fields = [
            'id', 'session', 'participant', 'message_type',
            'content', 'metadata', 'created_at'
        ]
        read_only_fields = ['created_at']

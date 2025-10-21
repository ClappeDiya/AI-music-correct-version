from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import VoiceChannel, VoiceParticipant, DJComment, ChatMessage

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class VoiceChannelSerializer(serializers.ModelSerializer):
    participant_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = VoiceChannel
        fields = [
            'id', 'session', 'name', 'created_at',
            'is_active', 'ice_servers', 'signaling_url',
            'participant_count'
        ]
        read_only_fields = ['created_at']

class VoiceParticipantSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = VoiceParticipant
        fields = [
            'id', 'channel', 'user', 'joined_at',
            'is_muted', 'is_speaking', 'peer_id'
        ]
        read_only_fields = ['joined_at']

class DJCommentSerializer(serializers.ModelSerializer):
    comment_type_display = serializers.CharField(
        source='get_comment_type_display',
        read_only=True
    )
    
    class Meta:
        model = DJComment
        fields = [
            'id', 'session', 'comment_type', 'comment_type_display',
            'content', 'created_at', 'priority', 'track_id',
            'track_position', 'reaction_count', 'was_helpful'
        ]
        read_only_fields = ['created_at', 'reaction_count', 'was_helpful']

class ChatMessageSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    replies = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatMessage
        fields = [
            'id', 'channel', 'user', 'content',
            'created_at', 'is_system_message',
            'parent_message', 'replies'
        ]
        read_only_fields = ['created_at']
    
    def get_replies(self, obj):
        if obj.parent_message is None:  # Only get replies for parent messages
            replies = obj.replies.all()
            return ChatMessageSerializer(replies, many=True).data
        return []

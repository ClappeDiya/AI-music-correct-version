from rest_framework import serializers
from .models import (
    CommunityEventCategory,
    Post,
    PostComment,
    PostLike,
    UserFollow,
    Group,
    GroupMembership,
    Event,
    EventParticipation,
    PrivacySetting,
    ModerationAction,
    EphemeralPresence,
    CommunityCluster,
    UserTip,
    TranslationSuggestion,
    AnalyticsEvent,
    LLMRequest,
    TrackReference,
    TrackVersion,
)
from user_management.serializers import UserSerializer


class CommunityEventCategorySerializer(serializers.ModelSerializer):
    """
    Serializer for the CommunityEventCategory model.
    """
    class Meta:
        model = CommunityEventCategory
        fields = ['id', 'category_name', 'description', 'created_at']
        read_only_fields = ['id', 'created_at']


class PostSerializer(serializers.ModelSerializer):
    """
    Serializer for the Post model with user context.
    """
    user = UserSerializer(read_only=True)
    can_edit = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ['id', 'user', 'track_id', 'content', 'metadata', 'visibility', 'created_at', 'can_edit']
        read_only_fields = ['id', 'created_at', 'user']

    def get_can_edit(self, obj):
        """Check if requesting user can edit the post"""
        user = self.context['request'].user
        return user.is_staff or obj.user == user


class PostCommentSerializer(serializers.ModelSerializer):
    """
    Serializer for the PostComment model.
    """
    user = UserSerializer(read_only=True)
    class Meta:
        model = PostComment
        fields = ['id', 'post', 'user', 'comment_text', 'created_at']
        read_only_fields = ['id', 'created_at', 'user']


class PostLikeSerializer(serializers.ModelSerializer):
    """
    Serializer for the PostLike model.
    """
    user = UserSerializer(read_only=True)
    class Meta:
        model = PostLike
        fields = ['id', 'post', 'user', 'created_at']
        read_only_fields = ['id', 'created_at', 'user']


class UserFollowSerializer(serializers.ModelSerializer):
    """
    Serializer for the UserFollow model.
    """
    follower = UserSerializer(read_only=True)
    followee = UserSerializer(read_only=True)
    class Meta:
        model = UserFollow
        fields = ['id', 'follower', 'followee', 'created_at']
        read_only_fields = ['id', 'created_at', 'follower', 'followee']


class GroupSerializer(serializers.ModelSerializer):
    """
    Serializer for the Group model.
    """
    class Meta:
        model = Group
        fields = ['id', 'group_name', 'description', 'privacy', 'metadata', 'created_at']
        read_only_fields = ['id', 'created_at']


class GroupMembershipSerializer(serializers.ModelSerializer):
    """
    Serializer for the GroupMembership model.
    """
    user = UserSerializer(read_only=True)
    class Meta:
        model = GroupMembership
        fields = ['id', 'group', 'user', 'role', 'joined_at']
        read_only_fields = ['id', 'joined_at', 'user']


class EventSerializer(serializers.ModelSerializer):
    """
    Serializer for the Event model.
    """
    category = CommunityEventCategorySerializer(read_only=True)
    class Meta:
        model = Event
        fields = ['id', 'event_name', 'description', 'category', 'start_time', 'end_time', 'metadata', 'created_at']
        read_only_fields = ['id', 'created_at', 'category']


class EventParticipationSerializer(serializers.ModelSerializer):
    """
    Serializer for the EventParticipation model.
    """
    user = UserSerializer(read_only=True)
    post = PostSerializer(read_only=True)
    class Meta:
        model = EventParticipation
        fields = ['id', 'event', 'user', 'post', 'participated_at']
        read_only_fields = ['id', 'participated_at', 'user', 'post']


class PrivacySettingSerializer(serializers.ModelSerializer):
    """
    Serializer for the PrivacySetting model.
    """
    user = UserSerializer(read_only=True)
    class Meta:
        model = PrivacySetting
        fields = ['id', 'user', 'settings', 'updated_at']
        read_only_fields = ['id', 'updated_at', 'user']


class ModerationActionSerializer(serializers.ModelSerializer):
    """
    Serializer for the ModerationAction model.
    """
    target_user = UserSerializer(read_only=True)
    target_post = PostSerializer(read_only=True)
    moderator_user = UserSerializer(read_only=True)
    class Meta:
        model = ModerationAction
        fields = ['id', 'target_user', 'target_post', 'moderator_user', 'action_type', 'reason', 'created_at']
        read_only_fields = ['id', 'created_at', 'target_user', 'target_post', 'moderator_user']


class EphemeralPresenceSerializer(serializers.ModelSerializer):
    """
    Serializer for the EphemeralPresence model.
    """
    user = UserSerializer(read_only=True)
    class Meta:
        model = EphemeralPresence
        fields = ['id', 'user', 'presence_status', 'last_seen']
        read_only_fields = ['id', 'last_seen', 'user']


class CommunityClusterSerializer(serializers.ModelSerializer):
    """
    Serializer for the CommunityCluster model.
    """
    class Meta:
        model = CommunityCluster
        fields = ['id', 'cluster_name', 'description', 'user_ids', 'metadata', 'created_at']
        read_only_fields = ['id', 'created_at']


class UserTipSerializer(serializers.ModelSerializer):
    """
    Serializer for the UserTip model.
    """
    tipper = UserSerializer(read_only=True)
    recipient_user = UserSerializer(read_only=True)
    related_post = PostSerializer(read_only=True)
    related_comment = PostCommentSerializer(read_only=True)
    class Meta:
        model = UserTip
        fields = ['id', 'tipper', 'recipient_user', 'amount', 'related_post', 'related_comment', 'created_at']
        read_only_fields = ['id', 'created_at', 'tipper', 'recipient_user', 'related_post', 'related_comment']


class TranslationSuggestionSerializer(serializers.ModelSerializer):
    """
    Serializer for the TranslationSuggestion model.
    """
    class Meta:
        model = TranslationSuggestion
        fields = ['id', 'original_content_type', 'original_content_id', 'suggested_language', 'translated_text', 'confidence_score', 'created_at']
        read_only_fields = ['id', 'created_at']


class AnalyticsEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnalyticsEvent
        fields = ['id', 'event_type', 'metadata', 'timestamp']
        read_only_fields = ['id', 'timestamp']


class LLMRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = LLMRequest
        fields = ['id', 'prompt', 'result', 'status', 'metadata', 'created_at']
        read_only_fields = ['id', 'result', 'status', 'created_at']


class TrackVersionSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrackVersion
        fields = ['id', 'version_number', 'changes', 'created_at', 'user']
        read_only_fields = ['id', 'created_at']


class TrackReferenceSerializer(serializers.ModelSerializer):
    versions = TrackVersionSerializer(many=True, read_only=True)
    
    class Meta:
        model = TrackReference
        fields = ['id', 'original_track', 'module_type', 'module_id', 
                 'user', 'current_version', 'metadata', 'versions', 'created_at']
        read_only_fields = ['id', 'created_at']

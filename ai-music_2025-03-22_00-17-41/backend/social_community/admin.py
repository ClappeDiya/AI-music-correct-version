from django.contrib import admin
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
    TranslationSuggestion
)


@admin.register(CommunityEventCategory)
class CommunityEventCategoryAdmin(admin.ModelAdmin):
    """
    Admin class for the CommunityEventCategory model.
    """
    list_display = ['category_name', 'description', 'created_at']
    search_fields = ['category_name', 'description']
    readonly_fields = ['created_at']


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    """
    Admin class for the Post model.
    """
    list_display = ['user', 'content', 'visibility', 'created_at']
    list_filter = ['user', 'visibility', 'created_at']
    search_fields = ['content', 'metadata']
    readonly_fields = ['created_at']
    list_select_related = ['user']


@admin.register(PostComment)
class PostCommentAdmin(admin.ModelAdmin):
    """
    Admin class for the PostComment model.
    """
    list_display = ['post', 'user', 'comment_text', 'created_at']
    list_filter = ['post', 'user', 'created_at']
    search_fields = ['comment_text']
    readonly_fields = ['created_at']
    list_select_related = ['post', 'user']


@admin.register(PostLike)
class PostLikeAdmin(admin.ModelAdmin):
    """
    Admin class for the PostLike model.
    """
    list_display = ['post', 'user', 'created_at']
    list_filter = ['post', 'user', 'created_at']
    readonly_fields = ['created_at']
    list_select_related = ['post', 'user']


@admin.register(UserFollow)
class UserFollowAdmin(admin.ModelAdmin):
    """
    Admin class for the UserFollow model.
    """
    list_display = ['follower', 'followee', 'created_at']
    list_filter = ['follower', 'followee', 'created_at']
    readonly_fields = ['created_at']
    list_select_related = ['follower', 'followee']


@admin.register(Group)
class GroupAdmin(admin.ModelAdmin):
    """
    Admin class for the Group model.
    """
    list_display = ['group_name', 'description', 'privacy', 'created_at']
    list_filter = ['privacy', 'created_at']
    search_fields = ['group_name', 'description', 'metadata']
    readonly_fields = ['created_at']


@admin.register(GroupMembership)
class GroupMembershipAdmin(admin.ModelAdmin):
    """
    Admin class for the GroupMembership model.
    """
    list_display = ['group', 'user', 'role', 'joined_at']
    list_filter = ['group', 'user', 'role', 'joined_at']
    readonly_fields = ['joined_at']
    list_select_related = ['group', 'user']


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    """
    Admin class for the Event model.
    """
    list_display = ['event_name', 'category', 'start_time', 'end_time', 'created_at']
    list_filter = ['category', 'start_time', 'end_time', 'created_at']
    search_fields = ['event_name', 'description', 'metadata']
    readonly_fields = ['created_at']
    list_select_related = ['category']


@admin.register(EventParticipation)
class EventParticipationAdmin(admin.ModelAdmin):
    """
    Admin class for the EventParticipation model.
    """
    list_display = ['event', 'user', 'participated_at']
    list_filter = ['event', 'user', 'participated_at']
    readonly_fields = ['participated_at']
    list_select_related = ['event', 'user', 'post']


@admin.register(PrivacySetting)
class PrivacySettingAdmin(admin.ModelAdmin):
    """
    Admin class for the PrivacySetting model.
    """
    list_display = ['user', 'updated_at']
    readonly_fields = ['updated_at', 'user']
    list_select_related = ['user']


@admin.register(ModerationAction)
class ModerationActionAdmin(admin.ModelAdmin):
    """
    Admin class for the ModerationAction model.
    """
    list_display = ['moderator_user', 'target_user', 'target_post', 'action_type', 'created_at']
    list_filter = ['moderator_user', 'action_type', 'created_at']
    search_fields = ['reason']
    readonly_fields = ['created_at']
    list_select_related = ['moderator_user', 'target_user', 'target_post']


@admin.register(EphemeralPresence)
class EphemeralPresenceAdmin(admin.ModelAdmin):
    """
    Admin class for the EphemeralPresence model.
    """
    list_display = ['user', 'presence_status', 'last_seen']
    list_filter = ['presence_status', 'last_seen']
    readonly_fields = ['last_seen']
    list_select_related = ['user']


@admin.register(CommunityCluster)
class CommunityClusterAdmin(admin.ModelAdmin):
    """
    Admin class for the CommunityCluster model.
    """
    list_display = ['cluster_name', 'description', 'created_at']
    search_fields = ['cluster_name', 'description', 'metadata']
    readonly_fields = ['created_at']


@admin.register(UserTip)
class UserTipAdmin(admin.ModelAdmin):
    """
    Admin class for the UserTip model.
    """
    list_display = ['tipper', 'recipient_user', 'amount', 'created_at']
    list_filter = ['created_at']
    readonly_fields = ['created_at']
    list_select_related = ['tipper', 'recipient_user', 'related_post', 'related_comment']


@admin.register(TranslationSuggestion)
class TranslationSuggestionAdmin(admin.ModelAdmin):
    """
    Admin class for the TranslationSuggestion model.
    """
    list_display = ['original_content_type', 'original_content_id', 'suggested_language', 'created_at']
    list_filter = ['original_content_type', 'suggested_language', 'created_at']
    search_fields = ['translated_text']
    readonly_fields = ['created_at']

from django.db import models
from django.contrib.postgres.fields import ArrayField
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from django.db.models import JSONField
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.core.validators import MinValueValidator, MaxValueValidator


class CommunityEventCategory(models.Model):
    """
    Represents a category for community events.
    """
    id = models.BigAutoField(primary_key=True)
    category_name = models.TextField(unique=True, verbose_name=_("Category Name"), help_text=_("Name of the event category."))
    description = models.TextField(null=True, blank=True, verbose_name=_("Description"), help_text=_("Description of the event category."))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("Date and time when the category was created."))

    class Meta:
        verbose_name = _("Community Event Category")
        verbose_name_plural = _("Community Event Categories")
        ordering = ['category_name']

    def __str__(self):
        return self.category_name


class Post(models.Model):
    """
    Represents a user post on the feed.
    """
    VISIBILITY_CHOICES = [
        ('public', _('Public')),
        ('followers', _('Followers Only')),
        ('private', _('Private')),
        ('group', _('Group Members'))
    ]

    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='posts', verbose_name=_("User"), help_text=_("User who created the post."))
    track_id = models.BigIntegerField(null=True, blank=True, verbose_name=_("Track ID"), help_text=_("ID of the track associated with the post (optional)."))
    content = models.TextField(verbose_name=_("Content"), help_text=_("Content of the post."))
    metadata = JSONField(null=True, blank=True, verbose_name=_("Metadata"), help_text=_("Additional metadata for the post (e.g., tags, influences)."))
    visibility = models.CharField(max_length=20, choices=VISIBILITY_CHOICES, default='public')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("Date and time when the post was created."))

    visibility_field = 'visibility'
    user_field = 'user'

    def can_view(self, user):
        """Check if user can view this post"""
        if user.is_staff or user == self.user:
            return True
        
        if self.visibility == 'public':
            return True
        elif self.visibility == 'followers':
            return self.user.followers.filter(follower=user).exists()
        elif self.visibility == 'group' and hasattr(self, 'group'):
            return self.group.memberships.filter(user=user).exists()
        return False

    class Meta:
        verbose_name = _("Post")
        verbose_name_plural = _("Posts")
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user']),
        ]

    def __str__(self):
        return f"Post by {self.user.username} at {self.created_at}"


class PostComment(models.Model):
    """
    Represents a comment on a post.
    """
    id = models.BigAutoField(primary_key=True)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments', verbose_name=_("Post"), help_text=_("Post the comment belongs to."))
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='post_comments', verbose_name=_("User"), help_text=_("User who created the comment."))
    comment_text = models.TextField(verbose_name=_("Comment Text"), help_text=_("Text of the comment."))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("Date and time when the comment was created."))

    class Meta:
        verbose_name = _("Post Comment")
        verbose_name_plural = _("Post Comments")
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['post']),
        ]

    def __str__(self):
        return f"Comment by {self.user.username} on {self.post}"


class PostLike(models.Model):
    """
    Represents a like on a post.
    """
    id = models.BigAutoField(primary_key=True)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='likes', verbose_name=_("Post"), help_text=_("Post that was liked."))
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='post_likes', verbose_name=_("User"), help_text=_("User who liked the post."))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("Date and time when the like was created."))

    class Meta:
        verbose_name = _("Post Like")
        verbose_name_plural = _("Post Likes")
        unique_together = ['post', 'user']
        indexes = [
            models.Index(fields=['post']),
        ]

    def __str__(self):
        return f"{self.user.username} likes {self.post}"


class UserFollow(models.Model):
    """
    Represents a user following another user.
    """
    id = models.BigAutoField(primary_key=True)
    follower = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='following', verbose_name=_("Follower"), help_text=_("User who is following."))
    followee = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='followers', verbose_name=_("Followee"), help_text=_("User who is being followed."))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("Date and time when the follow was created."))

    class Meta:
        verbose_name = _("User Follow")
        verbose_name_plural = _("User Follows")
        unique_together = ['follower', 'followee']
        indexes = [
            models.Index(fields=['follower']),
        ]

    def __str__(self):
        return f"{self.follower.username} follows {self.followee.username}"


class Group(models.Model):
    """
    Represents a group or forum.
    """
    id = models.BigAutoField(primary_key=True)
    group_name = models.TextField(verbose_name=_("Group Name"), help_text=_("Name of the group."))
    description = models.TextField(null=True, blank=True, verbose_name=_("Description"), help_text=_("Description of the group."))
    privacy = models.TextField(default='public', verbose_name=_("Privacy"), help_text=_("Privacy setting of the group ('public', 'private', 'invite_only')."))
    metadata = JSONField(null=True, blank=True, verbose_name=_("Metadata"), help_text=_("Additional metadata for the group (e.g., topic, rules)."))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("Date and time when the group was created."))

    class Meta:
        verbose_name = _("Group")
        verbose_name_plural = _("Groups")
        ordering = ['group_name']
        indexes = [
            models.Index(fields=['group_name']),
        ]

    def __str__(self):
        return self.group_name


class GroupMembership(models.Model):
    """
    Represents a user's membership in a group.
    """
    id = models.BigAutoField(primary_key=True)
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='memberships', verbose_name=_("Group"), help_text=_("Group the membership belongs to."))
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='group_memberships', verbose_name=_("User"), help_text=_("User who is a member of the group."))
    role = models.TextField(default='member', verbose_name=_("Role"), help_text=_("Role of the user in the group ('member', 'admin', 'moderator')."))
    joined_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Joined At"), help_text=_("Date and time when the user joined the group."))

    class Meta:
        verbose_name = _("Group Membership")
        verbose_name_plural = _("Group Memberships")
        unique_together = ['group', 'user']
        indexes = [
            models.Index(fields=['group']),
        ]

    def __str__(self):
        return f"{self.user.username} is a {self.role} in {self.group.group_name}"


class Event(models.Model):
    """
    Represents a community event.
    """
    id = models.BigAutoField(primary_key=True)
    event_name = models.TextField(verbose_name=_("Event Name"), help_text=_("Name of the event."))
    description = models.TextField(null=True, blank=True, verbose_name=_("Description"), help_text=_("Description of the event."))
    category = models.ForeignKey(CommunityEventCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name='events', verbose_name=_("Category"), help_text=_("Category of the event."))
    start_time = models.DateTimeField(null=True, blank=True, verbose_name=_("Start Time"), help_text=_("Start time of the event."))
    end_time = models.DateTimeField(null=True, blank=True, verbose_name=_("End Time"), help_text=_("End time of the event."))
    metadata = JSONField(null=True, blank=True, verbose_name=_("Metadata"), help_text=_("Additional metadata for the event (e.g., challenge type, prizes)."))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("Date and time when the event was created."))

    class Meta:
        verbose_name = _("Event")
        verbose_name_plural = _("Events")
        ordering = ['event_name']
        indexes = [
            models.Index(fields=['event_name']),
        ]

    def __str__(self):
        return self.event_name


class EventParticipation(models.Model):
    """
    Represents a user's participation in an event.
    """
    id = models.BigAutoField(primary_key=True)
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='participants', verbose_name=_("Event"), help_text=_("Event the participation belongs to."))
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='event_participations', verbose_name=_("User"), help_text=_("User who participated in the event."))
    post = models.ForeignKey(Post, on_delete=models.SET_NULL, null=True, blank=True, related_name='event_entries', verbose_name=_("Post"), help_text=_("Post submitted as an entry for the event (optional)."))
    participated_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Participated At"), help_text=_("Date and time when the user participated in the event."))

    class Meta:
        verbose_name = _("Event Participation")
        verbose_name_plural = _("Event Participations")
        indexes = [
            models.Index(fields=['event']),
        ]

    def __str__(self):
        return f"{self.user.username} participated in {self.event.event_name}"


class PrivacySetting(models.Model):
    """
    Represents a user's privacy settings.
    """
    id = models.BigAutoField(primary_key=True)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='social_privacy_settings', verbose_name=_("User"), help_text=_("User the privacy settings belong to."))
    settings = JSONField(verbose_name=_("Settings"), help_text=_("JSON object containing privacy settings (e.g., show_posts_to, allow_follows)."))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"), help_text=_("Date and time when the privacy settings were last updated."))

    class Meta:
        verbose_name = _("Privacy Setting")
        verbose_name_plural = _("Privacy Settings")

    def __str__(self):
        return f"Privacy settings for {self.user.username}"


class ModerationAction(models.Model):
    """
    Represents a moderation action taken on a user or post.
    """
    id = models.BigAutoField(primary_key=True)
    target_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='moderation_actions_received', verbose_name=_("Target User"), help_text=_("User who was moderated (optional)."))
    target_post = models.ForeignKey(Post, on_delete=models.SET_NULL, null=True, blank=True, related_name='moderation_actions_received', verbose_name=_("Target Post"), help_text=_("Post that was moderated (optional)."))
    moderator_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.RESTRICT, related_name='moderation_actions_taken', verbose_name=_("Moderator User"), help_text=_("User who performed the moderation action."))
    action_type = models.TextField(verbose_name=_("Action Type"), help_text=_("Type of moderation action ('warn', 'suspend', 'remove_post')."))
    reason = models.TextField(null=True, blank=True, verbose_name=_("Reason"), help_text=_("Reason for the moderation action."))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("Date and time when the moderation action was created."))

    class Meta:
        verbose_name = _("Moderation Action")
        verbose_name_plural = _("Moderation Actions")

    def __str__(self):
        return f"{self.moderator_user.username} took action '{self.action_type}' on {self.target_user or self.target_post}"


class EphemeralPresence(models.Model):
    """
    Tracks real-time online states of users.
    """
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='ephemeral_presences', verbose_name=_("User"), help_text=_("User whose presence is being tracked."))
    presence_status = models.TextField(verbose_name=_("Presence Status"), help_text=_("Current presence status ('online', 'idle', 'offline')."))
    last_seen = models.DateTimeField(auto_now=True, verbose_name=_("Last Seen"), help_text=_("Date and time when the user was last seen."))

    class Meta:
        verbose_name = _("Ephemeral Presence")
        verbose_name_plural = _("Ephemeral Presences")
        indexes = [
            models.Index(fields=['user']),
        ]

    def __str__(self):
        return f"{self.user.username} is {self.presence_status}"


class CommunityCluster(models.Model):
    """
    Represents a cluster of users based on their engagement patterns.
    """
    id = models.BigAutoField(primary_key=True)
    cluster_name = models.TextField(verbose_name=_("Cluster Name"), help_text=_("Name of the community cluster."))
    description = models.TextField(null=True, blank=True, verbose_name=_("Description"), help_text=_("Description of the community cluster."))
    user_ids = ArrayField(models.BigIntegerField(), verbose_name=_("User IDs"), help_text=_("Array of user IDs belonging to this cluster."))
    metadata = JSONField(null=True, blank=True, verbose_name=_("Metadata"), help_text=_("Additional metadata for the cluster (e.g., interests, activity level)."))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("Date and time when the cluster was created."))

    class Meta:
        verbose_name = _("Community Cluster")
        verbose_name_plural = _("Community Clusters")
        ordering = ['cluster_name']
        indexes = [
            models.Index(fields=['cluster_name']),
        ]

    def __str__(self):
        return self.cluster_name


class UserTip(models.Model):
    """
    Represents a micro-transaction (tip) from one user to another.
    """
    id = models.BigAutoField(primary_key=True)
    tipper = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tips_given', verbose_name=_("Tipper"), help_text=_("User who sent the tip."))
    recipient_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tips_received', verbose_name=_("Recipient User"), help_text=_("User who received the tip."))
    amount = models.DecimalField(max_digits=10, decimal_places=2, verbose_name=_("Amount"), help_text=_("Amount of the tip."))
    related_post = models.ForeignKey(Post, on_delete=models.SET_NULL, null=True, blank=True, related_name='tips', verbose_name=_("Related Post"), help_text=_("Post related to the tip (optional)."))
    related_comment = models.ForeignKey(PostComment, on_delete=models.SET_NULL, null=True, blank=True, related_name='tips', verbose_name=_("Related Comment"), help_text=_("Comment related to the tip (optional)."))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("Date and time when the tip was created."))

    class Meta:
        verbose_name = _("User Tip")
        verbose_name_plural = _("User Tips")
        indexes = [
            models.Index(fields=['recipient_user']),
        ]

    def __str__(self):
        return f"{self.tipper.username} tipped {self.recipient_user.username} ${self.amount}"


class TranslationSuggestion(models.Model):
    """
    Represents an automated translation suggestion for a post or comment.
    """
    id = models.BigAutoField(primary_key=True)
    original_content_type = models.TextField(verbose_name=_("Original Content Type"), help_text=_("Type of the original content ('post' or 'comment')."))
    original_content_id = models.BigIntegerField(verbose_name=_("Original Content ID"), help_text=_("ID of the original content."))
    suggested_language = models.TextField(verbose_name=_("Suggested Language"), help_text=_("Language of the translation suggestion (e.g., 'en', 'fr', 'es')."))
    translated_text = models.TextField(verbose_name=_("Translated Text"), help_text=_("Translated text."))
    confidence_score = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True, verbose_name=_("Confidence Score"), help_text=_("Confidence score of the translation (e.g., 0.95)."))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("Date and time when the translation suggestion was created."))
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True, blank=True)
    content_object = GenericForeignKey('content_type', 'original_content_id')

    class Meta:
        verbose_name = _("Translation Suggestion")
        verbose_name_plural = _("Translation Suggestions")
        indexes = [
            models.Index(fields=['original_content_id']),
        ]

    def __str__(self):
        return f"Translation suggestion for {self.original_content_type} {self.original_content_id} in {self.suggested_language}"


class AnalyticsEvent(models.Model):
    """
    Tracks user interaction events for analytics
    """
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    event_type = models.TextField(verbose_name=_("Event Type"))
    metadata = JSONField(default=dict, verbose_name=_("Event Metadata"))
    timestamp = models.DateTimeField(auto_now_add=True)
    session_id = models.UUIDField(null=True)
    client_timestamp = models.DateTimeField()

    class Meta:
        verbose_name = _("Analytics Event")
        verbose_name_plural = _("Analytics Events")
        indexes = [
            models.Index(fields=['event_type']),
            models.Index(fields=['timestamp']),
            models.Index(fields=['user', 'timestamp']),
        ]


class LLMRequest(models.Model):
    """
    Tracks LLM generation requests and their results
    """
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    prompt = models.TextField(verbose_name=_("Generation Prompt"))
    result = models.TextField(null=True, blank=True, verbose_name=_("Generation Result"))
    status = models.TextField(default='pending', verbose_name=_("Status"))
    created_at = models.DateTimeField(auto_now_add=True)
    metadata = JSONField(default=dict, verbose_name=_("Request Metadata"))
    token_count = models.IntegerField(default=0)
    completion_tokens = models.IntegerField(default=0)
    total_tokens = models.IntegerField(default=0)

    class Meta:
        verbose_name = _("LLM Request")
        verbose_name_plural = _("LLM Requests")
        indexes = [
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['status']),
        ]


class TrackReference(models.Model):
    """
    References to tracks across different modules
    """
    id = models.BigAutoField(primary_key=True)
    original_track = models.ForeignKey('Post', on_delete=models.CASCADE, related_name='track_references')
    module_type = models.TextField(verbose_name=_("Module Type"))
    module_id = models.BigIntegerField(verbose_name=_("Module ID"))
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    current_version = models.IntegerField(default=1)
    metadata = JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _("Track Reference")
        verbose_name_plural = _("Track References")
        indexes = [
            models.Index(fields=['module_type', 'module_id']),
        ]


class TrackVersion(models.Model):
    """
    Versions of track references
    """
    id = models.BigAutoField(primary_key=True)
    track_reference = models.ForeignKey(TrackReference, on_delete=models.CASCADE, related_name='versions')
    version_number = models.IntegerField()
    changes = models.TextField(verbose_name=_("Version Changes"))
    created_at = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    class Meta:
        verbose_name = _("Track Version")
        verbose_name_plural = _("Track Versions")
        unique_together = ['track_reference', 'version_number']

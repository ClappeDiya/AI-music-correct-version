from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator

User = get_user_model()

class DJSession(models.Model):
    name = models.CharField(max_length=100)
    host = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='hosted_sessions'
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    max_participants = models.IntegerField(
        default=10,
        validators=[MinValueValidator(2), MaxValueValidator(50)]
    )
    is_public = models.BooleanField(default=False)
    join_code = models.CharField(max_length=8, unique=True)
    settings = models.JSONField(default=dict)

    def __str__(self):
        return f"{self.name} (Host: {self.host.username})"

    class Meta:
        ordering = ['-created_at']

class SessionParticipant(models.Model):
    ROLE_CHOICES = [
        ('host', 'Host'),
        ('co_host', 'Co-Host'),
        ('participant', 'Participant'),
    ]

    session = models.ForeignKey(
        DJSession,
        on_delete=models.CASCADE,
        related_name='participants'
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='session_participations'
    )
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='participant'
    )
    joined_at = models.DateTimeField(auto_now_add=True)
    last_active = models.DateTimeField(auto_now=True)
    is_online = models.BooleanField(default=True)

    class Meta:
        unique_together = ['session', 'user']
        ordering = ['joined_at']

    def __str__(self):
        return f"{self.user.username} in {self.session.name}"

class TrackRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('playing', 'Playing'),
        ('played', 'Played'),
    ]

    session = models.ForeignKey(
        DJSession,
        on_delete=models.CASCADE,
        related_name='track_requests'
    )
    requested_by = models.ForeignKey(
        SessionParticipant,
        on_delete=models.CASCADE,
        related_name='track_requests'
    )
    track_id = models.CharField(max_length=100)
    track_title = models.CharField(max_length=200)
    track_artist = models.CharField(max_length=200)
    requested_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    played_at = models.DateTimeField(null=True, blank=True)
    position_in_queue = models.IntegerField(null=True, blank=True)

    class Meta:
        ordering = ['position_in_queue', 'requested_at']

    def __str__(self):
        return f"{self.track_title} - {self.status}"

class TrackVote(models.Model):
    VOTE_CHOICES = [
        ('up', 'Upvote'),
        ('down', 'Downvote'),
    ]

    track_request = models.ForeignKey(
        TrackRequest,
        on_delete=models.CASCADE,
        related_name='votes'
    )
    voter = models.ForeignKey(
        SessionParticipant,
        on_delete=models.CASCADE,
        related_name='track_votes'
    )
    vote = models.CharField(max_length=4, choices=VOTE_CHOICES)
    voted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['track_request', 'voter']

    def __str__(self):
        return f"{self.voter.user.username}'s {self.vote} vote on {self.track_request}"

class SessionMessage(models.Model):
    MESSAGE_TYPES = [
        ('chat', 'Chat Message'),
        ('system', 'System Message'),
        ('request', 'Track Request'),
        ('vote', 'Vote'),
    ]

    session = models.ForeignKey(
        DJSession,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    sender = models.ForeignKey(
        SessionParticipant,
        on_delete=models.CASCADE,
        related_name='sent_messages'
    )
    message_type = models.CharField(
        max_length=20,
        choices=MESSAGE_TYPES,
        default='chat'
    )
    content = models.TextField()
    sent_at = models.DateTimeField(auto_now_add=True)
    metadata = models.JSONField(default=dict)

    class Meta:
        ordering = ['sent_at']

    def __str__(self):
        return f"{self.sender.user.username}: {self.content[:50]}"

class SessionAnalytics(models.Model):
    session = models.OneToOneField(
        DJSession,
        on_delete=models.CASCADE,
        related_name='analytics'
    )
    peak_participants = models.IntegerField(default=0)
    total_tracks_played = models.IntegerField(default=0)
    total_votes = models.IntegerField(default=0)
    total_messages = models.IntegerField(default=0)
    average_track_rating = models.FloatField(
        null=True,
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(5)]
    )
    most_requested_genres = models.JSONField(default=list)
    participant_engagement = models.JSONField(default=dict)
    session_duration = models.DurationField(null=True, blank=True)

    def __str__(self):
        return f"Analytics for {self.session.name}"

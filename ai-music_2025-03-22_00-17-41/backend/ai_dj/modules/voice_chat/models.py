from django.db import models
from django.conf import settings
from ...models import AIDJSession

class VoiceChannel(models.Model):
    session = models.ForeignKey(AIDJSession, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    # WebRTC configuration
    ice_servers = models.JSONField(default=list)
    signaling_url = models.CharField(max_length=255)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Voice Channel for {self.session}"

class VoiceParticipant(models.Model):
    channel = models.ForeignKey(VoiceChannel, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    joined_at = models.DateTimeField(auto_now_add=True)
    is_muted = models.BooleanField(default=False)
    is_speaking = models.BooleanField(default=False)
    peer_id = models.CharField(max_length=100)
    
    class Meta:
        unique_together = ['channel', 'user']
    
    def __str__(self):
        return f"{self.user} in {self.channel}"

class DJComment(models.Model):
    COMMENT_TYPES = [
        ('track_info', 'Track Information'),
        ('transition', 'Track Transition'),
        ('trivia', 'Music Trivia'),
        ('mood', 'Mood Commentary'),
        ('announcement', 'Announcement'),
    ]
    
    session = models.ForeignKey(AIDJSession, on_delete=models.CASCADE)
    comment_type = models.CharField(max_length=20, choices=COMMENT_TYPES)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    priority = models.IntegerField(default=0)
    
    # Related track info if applicable
    track_id = models.CharField(max_length=255, null=True, blank=True)
    track_position = models.FloatField(null=True, blank=True)
    
    # Engagement metrics
    reaction_count = models.IntegerField(default=0)
    was_helpful = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.get_comment_type_display()} at {self.created_at}"

class ChatMessage(models.Model):
    channel = models.ForeignKey(VoiceChannel, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_system_message = models.BooleanField(default=False)
    
    # For threaded discussions
    parent_message = models.ForeignKey(
        'self',
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name='replies'
    )
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"Message from {self.user} at {self.created_at}"

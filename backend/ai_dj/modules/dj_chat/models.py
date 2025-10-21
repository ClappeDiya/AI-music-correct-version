from django.db import models
from django.conf import settings
from ai_dj.models import AIDJSession


class ChatSession(models.Model):
    """Represents a chat session with the AI DJ."""
    
    session = models.OneToOneField(
        AIDJSession,
        on_delete=models.CASCADE,
        related_name='chat_session'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='dj_chat_sessions'
    )
    is_ephemeral = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_interaction = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-last_interaction']


class ChatMessage(models.Model):
    """Individual chat messages in a session."""
    
    session = models.ForeignKey(
        ChatSession,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    is_ai = models.BooleanField(default=False)
    content = models.TextField()
    context = models.JSONField(default=dict)  # Stores message context (current track, mood, etc.)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']


class UserPreference(models.Model):
    """User music preferences learned through chat interactions."""
    
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='dj_chat_preferences'
    )
    favorite_genres = models.JSONField(default=list)
    favorite_artists = models.JSONField(default=list)
    mood_preferences = models.JSONField(default=dict)
    listening_history = models.JSONField(default=list)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-updated_at']


class MusicFact(models.Model):
    """Music facts and trivia for AI DJ to share."""
    
    title = models.CharField(max_length=200)
    content = models.TextField()
    source = models.URLField(blank=True)
    categories = models.JSONField(default=list)  # ['artist', 'genre', 'history', etc.]
    verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']


class ChatPersonality(models.Model):
    """Defines the AI DJ's chat personality and behavior."""
    
    name = models.CharField(max_length=100)
    description = models.TextField()
    traits = models.JSONField()  # Personality traits that influence responses
    response_templates = models.JSONField()  # Templates for different types of responses
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['name']
        verbose_name_plural = 'Chat personalities'

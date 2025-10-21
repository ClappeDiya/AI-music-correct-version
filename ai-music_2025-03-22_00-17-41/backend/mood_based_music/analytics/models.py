from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.contrib.postgres.fields import ArrayField
from ..models import GeneratedMoodTrack, Mood

class TrackInteraction(models.Model):
    """
    Records user interactions with generated tracks.
    """
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    track = models.ForeignKey(GeneratedMoodTrack, on_delete=models.CASCADE)
    interaction_type = models.CharField(max_length=20, choices=[
        ('play', 'Play'),
        ('skip', 'Skip'),
        ('replay', 'Replay'),
        ('complete', 'Complete')
    ])
    duration = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'track', 'interaction_type']),
            models.Index(fields=['track', 'interaction_type']),
        ]

class MoodAccuracyFeedback(models.Model):
    """
    Stores detailed feedback about mood accuracy.
    """
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    track = models.ForeignKey(GeneratedMoodTrack, on_delete=models.CASCADE)
    accuracy_rating = models.DecimalField(max_digits=3, decimal_places=2)
    perceived_intensity = models.DecimalField(max_digits=3, decimal_places=2)
    issues = ArrayField(models.CharField(max_length=100), null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'track']),
            models.Index(fields=['track', 'accuracy_rating']),
        ]

class MoodMetrics(models.Model):
    """
    Aggregated metrics for mood performance.
    """
    id = models.BigAutoField(primary_key=True)
    mood = models.ForeignKey(Mood, on_delete=models.CASCADE)
    total_generations = models.IntegerField(default=0)
    average_accuracy = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    total_feedback = models.IntegerField(default=0)
    common_issues = models.JSONField(default=dict)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-total_generations']
        indexes = [
            models.Index(fields=['mood', 'average_accuracy']),
        ]

class UserMoodStats(models.Model):
    """
    User-specific mood generation statistics.
    """
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    total_tracks = models.IntegerField(default=0)
    favorite_moods = models.JSONField(default=list)
    mood_accuracy = models.JSONField(default=dict)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-last_updated']
        indexes = [
            models.Index(fields=['user', 'total_tracks']),
        ]

class ModelImprovementSuggestion(models.Model):
    """
    AI model improvement suggestions based on feedback.
    """
    id = models.BigAutoField(primary_key=True)
    mood = models.ForeignKey(Mood, on_delete=models.CASCADE)
    current_accuracy = models.DecimalField(max_digits=3, decimal_places=2)
    improvement_areas = ArrayField(models.CharField(max_length=200))
    confidence = models.DecimalField(max_digits=3, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['mood', 'current_accuracy']),
        ] 
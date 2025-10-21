from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from .models_realtime import CoCreationSession
from django.db.models import JSONField


class MoodTimeline(models.Model):
    """
    Represents a timeline of mood intensities in a composition.
    """
    id = models.BigAutoField(primary_key=True)
    session = models.ForeignKey(
        CoCreationSession,
        on_delete=models.CASCADE,
        related_name='mood_timelines'
    )
    creator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='created_mood_timelines'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-created_at']


class MoodPoint(models.Model):
    """
    Represents a specific point in the mood timeline with intensity values.
    """
    id = models.BigAutoField(primary_key=True)
    timeline = models.ForeignKey(
        MoodTimeline,
        on_delete=models.CASCADE,
        related_name='mood_points'
    )
    timestamp = models.FloatField(
        help_text=_("Timestamp in seconds where this mood point occurs")
    )
    intensity = models.FloatField(
        help_text=_("Mood intensity value between 0 and 1")
    )
    mood_type = models.CharField(
        max_length=50,
        choices=[
            ('happy', 'Happy'),
            ('sad', 'Sad'),
            ('energetic', 'Energetic'),
            ('calm', 'Calm'),
            ('tense', 'Tense'),
            ('relaxed', 'Relaxed')
        ]
    )
    transition_type = models.CharField(
        max_length=50,
        choices=[
            ('linear', 'Linear'),
            ('exponential', 'Exponential'),
            ('sudden', 'Sudden'),
            ('gradual', 'Gradual')
        ],
        default='linear'
    )
    
    class Meta:
        ordering = ['timestamp']
        indexes = [
            models.Index(fields=['timeline', 'timestamp']),
        ]


class GenreBlend(models.Model):
    """
    Represents a genre blending configuration for a section of the composition.
    """
    id = models.BigAutoField(primary_key=True)
    session = models.ForeignKey(
        CoCreationSession,
        on_delete=models.CASCADE,
        related_name='genre_blends'
    )
    creator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='created_genre_blends'
    )
    start_time = models.FloatField(
        help_text=_("Start time in seconds for this genre blend")
    )
    duration = models.FloatField(
        help_text=_("Duration in seconds for this genre blend")
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['start_time']
        indexes = [
            models.Index(fields=['session', 'start_time']),
        ]


class GenreWeight(models.Model):
    """
    Represents the weight of a specific genre in a genre blend.
    """
    id = models.BigAutoField(primary_key=True)
    blend = models.ForeignKey(
        GenreBlend,
        on_delete=models.CASCADE,
        related_name='genre_weights'
    )
    genre = models.CharField(
        max_length=50,
        choices=[
            ('rock', 'Rock'),
            ('jazz', 'Jazz'),
            ('classical', 'Classical'),
            ('electronic', 'Electronic'),
            ('folk', 'Folk'),
            ('hip_hop', 'Hip Hop'),
            ('ambient', 'Ambient'),
            ('blues', 'Blues'),
            ('latin', 'Latin'),
            ('funk', 'Funk')
        ]
    )
    weight = models.FloatField(
        help_text=_("Weight of this genre in the blend (0-1)")
    )
    
    class Meta:
        unique_together = ['blend', 'genre']


class ChordProgression(models.Model):
    """
    Represents a chord progression defined by a user.
    """
    id = models.BigAutoField(primary_key=True)
    session = models.ForeignKey(
        CoCreationSession,
        on_delete=models.CASCADE,
        related_name='chord_progressions'
    )
    creator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='created_chord_progressions'
    )
    start_time = models.FloatField(
        help_text=_("Start time in seconds for this progression")
    )
    duration = models.FloatField(
        help_text=_("Duration in seconds for this progression")
    )
    progression = models.JSONField(
        help_text=_("List of chords in the progression")
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['start_time']
        indexes = [
            models.Index(fields=['session', 'start_time']),
        ]


class TransitionPoint(models.Model):
    """
    Represents an AI-generated transition point between different sections.
    """
    id = models.BigAutoField(primary_key=True)
    session = models.ForeignKey(
        CoCreationSession,
        on_delete=models.CASCADE,
        related_name='transition_points'
    )
    start_time = models.FloatField(
        help_text=_("Start time in seconds for this transition")
    )
    duration = models.FloatField(
        help_text=_("Duration in seconds for this transition")
    )
    transition_type = models.CharField(
        max_length=50,
        choices=[
            ('cross_fade', 'Cross Fade'),
            ('harmonic_bridge', 'Harmonic Bridge'),
            ('rhythmic_bridge', 'Rhythmic Bridge'),
            ('motif_based', 'Motif Based'),
            ('sudden', 'Sudden')
        ]
    )
    parameters = models.JSONField(
        help_text=_("Transition-specific parameters")
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['start_time']
        indexes = [
            models.Index(fields=['session', 'start_time']),
        ]


class CreativeRole(models.Model):
    """
    Represents a specific creative role assigned to a user in a session.
    """
    id = models.BigAutoField(primary_key=True)
    session = models.ForeignKey(
        CoCreationSession,
        on_delete=models.CASCADE,
        related_name='creative_roles'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='creative_roles'
    )
    role_type = models.CharField(
        max_length=50,
        choices=[
            ('mood_designer', 'Mood Designer'),
            ('genre_mixer', 'Genre Mixer'),
            ('chord_progressionist', 'Chord Progressionist'),
            ('transition_designer', 'Transition Designer')
        ]
    )
    assigned_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['session', 'role_type']
        indexes = [
            models.Index(fields=['session', 'user']),
        ]


class TimelineState(models.Model):
    """
    Represents the state of a collaborative session's timeline at a given point.
    Tracks mood, genre, and progression changes over time.
    """
    id = models.BigAutoField(primary_key=True)
    session = models.ForeignKey(
        CoCreationSession,
        on_delete=models.CASCADE,
        related_name='timeline_states'
    )
    timestamp = models.DateTimeField(auto_now_add=True)
    mood_intensities = JSONField(
        default=dict,
        help_text=_("Map of mood names to intensity values (0.0-1.0)")
    )
    active_genres = JSONField(
        default=dict,
        help_text=_("Weighted map of active genres")
    )
    current_progression = JSONField(
        default=list,
        help_text=_("Current chord progression")
    )

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['session']),
            models.Index(fields=['timestamp']),
        ]

    def __str__(self):
        return f"Timeline state for {self.session.id} at {self.timestamp}"

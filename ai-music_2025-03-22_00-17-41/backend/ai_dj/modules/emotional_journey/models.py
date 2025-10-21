from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from ...models import AIDJSession

class EmotionalState(models.Model):
    """
    Model to define different emotional states.
    """
    name = models.CharField(max_length=100)
    description = models.TextField()
    valence = models.FloatField(help_text=_("Emotional positivity/negativity (-1 to 1)"))
    arousal = models.FloatField(help_text=_("Emotional intensity/energy (0 to 1)"))
    color_code = models.CharField(max_length=7, help_text=_("Hex color code"))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Emotional State')
        verbose_name_plural = _('Emotional States')
        ordering = ['name']

    def __str__(self):
        return self.name

class EmotionalJourney(models.Model):
    """
    Model to define emotional journey templates.
    """
    name = models.CharField(max_length=200)
    description = models.TextField()
    duration_minutes = models.IntegerField()
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    is_public = models.BooleanField(default=False)
    tags = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Emotional Journey')
        verbose_name_plural = _('Emotional Journeys')
        ordering = ['-created_at']

    def __str__(self):
        return self.name

class JourneyWaypoint(models.Model):
    """
    Model to define waypoints in an emotional journey.
    """
    journey = models.ForeignKey(EmotionalJourney, on_delete=models.CASCADE)
    emotional_state = models.ForeignKey(EmotionalState, on_delete=models.CASCADE)
    position = models.IntegerField()
    duration_minutes = models.IntegerField()
    transition_type = models.CharField(max_length=50)
    intensity = models.FloatField(help_text=_("Intensity of the emotional state (0 to 1)"))
    parameters = models.JSONField(default=dict)

    class Meta:
        verbose_name = _('Journey Waypoint')
        verbose_name_plural = _('Journey Waypoints')
        ordering = ['journey', 'position']
        unique_together = ['journey', 'position']

    def __str__(self):
        return f"{self.journey} - {self.emotional_state} ({self.position})"

class SessionJourney(models.Model):
    """
    Model to track emotional journeys in DJ sessions.
    """
    session = models.ForeignKey(AIDJSession, on_delete=models.CASCADE)
    journey = models.ForeignKey(EmotionalJourney, on_delete=models.CASCADE)
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    progress = models.FloatField(default=0.0)
    current_waypoint = models.ForeignKey(JourneyWaypoint, on_delete=models.SET_NULL, null=True)
    status = models.CharField(max_length=50)

    class Meta:
        verbose_name = _('Session Journey')
        verbose_name_plural = _('Session Journeys')
        ordering = ['-start_time']

    def __str__(self):
        return f"{self.session} - {self.journey}"

class EmotionalSnapshot(models.Model):
    """
    Model to track emotional state at specific points in time.
    """
    session_journey = models.ForeignKey(SessionJourney, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)
    emotional_state = models.ForeignKey(EmotionalState, on_delete=models.CASCADE)
    intensity = models.FloatField()
    confidence_score = models.FloatField()
    source_data = models.JSONField(default=dict)

    class Meta:
        verbose_name = _('Emotional Snapshot')
        verbose_name_plural = _('Emotional Snapshots')
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.session_journey} - {self.emotional_state} ({self.timestamp})"

class JourneyFeedback(models.Model):
    """
    Model to collect user feedback on emotional journeys.
    """
    session_journey = models.ForeignKey(SessionJourney, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    feedback_text = models.TextField(blank=True)
    emotional_impact = models.FloatField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('Journey Feedback')
        verbose_name_plural = _('Journey Feedbacks')
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.user} - {self.session_journey} ({self.rating})"

class EmotionalAnalytics(models.Model):
    """
    Model to store analytics data for emotional journeys.
    """
    journey = models.ForeignKey(EmotionalJourney, on_delete=models.CASCADE)
    time_period = models.CharField(max_length=50)
    usage_count = models.IntegerField(default=0)
    average_rating = models.FloatField(null=True, blank=True)
    emotional_impact_data = models.JSONField(default=dict)
    user_demographics = models.JSONField(default=dict)
    generated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('Emotional Analytics')
        verbose_name_plural = _('Emotional Analytics')
        ordering = ['-generated_at']
        unique_together = ['journey', 'time_period', 'generated_at']

    def __str__(self):
        return f"{self.journey} - {self.time_period}"

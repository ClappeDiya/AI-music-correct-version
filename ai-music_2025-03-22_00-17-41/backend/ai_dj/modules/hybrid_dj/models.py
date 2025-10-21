from django.db import models
from django.conf import settings
from ...models import AIDJSession, Track

class HumanDJPreference(models.Model):
    """Stores individual DJ's preferences and patterns"""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='dj_preferences'
    )
    preferred_bpm_range_min = models.IntegerField(default=80)
    preferred_bpm_range_max = models.IntegerField(default=160)
    preferred_transition_length = models.FloatField(
        default=8.0,
        help_text="Default transition length in seconds"
    )
    auto_suggestions_enabled = models.BooleanField(default=True)
    auto_transitions_enabled = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"DJ Preferences for {self.user.username}"

class TransitionPreset(models.Model):
    """Custom transition presets created by human DJs"""
    EFFECT_TYPES = [
        ('filter', 'Filter Fade'),
        ('echo', 'Echo Out'),
        ('reverb', 'Reverb Trail'),
        ('cut', 'Hard Cut'),
        ('power_down', 'Power Down'),
        ('custom', 'Custom Effect Chain')
    ]

    name = models.CharField(max_length=100)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='transition_presets'
    )
    effect_type = models.CharField(
        max_length=20,
        choices=EFFECT_TYPES,
        default='filter'
    )
    duration = models.FloatField(
        help_text="Duration in seconds"
    )
    effect_parameters = models.JSONField(
        default=dict,
        help_text="Effect-specific parameters"
    )
    is_public = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return self.name

class HumanDJAction(models.Model):
    """Records actions taken by human DJs for learning patterns"""
    ACTION_TYPES = [
        ('track_select', 'Track Selection'),
        ('transition_adjust', 'Transition Adjustment'),
        ('effect_adjust', 'Effect Adjustment'),
        ('suggestion_accept', 'Suggestion Accepted'),
        ('suggestion_reject', 'Suggestion Rejected')
    ]

    session = models.ForeignKey(
        AIDJSession,
        on_delete=models.CASCADE,
        related_name='human_dj_actions'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )
    action_type = models.CharField(
        max_length=20,
        choices=ACTION_TYPES
    )
    track = models.ForeignKey(
        Track,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    parameters = models.JSONField(
        default=dict,
        help_text="Action-specific parameters"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.get_action_type_display()} by {self.user.username}"

class AIRecommendation(models.Model):
    """AI-generated recommendations for the human DJ"""
    RECOMMENDATION_TYPES = [
        ('next_track', 'Next Track'),
        ('transition', 'Transition Style'),
        ('effect', 'Effect Suggestion'),
        ('energy_level', 'Energy Level Change')
    ]

    session = models.ForeignKey(
        AIDJSession,
        on_delete=models.CASCADE,
        related_name='ai_recommendations'
    )
    recommendation_type = models.CharField(
        max_length=20,
        choices=RECOMMENDATION_TYPES
    )
    current_track = models.ForeignKey(
        Track,
        on_delete=models.CASCADE,
        related_name='recommendations_as_current'
    )
    suggested_track = models.ForeignKey(
        Track,
        on_delete=models.CASCADE,
        related_name='recommendations_as_suggestion',
        null=True,
        blank=True
    )
    confidence_score = models.FloatField(
        help_text="AI confidence in this recommendation (0-1)"
    )
    parameters = models.JSONField(
        default=dict,
        help_text="Recommendation-specific parameters"
    )
    was_accepted = models.BooleanField(null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.get_recommendation_type_display()} for {self.session}"

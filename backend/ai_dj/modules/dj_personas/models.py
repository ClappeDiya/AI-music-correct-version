from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.translation import gettext_lazy as _
from ...models import AIDJSession

class DJPersona(models.Model):
    """
    Model to define different DJ personas with their characteristics.
    """
    name = models.CharField(max_length=100)
    description = models.TextField()
    personality_traits = models.JSONField(
        default=dict,
        help_text=_("Personality characteristics like energy, empathy, humor, etc.")
    )
    music_preferences = models.JSONField(
        default=dict,
        help_text=_("Genre preferences, BPM ranges, key preferences, etc.")
    )
    mixing_style = models.JSONField(
        default=dict,
        help_text=_("Transition preferences, effects usage, mixing techniques")
    )
    interaction_style = models.JSONField(
        default=dict,
        help_text=_("Communication style, response patterns, language tone")
    )
    voice_characteristics = models.JSONField(
        default=dict,
        help_text=_("Voice parameters for TTS and voice modulation")
    )
    expertise_areas = models.JSONField(
        default=list,
        help_text=_("Specialized knowledge in music genres or techniques")
    )
    learning_parameters = models.JSONField(
        default=dict,
        help_text=_("Parameters for adaptive learning and personalization")
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('DJ Persona')
        verbose_name_plural = _('DJ Personas')
        ordering = ['name']

    def __str__(self):
        return self.name

class PersonaSession(models.Model):
    """
    Model to track DJ persona usage in sessions.
    """
    session = models.ForeignKey(AIDJSession, on_delete=models.CASCADE)
    persona = models.ForeignKey(DJPersona, on_delete=models.CASCADE)
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    performance_metrics = models.JSONField(
        default=dict,
        help_text=_("Metrics like user engagement, success rate, response time")
    )
    user_feedback = models.JSONField(
        default=dict,
        help_text=_("Aggregated user feedback and ratings")
    )
    session_context = models.JSONField(
        default=dict,
        help_text=_("Environmental and contextual data for the session")
    )
    interaction_log = models.JSONField(
        default=list,
        help_text=_("Detailed log of all interactions and decisions")
    )
    adaptation_history = models.JSONField(
        default=list,
        help_text=_("Record of persona adaptations during session")
    )

    class Meta:
        verbose_name = _('Persona Session')
        verbose_name_plural = _('Persona Sessions')
        ordering = ['-start_time']

    def __str__(self):
        return f"{self.persona} - {self.session}"

class PersonaInteraction(models.Model):
    """
    Model to store interactions between personas and users.
    """
    INTERACTION_TYPES = [
        ('chat', _('Chat')),
        ('command', _('Command')),
        ('suggestion', _('Suggestion')),
        ('feedback', _('Feedback')),
        ('gesture', _('Gesture')),
        ('voice', _('Voice')),
        ('emote', _('Emote')),
    ]

    persona_session = models.ForeignKey(PersonaSession, on_delete=models.CASCADE)
    interaction_type = models.CharField(max_length=20, choices=INTERACTION_TYPES)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    user_response = models.TextField(null=True, blank=True)
    sentiment_score = models.FloatField(null=True, blank=True)
    context = models.JSONField(default=dict)
    response_time = models.FloatField(
        null=True,
        help_text=_("Response time in seconds")
    )
    success_rating = models.IntegerField(
        null=True,
        validators=[MinValueValidator(1), MaxValueValidator(10)]
    )
    interaction_metadata = models.JSONField(
        default=dict,
        help_text=_("Additional metadata about the interaction")
    )

    class Meta:
        verbose_name = _('Persona Interaction')
        verbose_name_plural = _('Persona Interactions')
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.persona_session.persona} - {self.interaction_type}"

class PersonaPreference(models.Model):
    """
    Model to store user preferences for different personas.
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    persona = models.ForeignKey(DJPersona, on_delete=models.CASCADE)
    preference_score = models.FloatField()
    interaction_history = models.JSONField(default=list)
    last_used = models.DateTimeField(null=True, blank=True)
    is_favorite = models.BooleanField(default=False)
    custom_settings = models.JSONField(default=dict)
    preferred_interaction_modes = models.JSONField(
        default=list,
        help_text=_("Preferred ways of interacting with this persona")
    )
    context_specific_preferences = models.JSONField(
        default=dict,
        help_text=_("Preferences for different contexts/situations")
    )
    feedback_history = models.JSONField(
        default=list,
        help_text=_("History of user feedback and ratings")
    )

    class Meta:
        verbose_name = _('Persona Preference')
        verbose_name_plural = _('Persona Preferences')
        ordering = ['-preference_score']
        unique_together = ['user', 'persona']

    def __str__(self):
        return f"{self.user} - {self.persona}"

class PersonaAdaptation(models.Model):
    """
    Model to track how personas adapt to user preferences.
    """
    persona = models.ForeignKey(DJPersona, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    adaptation_data = models.JSONField(
        default=dict,
        help_text=_("Learned adaptations and personalization data")
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    effectiveness_score = models.FloatField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    learning_rate = models.FloatField(
        default=0.1,
        validators=[MinValueValidator(0), MaxValueValidator(1)]
    )
    adaptation_history = models.JSONField(
        default=list,
        help_text=_("History of adaptations and their effects")
    )
    context_adaptations = models.JSONField(
        default=dict,
        help_text=_("Context-specific adaptations")
    )

    class Meta:
        verbose_name = _('Persona Adaptation')
        verbose_name_plural = _('Persona Adaptations')
        ordering = ['-updated_at']
        unique_together = ['persona', 'user']

    def __str__(self):
        return f"{self.persona} - {self.user}"

class PersonaAnalytics(models.Model):
    """
    Model to store analytics data for personas.
    """
    persona = models.ForeignKey(DJPersona, on_delete=models.CASCADE)
    time_period = models.CharField(max_length=50)
    usage_stats = models.JSONField(default=dict)
    performance_metrics = models.JSONField(default=dict)
    user_satisfaction = models.FloatField(null=True, blank=True)
    generated_at = models.DateTimeField(auto_now_add=True)
    interaction_patterns = models.JSONField(
        default=dict,
        help_text=_("Analysis of interaction patterns")
    )
    adaptation_effectiveness = models.JSONField(
        default=dict,
        help_text=_("Analysis of adaptation effectiveness")
    )
    demographic_insights = models.JSONField(
        default=dict,
        help_text=_("Insights based on user demographics")
    )

    class Meta:
        verbose_name = _('Persona Analytics')
        verbose_name_plural = _('Persona Analytics')
        ordering = ['-generated_at']
        unique_together = ['persona', 'time_period', 'generated_at']

    def __str__(self):
        return f"{self.persona} - {self.time_period}"

class PersonaBlend(models.Model):
    """
    Model to manage combinations of multiple personas.
    """
    session = models.ForeignKey(AIDJSession, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    blend_parameters = models.JSONField(
        default=dict,
        help_text=_("Parameters controlling the persona blend")
    )
    effectiveness_metrics = models.JSONField(
        default=dict,
        help_text=_("Metrics measuring blend effectiveness")
    )
    
    class Meta:
        verbose_name = _('Persona Blend')
        verbose_name_plural = _('Persona Blends')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Persona blend for session {self.session.id}"

class PersonaBlendComponent(models.Model):
    """
    Model to define components of a persona blend.
    """
    blend = models.ForeignKey(
        PersonaBlend,
        on_delete=models.CASCADE,
        related_name='components'
    )
    persona = models.ForeignKey(DJPersona, on_delete=models.CASCADE)
    weight = models.FloatField(
        validators=[MinValueValidator(0), MaxValueValidator(1)],
        help_text=_("Weight of this persona in the blend (0-1)")
    )
    role = models.CharField(
        max_length=50,
        help_text=_("Role of this persona in the blend")
    )
    adaptation_parameters = models.JSONField(
        default=dict,
        help_text=_("Parameters for adapting this component")
    )
    
    class Meta:
        verbose_name = _('Persona Blend Component')
        verbose_name_plural = _('Persona Blend Components')
        unique_together = ['blend', 'persona']
    
    def __str__(self):
        return f"{self.persona.name} ({self.weight})"

class PersonaPreset(models.Model):
    """
    Model for pre-configured persona settings.
    """
    CATEGORIES = [
        ('focus', _('Work & Focus')),
        ('party', _('Party & Social')),
        ('chill', _('Chill & Relax')),
        ('workout', _('Workout & Energy')),
        ('ambient', _('Ambient & Background')),
        ('creative', _('Creative & Inspirational')),
        ('gaming', _('Gaming & eSports')),
    ]
    
    name = models.CharField(max_length=100)
    description = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORIES)
    persona = models.ForeignKey(DJPersona, on_delete=models.CASCADE)
    is_public = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    settings = models.JSONField(
        default=dict,
        help_text=_("Preset configuration settings")
    )
    usage_context = models.JSONField(
        default=dict,
        help_text=_("Contextual information for preset usage")
    )
    compatibility_data = models.JSONField(
        default=dict,
        help_text=_("Compatibility with different scenarios")
    )
    
    class Meta:
        verbose_name = _('Persona Preset')
        verbose_name_plural = _('Persona Presets')
        ordering = ['category', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.get_category_display()})"

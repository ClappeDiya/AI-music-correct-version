from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from django.utils import timezone


class UserSettings(models.Model):
    """
    Stores the core user settings and preferences.
    """
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='user_settings', help_text=_("The user associated with these settings."))
    preferences = models.JSONField(null=True, blank=True, help_text=_("JSON object storing user preferences, e.g., theme, language, notifications."))
    device_specific_settings = models.JSONField(null=True, blank=True, help_text=_("JSON object storing device-specific settings, e.g., mobile font size, desktop layout."))
    last_updated = models.DateTimeField(auto_now=True, help_text=_("Timestamp of the last update to these settings."))

    class Meta:
        verbose_name = _("User Setting")
        verbose_name_plural = _("User Settings")
        indexes = [
            models.Index(fields=['user'], name='idx_user_settings'),
        ]
        unique_together = ['user']

    def __str__(self):
        return f"Settings for {self.user}"


class UserSettingsHistory(models.Model):
    """
    Stores the history of changes to user settings.
    """
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='user_settings_history', help_text=_("The user associated with these settings history."))
    old_preferences = models.JSONField(null=True, blank=True, help_text=_("JSON object storing the old user preferences."))
    changed_at = models.DateTimeField(auto_now_add=True, help_text=_("Timestamp of when the settings were changed."))

    class Meta:
        verbose_name = _("User Settings History")
        verbose_name_plural = _("User Settings Histories")
        indexes = [
            models.Index(fields=['user'], name='idx_user_sett_hist'),
        ]

    def __str__(self):
        return f"History for {self.user} at {self.changed_at}"


class PreferenceInheritanceLayer(models.Model):
    """
    Stores references to inherited preference layers.
    """
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='preference_inheritance_layers', help_text=_("The user associated with this preference inheritance layer."))
    layer_type = models.TextField(help_text=_("Type of the preference layer, e.g., tenant_default, community_template."))
    layer_reference = models.TextField(help_text=_("Reference to the preference layer, e.g., tenant_default_v2."))
    priority = models.IntegerField(default=10, help_text=_("Priority of the layer, lower number means higher priority."))

    class Meta:
        verbose_name = _("Preference Inheritance Layer")
        verbose_name_plural = _("Preference Inheritance Layers")
        indexes = [
            models.Index(fields=['user'], name='idx_pref_inherit'),
        ]

    def __str__(self):
        return f"Layer {self.layer_type} for {self.user}"


class PreferenceSuggestion(models.Model):
    """
    Stores AI-driven suggestions for user settings.
    """
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='preference_suggestions', help_text=_("The user associated with this preference suggestion."))
    suggestion_data = models.JSONField(null=True, blank=True, help_text=_("JSON object storing the suggestion data, e.g., suggestion, reason, confidence."))
    suggested_at = models.DateTimeField(auto_now_add=True, help_text=_("Timestamp of when the suggestion was made."))

    class Meta:
        verbose_name = _("Preference Suggestion")
        verbose_name_plural = _("Preference Suggestions")
        indexes = [
            models.Index(fields=['user'], name='idx_pref_suggest'),
        ]

    def __str__(self):
        return f"Suggestion for {self.user} at {self.suggested_at}"


class UserSensoryTheme(models.Model):
    """
    Stores user-defined mappings to advanced sensory outputs.
    """
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='user_sensory_themes', help_text=_("The user associated with this sensory theme."))
    sensory_mappings = models.JSONField(null=True, blank=True, help_text=_("JSON object storing sensory mappings, e.g., color maps, haptic responses."))
    updated_at = models.DateTimeField(auto_now=True, help_text=_("Timestamp of the last update to these sensory mappings."))

    class Meta:
        verbose_name = _("User Sensory Theme")
        verbose_name_plural = _("User Sensory Themes")
        indexes = [
            models.Index(fields=['user'], name='idx_sensory_theme'),
        ]

    def __str__(self):
        return f"Sensory theme for {self.user}"


class ContextualProfile(models.Model):
    """
    Stores rules that switch settings automatically based on environmental cues.
    """
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='contextual_profiles', help_text=_("The user associated with this contextual profile."))
    trigger_conditions = models.JSONField(null=True, blank=True, help_text=_("JSON object storing trigger conditions, e.g., time range, location, biometric signal."))
    profile_adjustments = models.JSONField(null=True, blank=True, help_text=_("JSON object storing profile adjustments, e.g., reduce volume, dark mode."))

    class Meta:
        verbose_name = _("Contextual Profile")
        verbose_name_plural = _("Contextual Profiles")
        indexes = [
            models.Index(fields=['user'], name='idx_context_prof'),
        ]

    def __str__(self):
        return f"Contextual profile for {self.user}"


class PreferenceExternalization(models.Model):
    """
    Stores references for users who externalize their preference sets.
    """
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='preference_externalizations', help_text=_("The user associated with this preference externalization."))
    external_identity_ref = models.TextField(unique=True, help_text=_("A blockchain address or DID."))
    exported_preferences_hash = models.TextField(help_text=_("Hash of the preferences JSON to ensure integrity."))
    linked_at = models.DateTimeField(auto_now_add=True, help_text=_("Timestamp of when the preferences were linked."))
    service_name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    active = models.BooleanField(default=True)
    endpoint_url = models.URLField()
    sync_frequency = models.IntegerField(default=60)  # minutes
    last_sync = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Preference Externalization")
        verbose_name_plural = _("Preference Externalizations")
        indexes = [
            models.Index(fields=['user'], name='idx_pref_ext'),
        ]
        ordering = ['-created_at']

    def __str__(self):
        return f"Externalization for {self.user}"


class EphemeralEventPreference(models.Model):
    """
    Stores temporary, event-based preference sets.
    """
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='ephemeral_event_preferences', help_text=_("The user associated with this ephemeral event preference."))
    event_key = models.TextField(help_text=_("Key for the event, e.g., live_concert_2025, holiday_mode."))
    ephemeral_prefs = models.JSONField(null=True, blank=True, help_text=_("JSON object storing temporary preferences."))
    start_time = models.DateTimeField(null=True, blank=True, help_text=_("Timestamp of when the ephemeral preferences start."))
    end_time = models.DateTimeField(null=True, blank=True, help_text=_("Timestamp of when the ephemeral preferences end."))
    event_type = models.CharField(max_length=255)
    active = models.BooleanField(default=True)
    duration_minutes = models.IntegerField(default=30)
    priority = models.CharField(
        max_length=20,
        choices=[('low', 'Low'), ('medium', 'Medium'), ('high', 'High')],
        default='medium'
    )
    next_scheduled = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Ephemeral Event Preference")
        verbose_name_plural = _("Ephemeral Event Preferences")
        indexes = [
            models.Index(fields=['user'], name='idx_ephemeral_event'),
        ]
        ordering = ['-created_at']

    def __str__(self):
        return f"Ephemeral preference for {self.user} on {self.event_key}"


class PersonaFusion(models.Model):
    """
    Stores multi-persona blending to form complex new profiles.
    """
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='persona_fusions', help_text=_("The user associated with this persona fusion."))
    name = models.CharField(max_length=255, help_text=_("Name of the fused persona"))
    description = models.TextField(blank=True, help_text=_("Description of the fused persona"))
    source_personas = models.JSONField(help_text=_("Array of source personas, e.g., casual_listening, professional_dj."))
    fused_profile = models.JSONField(null=True, blank=True, help_text=_("JSON object storing the resulting hybrid preference set."))
    fusion_weights = models.JSONField(null=True, blank=True, help_text=_("Weights used in the fusion process for each source persona"))
    confidence_score = models.FloatField(null=True, blank=True, help_text=_("ML model's confidence in the fusion result"))
    is_active = models.BooleanField(default=False, help_text=_("Whether this fusion is currently active"))
    last_used = models.DateTimeField(null=True, blank=True, help_text=_("When this fusion was last activated"))
    created_at = models.DateTimeField(auto_now_add=True, help_text=_("Timestamp of when the persona fusion was created."))
    updated_at = models.DateTimeField(auto_now=True, help_text=_("Timestamp of when the persona fusion was last updated"))

    class Meta:
        verbose_name = _("Persona Fusion")
        verbose_name_plural = _("Persona Fusions")
        indexes = [
            models.Index(fields=['user'], name='idx_persona_fusions'),
            models.Index(fields=['is_active'], name='idx_persona_active'),
        ]
        ordering = ['-last_used', '-created_at']

    def __str__(self):
        return f"{self.name} - {self.user}"

    def save(self, *args, **kwargs):
        if self.is_active:
            # Deactivate other active fusions for this user
            PersonaFusion.objects.filter(user=self.user, is_active=True).exclude(pk=self.pk).update(is_active=False)
            self.last_used = timezone.now()
        super().save(*args, **kwargs)


class TranslingualPreference(models.Model):
    """
    Stores language-agnostic preference definitions for effortless localization.
    """
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='translingual_preferences', help_text=_("The user associated with this translingual preference."))
    universal_preference_profile = models.JSONField(null=True, blank=True, help_text=_("JSON object storing a language-agnostic representation of preferences."))
    updated_at = models.DateTimeField(auto_now=True, help_text=_("Timestamp of the last update to these translingual preferences."))

    class Meta:
        verbose_name = _("Translingual Preference")
        verbose_name_plural = _("Translingual Preferences")
        indexes = [
            models.Index(fields=['user'], name='idx_translingual_prefs'),
        ]
        unique_together = ['user']

    def __str__(self):
        return f"Translingual preference for {self.user}"


class UniversalProfileMapping(models.Model):
    """
    Stores mappings for interoperability with external platforms following universal profiles.
    """
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='universal_profile_mappings', help_text=_("The user associated with this universal profile mapping."))
    external_profile_format = models.TextField(help_text=_("Format of the external profile, e.g., W3C_DID, open_preference_format_v1."))
    mapping_data = models.JSONField(null=True, blank=True, help_text=_("JSON object storing mapping data, e.g., key mappings, compatibility level."))
    updated_at = models.DateTimeField(auto_now=True, help_text=_("Timestamp of the last update to these universal profile mappings."))

    class Meta:
        verbose_name = _("Universal Profile Mapping")
        verbose_name_plural = _("Universal Profile Mappings")
        indexes = [
            models.Index(fields=['user'], name='idx_univ_prof_map'),
        ]
        unique_together = ['user', 'external_profile_format']

    def __str__(self):
        return f"Mapping for {self.user} to {self.external_profile_format}"


class BehaviorTriggeredOverlay(models.Model):
    """
    Stores ephemeral changes triggered by user behavior patterns.
    """
    name = models.CharField(max_length=255)
    active = models.BooleanField(default=True)
    trigger_conditions = models.JSONField(default=dict)
    overlay_config = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Behavior Triggered Overlays'


class MultiUserComposite(models.Model):
    """
    Stores composite preference sets for multi-user scenarios on shared devices.
    """
    id = models.BigAutoField(primary_key=True)
    participant_user_ids = models.JSONField(
        help_text='Array of user IDs currently using the same device/session.'
    )
    composite_prefs = models.JSONField(
        null=True,
        blank=True,
        help_text='JSON object storing merged preferences from all participants.'
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text='Timestamp of when the composite was created.'
    )

    class Meta:
        verbose_name = 'Multi User Composite'
        verbose_name_plural = 'Multi User Composites'
        indexes = [
            models.Index(fields=['created_at'], name='idx_multi_user_comp')
        ]

    def __str__(self):
        return f"Composite {self.id} - {len(self.participant_user_ids)} users"


class PredictivePreferenceModel(models.Model):
    """
    Stores metadata for predictive preference models.
    """
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='predictive_preference_models', help_text=_("The user associated with this predictive preference model."))
    model_metadata = models.JSONField(null=True, blank=True, help_text=_("JSON object storing model metadata, e.g., model type, last trained, performance metrics."))

    class Meta:
        verbose_name = _("Predictive Preference Model")
        verbose_name_plural = _("Predictive Preference Models")
        indexes = [
            models.Index(fields=['user'], name='idx_pred_pref_mod'),
        ]

    def __str__(self):
        return f"Model for {self.user}"


class PredictivePreferenceEvent(models.Model):
    """
    Stores events of automatic application of predicted adjustments.
    """
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='predictive_preference_events', help_text=_("The user associated with this predictive preference event."))
    applied_changes = models.JSONField(null=True, blank=True, help_text=_("JSON object storing applied changes, e.g., night_mode, reduced_notifications."))
    applied_at = models.DateTimeField(auto_now_add=True, help_text=_("Timestamp of when the changes were applied."))
    reason = models.TextField(null=True, blank=True, help_text=_("Reason for applying the changes."))

    class Meta:
        verbose_name = _("Predictive Preference Event")
        verbose_name_plural = _("Predictive Preference Events")
        indexes = [
            models.Index(fields=['user'], name='idx_pred_pref_evt'),
        ]

    def __str__(self):
        return f"Event for {self.user} at {self.applied_at}"

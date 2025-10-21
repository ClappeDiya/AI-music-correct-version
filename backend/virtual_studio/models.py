from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings


class Instrument(models.Model):
    """
    Represents a globally available instrument.
    """
    id = models.BigAutoField(primary_key=True)
    name = models.TextField(unique=True, verbose_name=_("Instrument Name"), help_text=_("The name of the instrument."))
    instrument_type = models.TextField(blank=True, null=True, verbose_name=_("Instrument Type"), help_text=_("The type of instrument (e.g., piano, guitar, synth)."))
    base_parameters = models.JSONField(blank=True, null=True, verbose_name=_("Base Parameters"), help_text=_("Baseline parameter set for the instrument."))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"))
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='created_instruments')
    is_public = models.BooleanField(default=True, help_text=_("Whether this instrument is available to all users"))

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = _("Instrument")
        verbose_name_plural = _("Instruments")


class Effect(models.Model):
    """
    Represents a globally available effect.
    """
    id = models.BigAutoField(primary_key=True)
    name = models.TextField(unique=True, verbose_name=_("Effect Name"))
    effect_type = models.TextField(blank=True, null=True, verbose_name=_("Effect Type"))
    base_parameters = models.JSONField(blank=True, null=True, verbose_name=_("Base Parameters"))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='created_effects')
    is_public = models.BooleanField(default=True, help_text=_("Whether this effect is available to all users"))

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = _("Effect")
        verbose_name_plural = _("Effects")


class StudioSession(models.Model):
    """
    Represents a DAW session (project).
    """
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='studio_sessions')
    session_name = models.TextField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    collaborators = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='collaborative_sessions',
        blank=True,
        help_text=_("Users who can access this session")
    )
    is_public = models.BooleanField(default=False, help_text=_("Whether this session is publicly viewable"))

    def __str__(self):
        return self.session_name if self.session_name else str(self.id)

    class Meta:
        verbose_name = _("Studio Session")
        verbose_name_plural = _("Studio Sessions")


class Track(models.Model):
    """
    Represents a track within a session.
    """
    id = models.BigAutoField(primary_key=True)
    session = models.ForeignKey(StudioSession, on_delete=models.CASCADE, related_name='tracks')
    track_name = models.TextField(blank=True, null=True)
    track_type = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    position = models.IntegerField(blank=True, null=True)

    def __str__(self):
        return self.track_name if self.track_name else str(self.id)

    class Meta:
        verbose_name = _("Track")
        verbose_name_plural = _("Tracks")


class TrackInstrument(models.Model):
    """
    Represents an instrument applied to a track.
    """
    id = models.BigAutoField(primary_key=True)
    track = models.ForeignKey(Track, on_delete=models.CASCADE, related_name='instruments')
    instrument = models.ForeignKey(Instrument, on_delete=models.RESTRICT)
    parameters = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f"{self.instrument.name} on {self.track.track_name}"

    class Meta:
        verbose_name = _("Track Instrument")
        verbose_name_plural = _("Track Instruments")


class TrackEffect(models.Model):
    """
    Represents an effect applied to a track.
    """
    id = models.BigAutoField(primary_key=True)
    track = models.ForeignKey(Track, on_delete=models.CASCADE, related_name='effects')
    effect = models.ForeignKey(Effect, on_delete=models.RESTRICT)
    parameters = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f"{self.effect.name} on {self.track.track_name}"

    class Meta:
        verbose_name = _("Track Effect")
        verbose_name_plural = _("Track Effects")


class InstrumentPreset(models.Model):
    """
    Represents a user-defined instrument preset.
    """
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='instrument_presets')
    instrument = models.ForeignKey(Instrument, on_delete=models.RESTRICT)
    preset_name = models.TextField()
    preset_parameters = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_public = models.BooleanField(default=False)

    def __str__(self):
        return self.preset_name

    class Meta:
        verbose_name = _("Instrument Preset")
        verbose_name_plural = _("Instrument Presets")


class EffectPreset(models.Model):
    """
    Represents a user-defined effect preset.
    """
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='effect_presets')
    effect = models.ForeignKey(Effect, on_delete=models.RESTRICT)
    preset_name = models.TextField()
    preset_parameters = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_public = models.BooleanField(default=False)

    def __str__(self):
        return self.preset_name

    class Meta:
        verbose_name = _("Effect Preset")
        verbose_name_plural = _("Effect Presets")


class SessionTemplate(models.Model):
    """
    Represents a session template.
    """
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='session_templates')
    template_name = models.TextField()
    template_data = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_public = models.BooleanField(default=False)

    def __str__(self):
        return self.template_name

    class Meta:
        verbose_name = _("Session Template")
        verbose_name_plural = _("Session Templates")


class ExportedFile(models.Model):
    """
    Represents an exported file.
    """
    id = models.BigAutoField(primary_key=True)
    session = models.ForeignKey(StudioSession, on_delete=models.CASCADE, related_name='exported_files')
    file_url = models.TextField()
    format = models.TextField()
    spatial_audio = models.BooleanField(default=False)
    cryptographic_signature = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return self.file_url

    class Meta:
        verbose_name = _("Exported File")
        verbose_name_plural = _("Exported Files")


class VrArSetting(models.Model):
    """
    Represents VR/AR settings for a session.
    """
    id = models.BigAutoField(primary_key=True)
    session = models.ForeignKey(StudioSession, on_delete=models.CASCADE, related_name='vr_ar_settings')
    config = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f"VR/AR Settings for {self.session.session_name}"

    class Meta:
        verbose_name = _("VR/AR Setting")
        verbose_name_plural = _("VR/AR Settings")


class AiSuggestion(models.Model):
    """
    Represents an AI-assisted suggestion.
    """
    id = models.BigAutoField(primary_key=True)
    session = models.ForeignKey(StudioSession, on_delete=models.CASCADE, related_name='ai_suggestions')
    suggestion_type = models.TextField(blank=True, null=True)
    suggestion_data = models.JSONField(blank=True, null=True)
    applied = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f"AI Suggestion for {self.session.session_name}"

    class Meta:
        verbose_name = _("AI Suggestion")
        verbose_name_plural = _("AI Suggestions")


class AdaptiveAutomationEvent(models.Model):
    """
    Represents an adaptive automation event.
    """
    id = models.BigAutoField(primary_key=True)
    session = models.ForeignKey(StudioSession, on_delete=models.CASCADE, related_name='automation_events')
    event_type = models.TextField(blank=True, null=True)
    event_details = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f"Adaptive Automation Event for {self.session.session_name}"

    class Meta:
        verbose_name = _("Adaptive Automation Event")
        verbose_name_plural = _("Adaptive Automation Events")

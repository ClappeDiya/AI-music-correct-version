from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings
import uuid
import secrets
from datetime import timedelta
from django.utils import timezone


class CollaborativeLyricSession(models.Model):
    """
    Represents a collaborative editing session for lyrics.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    final_lyrics = models.ForeignKey('FinalLyrics', on_delete=models.CASCADE, related_name='collaborative_sessions')
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='owned_lyric_sessions')
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = _("Collaborative Lyric Session")
        verbose_name_plural = _("Collaborative Lyric Sessions")
        indexes = [
            models.Index(fields=['owner'], name='idx_collab_owner'),
            models.Index(fields=['is_active'], name='idx_collab_active'),
        ]


class LyricShareLink(models.Model):
    """
    Represents a shareable link for collaborative lyric editing.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(CollaborativeLyricSession, on_delete=models.CASCADE, related_name='share_links')
    token = models.CharField(max_length=64, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    max_uses = models.IntegerField(null=True, blank=True)
    times_used = models.IntegerField(default=0)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_share_links')
    
    def save(self, *args, **kwargs):
        if not self.token:
            self.token = secrets.token_urlsafe(32)
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(days=7)
        super().save(*args, **kwargs)
    
    @property
    def is_valid(self):
        return (
            self.session.is_active and
            timezone.now() < self.expires_at and
            (self.max_uses is None or self.times_used < self.max_uses)
        )
    
    class Meta:
        verbose_name = _("Lyric Share Link")
        verbose_name_plural = _("Lyric Share Links")
        indexes = [
            models.Index(fields=['token'], name='idx_share_token'),
            models.Index(fields=['expires_at'], name='idx_share_expires'),
        ]


class CollaboratorPresence(models.Model):
    """
    Tracks collaborator presence and activity in a lyric editing session.
    """
    session = models.ForeignKey(CollaborativeLyricSession, on_delete=models.CASCADE, related_name='collaborator_presence')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    last_seen = models.DateTimeField(auto_now=True)
    cursor_position = models.IntegerField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    connected_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = _("Collaborator Presence")
        verbose_name_plural = _("Collaborator Presences")
        unique_together = [['session', 'user']]
        indexes = [
            models.Index(fields=['last_seen'], name='idx_collab_last_seen'),
            models.Index(fields=['is_active'], name='idx_collab_is_active'),
        ]


class CollaborativeEdit(models.Model):
    """
    Represents an edit made during a collaborative session.
    """
    id = models.BigAutoField(primary_key=True)
    session = models.ForeignKey(CollaborativeLyricSession, on_delete=models.CASCADE, related_name='collaborative_edits')
    editor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='collaborative_edits')
    content = models.TextField()
    edit_type = models.CharField(max_length=20, choices=[
        ('insert', 'Insert'),
        ('delete', 'Delete'),
        ('replace', 'Replace'),
    ])
    position = models.IntegerField()
    length = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = _("Collaborative Edit")
        verbose_name_plural = _("Collaborative Edits")
        indexes = [
            models.Index(fields=['session', 'created_at'], name='idx_collab_edit_time'),
        ]
        ordering = ['created_at']


class Language(models.Model):
    """
    Represents a language and its cultural context.
    This model stores language codes and names for global appeal.
    """
    id = models.BigAutoField(primary_key=True)
    code = models.TextField(unique=True, verbose_name=_("Language Code"), help_text=_("Language code (e.g., 'en', 'en-US', 'fr-FR')"))
    name = models.TextField(verbose_name=_("Language Name"), help_text=_("Name of the language"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("Date and time when the language was created"))

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = _("Language")
        verbose_name_plural = _("Languages")


class LyricInfluencer(models.Model):
    """
    Represents an influencer or thematic library for lyrics.
    This model stores names and style tags for future integrations.
    """
    id = models.BigAutoField(primary_key=True)
    name = models.TextField(unique=True, verbose_name=_("Influencer Name"), help_text=_("Name of the lyric influencer"))
    style_tags = models.JSONField(null=True, blank=True, verbose_name=_("Style Tags"), help_text=_("Style tags (e.g., genres, themes)"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("Date and time when the influencer was created"))

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = _("Lyric Influencer")
        verbose_name_plural = _("Lyric Influencers")


class LLMProvider(models.Model):
    """
    Represents a Language Model Provider.
    This model stores information about different LLM providers, such as their name, type, and API details.
    """
    id = models.BigAutoField(primary_key=True)
    name = models.TextField(unique=True, verbose_name=_("Provider Name"), help_text=_("Name of the LLM provider"))
    provider_type = models.TextField(verbose_name=_("Provider Type"), help_text=_("Type of the provider (e.g., 'open_source', 'third_party')"))
    api_endpoint = models.TextField(null=True, blank=True, verbose_name=_("API Endpoint"), help_text=_("API endpoint for the provider"))
    api_credentials = models.JSONField(null=True, blank=True, verbose_name=_("API Credentials"), help_text=_("API credentials for the provider"))
    active = models.BooleanField(default=True, verbose_name=_("Active"), help_text=_("Whether the provider is active"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("Date and time when the provider was created"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"), help_text=_("Date and time when the provider was last updated"))

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = _("LLM Provider")
        verbose_name_plural = _("LLM Providers")


class LyricPrompt(models.Model):
    """
    Represents a user's prompt for generating lyrics.
    This model stores the user's prompt text, parameters, and the associated LLM provider.
    """
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='lyric_prompts', verbose_name=_("User"), help_text=_("User who created the prompt"))
    provider = models.ForeignKey(LLMProvider, on_delete=models.RESTRICT, verbose_name=_("LLM Provider"), help_text=_("LLM provider used for generating lyrics"))
    prompt_text = models.TextField(verbose_name=_("Prompt Text"), help_text=_("User prompt (theme, keywords, emotion)"))
    parameters = models.JSONField(null=True, blank=True, verbose_name=_("Parameters"), help_text=_("Parameters for the prompt (e.g., complexity, rhyme scheme, language)"))
    language_code = models.TextField(null=True, blank=True, verbose_name=_("Language Code"), help_text=_("Language code for the prompt"))
    influencer = models.ForeignKey('LyricInfluencer', on_delete=models.SET_NULL, null=True, blank=True, verbose_name=_("Lyric Influencer"), help_text=_("Influencer for the prompt"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("Date and time when the prompt was created"))
    track_id = models.BigIntegerField(verbose_name=_("Track ID"), help_text=_("ID of the track associated with these lyrics"))

    def __str__(self):
        return f"Prompt by {self.user.username} - {self.prompt_text[:50]}..."

    class Meta:
        verbose_name = _("Lyric Prompt")
        verbose_name_plural = _("Lyric Prompts")
        indexes = [
            models.Index(fields=['user'], name='idx_lp_uid'),
            models.Index(fields=['influencer'], name='idx_lp_infl'),
        ]


class LyricDraft(models.Model):
    """
    Represents a draft of lyrics generated by an AI.
    This model stores the draft content, metadata, and the associated prompt.
    """
    id = models.BigAutoField(primary_key=True)
    prompt = models.ForeignKey(LyricPrompt, on_delete=models.CASCADE, related_name='lyric_drafts', verbose_name=_("Lyric Prompt"), help_text=_("Lyric prompt associated with this draft"))
    draft_content = models.TextField(null=True, blank=True, verbose_name=_("Draft Content"), help_text=_("The full drafted lyrics from the AI"))
    metadata = models.JSONField(null=True, blank=True, verbose_name=_("Metadata"), help_text=_("Additional info (e.g., rhyme score, syllable count)"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("Date and time when the draft was created"))

    def __str__(self):
        return f"Draft for {self.prompt.prompt_text[:50]}..."

    class Meta:
        verbose_name = _("Lyric Draft")
        verbose_name_plural = _("Lyric Drafts")


class LyricEdit(models.Model):
    """
    Represents a user's edits to a lyric draft.
    This model stores the edited content, edit notes, and the associated draft.
    """
    id = models.BigAutoField(primary_key=True)
    draft = models.ForeignKey(LyricDraft, on_delete=models.CASCADE, related_name='lyric_edits', verbose_name=_("Lyric Draft"), help_text=_("Lyric draft associated with this edit"))
    edited_content = models.TextField(null=True, blank=True, verbose_name=_("Edited Content"), help_text=_("The edited version after user changes"))
    edit_notes = models.TextField(null=True, blank=True, verbose_name=_("Edit Notes"), help_text=_("Reasoning or notes about changes"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("Date and time when the edit was created"))

    def __str__(self):
        return f"Edit for {self.draft.prompt.prompt_text[:50]}..."

    class Meta:
        verbose_name = _("Lyric Edit")
        verbose_name_plural = _("Lyric Edits")


class FinalLyrics(models.Model):
    """
    Represents the final version of lyrics chosen by the user.
    This model stores the final lyrics content, metadata, and the associated track.
    """
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='final_lyrics', verbose_name=_("User"), help_text=_("User who finalized the lyrics"))
    track_id = models.BigIntegerField(verbose_name=_("Track ID"), help_text=_("ID of the track associated with these lyrics"))
    lyrics_content = models.TextField(verbose_name=_("Lyrics Content"), help_text=_("Final lyrics text"))
    metadata = models.JSONField(null=True, blank=True, verbose_name=_("Metadata"), help_text=_("Additional info (e.g., language, final rhyme scheme)"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("Date and time when the final lyrics were created"))

    def __str__(self):
         return f"Final Lyrics for track {self.track_id} by {self.user.username}"

    class Meta:
        verbose_name = _("Final Lyrics")
        verbose_name_plural = _("Final Lyrics")
        indexes = [
            models.Index(fields=['user'], name='idx_fl_uid'),
            models.Index(fields=['lyrics_content'], name='idx_fl_cont'),
        ]


class LyricTimeline(models.Model):
    """
    Represents the timeline of lyrics synchronized with a track.
    This model stores the lyric segment, start time, and end time.
    """
    id = models.BigAutoField(primary_key=True)
    final_lyrics = models.ForeignKey(FinalLyrics, on_delete=models.CASCADE, related_name='lyric_timeline', verbose_name=_("Final Lyrics"), help_text=_("Final lyrics associated with this timeline"))
    lyric_segment = models.TextField(verbose_name=_("Lyric Segment"), help_text=_("A line or phrase of the lyrics"))
    start_time_seconds = models.DecimalField(max_digits=10, decimal_places=3, verbose_name=_("Start Time (seconds)"), help_text=_("When this lyric starts in the track"))
    end_time_seconds = models.DecimalField(max_digits=10, decimal_places=3, null=True, blank=True, verbose_name=_("End Time (seconds)"), help_text=_("When this lyric ends in the track (optional)"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("Date and time when the timeline was created"))

    def __str__(self):
        return f"Timeline for {self.final_lyrics.id} - {self.lyric_segment[:50]}..."

    class Meta:
        verbose_name = _("Lyric Timeline")
        verbose_name_plural = _("Lyric Timelines")
        constraints = [
            models.CheckConstraint(check=models.Q(start_time_seconds__gte=0), name='start_time_seconds_positive'),
            models.CheckConstraint(check=models.Q(end_time_seconds__gte=0), name='end_time_seconds_positive'),
            models.CheckConstraint(check=models.Q(end_time_seconds__gte=models.F('start_time_seconds')), name='end_time_after_start'),
        ]


class LyricModelVersion(models.Model):
    """
    Represents a version of the lyric generation model used.
    This model stores the model version, embeddings, and the associated prompt.
    """
    id = models.BigAutoField(primary_key=True)
    prompt = models.ForeignKey(LyricPrompt, on_delete=models.CASCADE, related_name='lyric_model_versions', verbose_name=_("Lyric Prompt"), help_text=_("Lyric prompt associated with this model version"))
    model_version = models.TextField(verbose_name=_("Model Version"), help_text=_("Version of the lyric generation model (e.g., 'v2.5')"))
    embeddings = models.JSONField(null=True, blank=True, verbose_name=_("Embeddings"), help_text=_("Embeddings or vector data representing the lyric style"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("Date and time when the model version was created"))

    def __str__(self):
        return f"Model version {self.model_version} for {self.prompt.prompt_text[:50]}..."

    class Meta:
        verbose_name = _("Lyric Model Version")
        verbose_name_plural = _("Lyric Model Versions")
        indexes = [
            models.Index(fields=['embeddings'], name='idx_lm_emb'),
        ]


class LyricVrArSettings(models.Model):
    """
    Represents VR/AR settings for displaying lyrics.
    This model stores the VR/AR configuration and the associated final lyrics.
    """
    id = models.BigAutoField(primary_key=True)
    final_lyrics = models.ForeignKey(FinalLyrics, on_delete=models.CASCADE, related_name='lyric_vr_ar_settings', verbose_name=_("Final Lyrics"), help_text=_("Final lyrics associated with these settings"))
    vr_ar_config = models.JSONField(null=True, blank=True, verbose_name=_("VR/AR Configuration"), help_text=_("VR/AR configuration (e.g., environment, text style, position)"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("Date and time when the settings were created"))

    def __str__(self):
        return f"VR/AR settings for {self.final_lyrics.id}"

    class Meta:
        verbose_name = _("Lyric VR/AR Settings")
        verbose_name_plural = _("Lyric VR/AR Settings")
        indexes = [
            models.Index(fields=['vr_ar_config'], name='idx_lva_conf'),
        ]


class LyricSignature(models.Model):
    """
    Represents a cryptographic signature for lyric originality.
    This model stores the signature hash and the associated final lyrics.
    """
    id = models.BigAutoField(primary_key=True)
    final_lyrics = models.ForeignKey(FinalLyrics, on_delete=models.CASCADE, related_name='lyric_signatures', verbose_name=_("Final Lyrics"), help_text=_("Final lyrics associated with this signature"))
    signature_hash = models.TextField(unique=True, verbose_name=_("Signature Hash"), help_text=_("Cryptographic hash of the lyrics content"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("Date and time when the signature was created"))

    def __str__(self):
        return f"Signature for {self.final_lyrics.id}"

    class Meta:
        verbose_name = _("Lyric Signature")
        verbose_name_plural = _("Lyric Signatures")
        constraints = [
            models.UniqueConstraint(fields=['final_lyrics'], name='unique_final_lyrics_signature')
        ]


class LyricAdaptiveFeedback(models.Model):
    """
    Represents user feedback for adaptive lyric generation.
    This model stores the event type, details, and the associated final lyrics.
    """
    id = models.BigAutoField(primary_key=True)
    final_lyrics = models.ForeignKey(FinalLyrics, on_delete=models.CASCADE, related_name='lyric_adaptive_feedback', verbose_name=_("Final Lyrics"), help_text=_("Final lyrics associated with this feedback"))
    event_type = models.TextField(verbose_name=_("Event Type"), help_text=_("Type of event (e.g., 'user_liked', 'user_skipped')"))
    event_details = models.JSONField(null=True, blank=True, verbose_name=_("Event Details"), help_text=_("Details about the event (e.g., timestamp, heart rate)"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("Date and time when the feedback was created"))

    def __str__(self):
        return f"Feedback for {self.final_lyrics.id} - {self.event_type}"

    class Meta:
        verbose_name = _("Lyric Adaptive Feedback")
        verbose_name_plural = _("Lyric Adaptive Feedback")
        indexes = [
            models.Index(fields=['event_details'], name='idx_laf_det'),
        ]

from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from django.db.models import JSONField


class LLMProvider(models.Model):
    """
    Represents a global LLM provider accessible to all tenants.
    Providers could be open-source models or external APIs (like OpenAI).
    """
    id = models.BigAutoField(primary_key=True, help_text=_("Unique identifier for the LLM provider."))
    name = models.CharField(max_length=255, unique=True, verbose_name=_("Provider Name"), help_text=_("e.g. 'open_source_llama', 'openai_gpt4'")) # e.g. 'open_source_llama', 'openai_gpt4'
    provider_type = models.CharField(max_length=255, verbose_name=_("Provider Type"), help_text=_("e.g. 'open_source', 'third_party'")) # e.g. 'open_source', 'third_party'
    api_endpoint = models.TextField(null=True, blank=True, verbose_name=_("API Endpoint"), help_text=_("Endpoint for LLM calls if external")) # endpoint for LLM calls if external
    api_credentials = JSONField(null=True, blank=True, verbose_name=_("API Credentials"), help_text=_("Store API keys/credentials encrypted externally")) # store API keys/credentials encrypted externally
    active = models.BooleanField(default=True, verbose_name=_("Active"), help_text=_("Indicates if the provider is active"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("Timestamp when the provider was created"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"), help_text=_("Timestamp when the provider was last updated"))

    class Meta:
        verbose_name = _("LLM Provider")
        verbose_name_plural = _("LLM Providers")

    def __str__(self):
        return self.name


class AIMusicRequest(models.Model):
    """
    Stores each user request for music generation.
    Linked to a user from the user management module.
    References a chosen LLM provider from shared.llm_providers.
    'prompt_text' is what user describes. 'status' to track lifecycle (e.g. 'pending', 'completed').
    """
    id = models.BigAutoField(primary_key=True, help_text=_("Unique identifier for the AI music request."))
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='ai_music_requests', verbose_name=_("User"), help_text=_("User who made the request"))
    provider = models.ForeignKey(LLMProvider, on_delete=models.RESTRICT, related_name='ai_music_requests', verbose_name=_("LLM Provider"), help_text=_("LLM provider used for the request"))
    prompt_text = models.TextField(verbose_name=_("Prompt Text"), help_text=_("Text prompt provided by the user"))
    status = models.CharField(max_length=255, default='pending', verbose_name=_("Status"), help_text=_("Request lifecycle: 'pending', 'in_progress', 'completed', 'failed'")) # request lifecycle: 'pending', 'in_progress', 'completed', 'failed'
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("Timestamp when the request was created"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"), help_text=_("Timestamp when the request was last updated"))

    class Meta:
        verbose_name = _("AI Music Request")
        verbose_name_plural = _("AI Music Requests")
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"Request by {self.user} - {self.prompt_text[:50]}..."


class AIMusicParams(models.Model):
    """
    Additional parameters for a request stored in JSONB for flexibility.
    Could include desired genres, complexity, tempo, emotional tone, etc.
    Kept separate for clarity and potential reuse.
    """
    id = models.BigAutoField(primary_key=True, help_text=_("Unique identifier for the AI music parameters."))
    request = models.ForeignKey(AIMusicRequest, on_delete=models.CASCADE, related_name='ai_music_params', verbose_name=_("AI Music Request"), help_text=_("AI music request these parameters belong to"))
    parameters = JSONField(null=True, blank=True, verbose_name=_("Parameters"), help_text=_("e.g., {\"genre\": \"jazz\", \"mood\": \"mellow\", \"instruments\": [\"synth\", \"sax\"], \"complexity\": \"medium\"}")) # e.g., {"genre": "jazz", "mood": "mellow", "instruments": ["synth", "sax"], "complexity": "medium"}
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("Timestamp when the parameters were created"))

    class Meta:
        verbose_name = _("AI Music Parameter")
        verbose_name_plural = _("AI Music Parameters")
        indexes = [
            models.Index(fields=['parameters'], name='idx_ai_music_params_parameters'),
        ]

    def __str__(self):
        return f"Parameters for request {self.request.id}"


class GeneratedTrack(models.Model):
    """
    Generated tracks from the AI. Once the request completes,
    we store links to the generated audio and possibly waveform or notation data in JSONB.
    'audio_file_url' could reference an external storage system (S3, GCS).
    'waveform_data' or 'notation_data' can hold structured info for visualization.
    """
    id = models.BigAutoField(primary_key=True, help_text=_("Unique identifier for the generated track."))
    request = models.ForeignKey(AIMusicRequest, on_delete=models.CASCADE, related_name='generated_tracks', verbose_name=_("AI Music Request"), help_text=_("AI music request this track belongs to"))
    audio_file_url = models.TextField(null=True, blank=True, verbose_name=_("Audio File URL"), help_text=_("Link to generated audio file")) # link to generated audio file
    waveform_data = JSONField(null=True, blank=True, verbose_name=_("Waveform Data"), help_text=_("Waveform info for visualization")) # waveform info for visualization
    notation_data = JSONField(null=True, blank=True, verbose_name=_("Notation Data"), help_text=_("Notation (MIDI-like data or symbolic representation)")) # notation (MIDI-like data or symbolic representation)
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("Timestamp when the track was created"))
    finalization_timestamp = models.DateTimeField(null=True, blank=True, verbose_name=_("Finalization Timestamp"), help_text=_("Timestamp when the track was finalized"))

    class Meta:
        verbose_name = _("Generated Track")
        verbose_name_plural = _("Generated Tracks")
        indexes = [
            models.Index(fields=['request']),
            models.Index(fields=['waveform_data'], name='idx_gen_tracks_waveform'),
        ]

    def __str__(self):
        return f"Track for request {self.request.id}"


class ModelUsageLog(models.Model):
    """
    Logs for each usage of the model during generation.
    Could store the raw prompt sent to the model, response time, tokens used, cost if any, or errors.
    """
    id = models.BigAutoField(primary_key=True, help_text=_("Unique identifier for the model usage log."))
    request = models.ForeignKey(AIMusicRequest, on_delete=models.CASCADE, related_name='model_usage_logs', verbose_name=_("AI Music Request"), help_text=_("AI music request this log belongs to"))
    provider = models.ForeignKey(LLMProvider, on_delete=models.RESTRICT, related_name='model_usage_logs', verbose_name=_("LLM Provider"), help_text=_("LLM provider used for this log"))
    prompt_sent = models.TextField(null=True, blank=True, verbose_name=_("Prompt Sent"), help_text=_("Raw prompt sent to the model"))
    response_metadata = JSONField(null=True, blank=True, verbose_name=_("Response Metadata"), help_text=_("Includes tokens count, latency, cost, error messages if any"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("Timestamp when the log was created"))

    class Meta:
        verbose_name = _("Model Usage Log")
        verbose_name_plural = _("Model Usage Logs")

    def __str__(self):
        return f"Log for request {self.request.id} using {self.provider.name}"


class SavedComposition(models.Model):
    """
    Represents a saved composition that can have multiple versions.
    Links to the user who owns it and provides metadata about the composition.
    """
    id = models.BigAutoField(primary_key=True, help_text=_("Unique identifier for the saved composition."))
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='saved_compositions', verbose_name=_("User"), help_text=_("User who owns the composition"))
    title = models.CharField(max_length=255, verbose_name=_("Title"), help_text=_("Title of the composition"))
    description = models.TextField(null=True, blank=True, verbose_name=_("Description"), help_text=_("Optional description of the composition"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("Timestamp when the composition was first saved"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"), help_text=_("Timestamp when the composition was last updated"))
    is_public = models.BooleanField(default=False, verbose_name=_("Is Public"), help_text=_("Whether the composition is publicly accessible"))
    tags = JSONField(null=True, blank=True, verbose_name=_("Tags"), help_text=_("Optional tags for categorizing the composition"))

    class Meta:
        verbose_name = _("Saved Composition")
        verbose_name_plural = _("Saved Compositions")
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['created_at']),
            models.Index(fields=['is_public']),
        ]
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} by {self.user}"


class CompositionVersion(models.Model):
    """
    Represents a specific version of a saved composition.
    Stores the actual music data and version metadata.
    """
    id = models.BigAutoField(primary_key=True, help_text=_("Unique identifier for the composition version."))
    composition = models.ForeignKey(SavedComposition, on_delete=models.CASCADE, related_name='versions', verbose_name=_("Composition"), help_text=_("The composition this version belongs to"))
    version_number = models.PositiveIntegerField(verbose_name=_("Version Number"), help_text=_("Sequential version number"))
    generated_track = models.ForeignKey(GeneratedTrack, on_delete=models.PROTECT, related_name='composition_versions', verbose_name=_("Generated Track"), help_text=_("The generated track for this version"))
    parameters = models.ForeignKey(AIMusicParams, on_delete=models.PROTECT, related_name='composition_versions', verbose_name=_("Parameters"), help_text=_("The parameters used for this version"))
    version_notes = models.TextField(null=True, blank=True, verbose_name=_("Version Notes"), help_text=_("Optional notes about this version"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("Timestamp when this version was created"))
    wav_file = models.FileField(upload_to='compositions/wav/%Y/%m/%d/', null=True, blank=True, verbose_name=_("WAV File"), help_text=_("WAV format audio file"))
    mp3_file = models.FileField(upload_to='compositions/mp3/%Y/%m/%d/', null=True, blank=True, verbose_name=_("MP3 File"), help_text=_("MP3 format audio file"))
    midi_file = models.FileField(upload_to='compositions/midi/%Y/%m/%d/', null=True, blank=True, verbose_name=_("MIDI File"), help_text=_("MIDI format file"))

    class Meta:
        verbose_name = _("Composition Version")
        verbose_name_plural = _("Composition Versions")
        unique_together = [['composition', 'version_number']]
        indexes = [
            models.Index(fields=['composition']),
            models.Index(fields=['version_number']),
            models.Index(fields=['created_at']),
        ]
        ordering = ['-version_number']

    def __str__(self):
        return f"{self.composition.title} v{self.version_number}"


class Genre(models.Model):
    """
    Represents a music genre for categorizing compositions.
    """
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=100, unique=True, verbose_name=_("Genre Name"))
    description = models.TextField(blank=True, verbose_name=_("Description"))
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _("Genre")
        verbose_name_plural = _("Genres")
        ordering = ['name']

    def __str__(self):
        return self.name


class Region(models.Model):
    """
    Represents a geographical region for analytics purposes.
    """
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=100, unique=True, verbose_name=_("Region Name"))
    code = models.CharField(max_length=10, unique=True, verbose_name=_("Region Code"))
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _("Region")
        verbose_name_plural = _("Regions")
        ordering = ['name']

    def __str__(self):
        return self.name


class ModelCapability(models.Model):
    """
    Defines specific capabilities of each LLM provider.
    This helps the model router determine which provider is best suited for each task.
    """
    id = models.BigAutoField(primary_key=True)
    provider = models.ForeignKey(LLMProvider, on_delete=models.CASCADE, related_name='capabilities')
    capability_type = models.CharField(max_length=255)
    confidence_score = models.FloatField()
    latency_ms = models.IntegerField()
    cost_per_request = models.DecimalField(max_digits=10, decimal_places=6, null=True, blank=True)
    max_input_length = models.IntegerField()

    class Meta:
        verbose_name = _("Model Capability")
        verbose_name_plural = _("Model Capabilities")
        unique_together = [['provider', 'capability_type']]
        indexes = [
            models.Index(fields=['provider', 'capability_type']),
            models.Index(fields=['capability_type', 'confidence_score']),
        ]

    def __str__(self):
        return f"{self.provider.name} - {self.capability_type}"


class ModelRouter(models.Model):
    """
    Routes music generation requests to the most appropriate LLM provider
    based on the task requirements and provider capabilities.
    """
    id = models.BigAutoField(primary_key=True)
    request = models.OneToOneField(AIMusicRequest, on_delete=models.CASCADE, related_name='router')
    selected_providers = models.ManyToManyField(LLMProvider, through='ModelRouterAssignment')
    routing_strategy = models.CharField(max_length=255)
    task_breakdown = JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = _("Model Router")
        verbose_name_plural = _("Model Routers")
        indexes = [
            models.Index(fields=['request']),
            models.Index(fields=['routing_strategy']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"Router for request {self.request.id}"


class ModelRouterAssignment(models.Model):
    """
    Maps specific tasks within a request to selected LLM providers.
    Tracks the status and results of each provider's contribution.
    """
    id = models.BigAutoField(primary_key=True)
    router = models.ForeignKey(ModelRouter, on_delete=models.CASCADE, related_name='assignments')
    provider = models.ForeignKey(LLMProvider, on_delete=models.CASCADE, related_name='router_assignments')
    task_type = models.CharField(max_length=255)
    status = models.CharField(max_length=255, default='pending')
    priority = models.IntegerField(default=0)
    result = JSONField(null=True, blank=True)
    error = JSONField(null=True, blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = _("Model Router Assignment")
        verbose_name_plural = _("Model Router Assignments")
        unique_together = [['router', 'provider', 'task_type']]
        indexes = [
            models.Index(fields=['router', 'status']),
            models.Index(fields=['provider', 'task_type']),
            models.Index(fields=['started_at']),
        ]
        ordering = ['priority']

    def __str__(self):
        return f"{self.provider.name} - {self.task_type} for router {self.router.id}"


class UserFeedback(models.Model):
    """
    Stores user feedback for reinforcement learning.
    Tracks user interactions and preferences for music generation.
    """
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='music_feedback')
    generated_track = models.ForeignKey(GeneratedTrack, on_delete=models.CASCADE, related_name='feedback')
    feedback_type = models.CharField(
        max_length=50,
        choices=[
            ('like', 'Like'),
            ('dislike', 'Dislike'),
            ('tweak', 'Tweak Request'),
            ('accept', 'Accept'),
            ('decline', 'Decline')
        ]
    )
    rating = models.IntegerField(
        null=True, 
        blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text=_("Optional rating from 1-5")
    )
    feedback_text = models.TextField(
        null=True, 
        blank=True,
        help_text=_("Detailed feedback or tweak instructions")
    )
    context = JSONField(
        null=True,
        blank=True,
        help_text=_("Additional context about the feedback (e.g., specific aspects liked/disliked)")
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _("User Feedback")
        verbose_name_plural = _("User Feedback")
        indexes = [
            models.Index(fields=['user', 'feedback_type']),
            models.Index(fields=['generated_track', 'feedback_type']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"Feedback from {self.user} on track {self.generated_track.id}"


class UserPreference(models.Model):
    """
    Stores learned user preferences for music generation.
    Updated through reinforcement learning from user feedback.
    """
    id = models.BigAutoField(primary_key=True)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='music_preferences')
    genre_weights = JSONField(
        default=dict,
        help_text=_("Weighted preferences for different genres")
    )
    instrument_weights = JSONField(
        default=dict,
        help_text=_("Weighted preferences for different instruments")
    )
    style_weights = JSONField(
        default=dict,
        help_text=_("Weighted preferences for different styles")
    )
    complexity_preference = models.FloatField(
        default=0.5,
        validators=[MinValueValidator(0), MaxValueValidator(1)],
        help_text=_("Preferred musical complexity (0-1)")
    )
    tempo_preference = JSONField(
        default=dict,
        help_text=_("Tempo range and weights")
    )
    learning_rate = models.FloatField(
        default=0.1,
        help_text=_("Rate at which preferences are updated from feedback")
    )
    exploration_rate = models.FloatField(
        default=0.2,
        help_text=_("Rate of exploring new musical elements vs exploiting known preferences")
    )
    last_updated = models.DateTimeField(auto_now=True)
    feedback_count = models.IntegerField(default=0)
    confidence_scores = JSONField(
        default=dict,
        help_text=_("Confidence in learned preferences for different aspects")
    )

    class Meta:
        verbose_name = _("User Preference")
        verbose_name_plural = _("User Preferences")
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['last_updated']),
        ]

    def __str__(self):
        return f"Preferences for {self.user}"

    def update_from_feedback(self, feedback: UserFeedback):
        """Update preferences based on new feedback using RL"""
        if feedback.feedback_type in ['like', 'accept']:
            self._reinforce_positive(feedback)
        elif feedback.feedback_type in ['dislike', 'decline']:
            self._reinforce_negative(feedback)
        elif feedback.feedback_type == 'tweak':
            self._process_tweak(feedback)
        
        self.feedback_count += 1
        self.save()

    def _reinforce_positive(self, feedback):
        """Strengthen weights for elements present in liked content"""
        track_data = feedback.generated_track.notation_data
        if not track_data:
            return
            
        # Update genre weights
        if 'genre' in track_data:
            current_weight = self.genre_weights.get(track_data['genre'], 0.5)
            self.genre_weights[track_data['genre']] = min(
                1.0,
                current_weight + (self.learning_rate * (1 - current_weight))
            )
            
        # Update other preferences similarly
        self._update_confidence('positive', feedback)

    def _reinforce_negative(self, feedback):
        """Reduce weights for elements present in disliked content"""
        track_data = feedback.generated_track.notation_data
        if not track_data:
            return
            
        # Update genre weights
        if 'genre' in track_data:
            current_weight = self.genre_weights.get(track_data['genre'], 0.5)
            self.genre_weights[track_data['genre']] = max(
                0.0,
                current_weight - (self.learning_rate * current_weight)
            )
            
        # Update other preferences similarly
        self._update_confidence('negative', feedback)

    def _process_tweak(self, feedback):
        """Process specific tweak requests to adjust preferences"""
        if not feedback.feedback_text:
            return
            
        # Use NLP to analyze feedback text and update relevant preferences
        # This is a placeholder for more sophisticated tweak processing
        self._update_confidence('tweak', feedback)

    def _update_confidence(self, feedback_type, feedback):
        """Update confidence scores based on feedback consistency"""
        for aspect, score in self.confidence_scores.items():
            # Increase confidence if feedback aligns with current preferences
            # Decrease slightly if it contradicts
            pass


class MusicTradition(models.Model):
    """Model for different musical traditions and their characteristics."""
    name = models.CharField(max_length=255)
    description = models.TextField()
    region = models.ForeignKey(Region, on_delete=models.SET_NULL, null=True)
    scale_system = models.JSONField(
        help_text="Definition of scales/modes used in this tradition"
    )
    rhythmic_patterns = models.JSONField(
        help_text="Common rhythmic patterns in this tradition"
    )
    typical_instruments = models.JSONField(
        help_text="Traditional instruments used"
    )
    melodic_patterns = models.JSONField(
        help_text="Characteristic melodic patterns/motifs"
    )
    model_weights = models.CharField(
        max_length=255,
        help_text="Path to specialized model weights for this tradition"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Music Tradition")
        verbose_name_plural = _("Music Traditions")
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['region']),
        ]

    def __str__(self):
        return self.name


class CrossCulturalBlend(models.Model):
    """Model for tracking cross-cultural music generation settings."""
    name = models.CharField(max_length=255)
    description = models.TextField()
    traditions = models.ManyToManyField(
        MusicTradition,
        through='TraditionBlendWeight'
    )
    blend_strategy = models.CharField(
        max_length=50,
        choices=[
            ('sequential', 'Sequential Sections'),
            ('layered', 'Layered Simultaneous'),
            ('fusion', 'Deep Fusion'),
        ],
        default='fusion'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Cross-Cultural Blend")
        verbose_name_plural = _("Cross-Cultural Blends")
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['blend_strategy']),
        ]

    def __str__(self):
        return self.name


class TraditionBlendWeight(models.Model):
    """Through model for weighted blending of traditions."""
    blend = models.ForeignKey(CrossCulturalBlend, on_delete=models.CASCADE)
    tradition = models.ForeignKey(MusicTradition, on_delete=models.CASCADE)
    weight = models.FloatField(
        default=1.0,
        validators=[
            MinValueValidator(0.0),
            MaxValueValidator(1.0)
        ]
    )
    section_order = models.IntegerField(
        null=True,
        blank=True,
        help_text="Order for sequential blending"
    )

    class Meta:
        verbose_name = _("Tradition Blend Weight")
        verbose_name_plural = _("Tradition Blend Weights")
        unique_together = [['blend', 'tradition']]
        indexes = [
            models.Index(fields=['blend', 'tradition']),
            models.Index(fields=['section_order']),
        ]

    def __str__(self):
        return f"{self.tradition.name} in {self.blend.name}"


class MultilingualLyrics(models.Model):
    """Model for managing multilingual lyrics generation."""
    track = models.ForeignKey(GeneratedTrack, on_delete=models.CASCADE)
    primary_language = models.CharField(max_length=10)
    translation_languages = models.JSONField(
        default=list,
        help_text="List of target languages for translations"
    )
    original_lyrics = models.TextField()
    translations = models.JSONField(
        default=dict,
        help_text="Mapped translations for each target language"
    )
    phonetic_guide = models.JSONField(
        default=dict,
        help_text="Pronunciation guides for non-native singers"
    )
    cultural_notes = models.JSONField(
        default=dict,
        help_text="Cultural context and meaning explanations"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Multilingual Lyrics")
        verbose_name_plural = _("Multilingual Lyrics")
        indexes = [
            models.Index(fields=['track']),
            models.Index(fields=['primary_language']),
        ]

    def __str__(self):
        return f"Lyrics for {self.track.id} in {self.primary_language}"


class TrackLayer(models.Model):
    """Represents a single instrument/track layer within a composition.
    Each layer can be a rhythm track, lead, percussion, vocals, etc."""
    id = models.BigAutoField(primary_key=True)
    composition = models.ForeignKey(SavedComposition, on_delete=models.CASCADE, related_name='track_layers')
    name = models.CharField(max_length=255, help_text=_("Name of the track layer (e.g., 'Lead Guitar', 'Drums')"))
    track_type = models.CharField(
        max_length=50,
        choices=[
            ('rhythm', 'Rhythm'),
            ('lead', 'Lead'),
            ('percussion', 'Percussion'),
            ('vocals', 'Vocals'),
            ('bass', 'Bass'),
            ('strings', 'Strings'),
            ('synth', 'Synthesizer'),
            ('effects', 'Effects'),
        ],
        help_text=_("Type of track layer")
    )
    instrument = models.CharField(max_length=255, help_text=_("Specific instrument for this track"))
    midi_channel = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(15)],
        help_text=_("MIDI channel (0-15) for this track")
    )
    volume = models.FloatField(
        default=1.0,
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)],
        help_text=_("Track volume (0.0-1.0)")
    )
    pan = models.FloatField(
        default=0.0,
        validators=[MinValueValidator(-1.0), MaxValueValidator(1.0)],
        help_text=_("Track panning (-1.0 left to 1.0 right)")
    )
    muted = models.BooleanField(default=False)
    soloed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Track Layer")
        verbose_name_plural = _("Track Layers")
        ordering = ['track_type', 'name']
        indexes = [
            models.Index(fields=['composition']),
            models.Index(fields=['track_type']),
        ]

    def __str__(self):
        return f"{self.name} ({self.track_type})"


class ArrangementSection(models.Model):
    """Represents a section in the hierarchical arrangement structure.
    Sections can be nested to create complex arrangements."""
    id = models.BigAutoField(primary_key=True)
    composition = models.ForeignKey(SavedComposition, on_delete=models.CASCADE, related_name='arrangement_sections')
    parent_section = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='subsections',
        help_text=_("Parent section for nested arrangements")
    )
    name = models.CharField(max_length=255, help_text=_("Section name (e.g., 'Intro', 'Verse 1', 'Bridge')"))
    section_type = models.CharField(
        max_length=50,
        choices=[
            ('intro', 'Introduction'),
            ('verse', 'Verse'),
            ('chorus', 'Chorus'),
            ('bridge', 'Bridge'),
            ('solo', 'Solo'),
            ('outro', 'Outro'),
            ('transition', 'Transition'),
            ('breakdown', 'Breakdown'),
        ],
        help_text=_("Type of arrangement section")
    )
    start_time = models.FloatField(help_text=_("Start time in seconds"))
    duration = models.FloatField(help_text=_("Duration in seconds"))
    tempo = models.IntegerField(
        validators=[MinValueValidator(20), MaxValueValidator(300)],
        help_text=_("Tempo in BPM")
    )
    key_signature = models.CharField(max_length=50, help_text=_("Key signature for this section"))
    time_signature = models.CharField(
        max_length=10,
        default='4/4',
        help_text=_("Time signature (e.g., '4/4', '3/4', '6/8')")
    )
    complexity = models.FloatField(
        default=0.5,
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)],
        help_text=_("Complexity level of this section (0.0-1.0)")
    )
    energy_level = models.FloatField(
        default=0.5,
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)],
        help_text=_("Energy level of this section (0.0-1.0)")
    )
    section_metadata = JSONField(
        default=dict,
        help_text=_("Additional metadata for the section")
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Arrangement Section")
        verbose_name_plural = _("Arrangement Sections")
        ordering = ['start_time']
        indexes = [
            models.Index(fields=['composition']),
            models.Index(fields=['parent_section']),
            models.Index(fields=['section_type']),
        ]

    def __str__(self):
        return f"{self.name} ({self.section_type})"


class TrackAutomation(models.Model):
    """Stores automation data for track parameters (volume, pan, effects, etc.)."""
    id = models.BigAutoField(primary_key=True)
    track = models.ForeignKey(TrackLayer, on_delete=models.CASCADE, related_name='automations')
    parameter_name = models.CharField(
        max_length=50,
        choices=[
            ('volume', 'Volume'),
            ('pan', 'Panning'),
            ('reverb', 'Reverb'),
            ('delay', 'Delay'),
            ('filter', 'Filter'),
            ('distortion', 'Distortion'),
        ],
        help_text=_("Parameter being automated")
    )
    automation_data = JSONField(
        help_text=_("Time-value pairs for automation")
    )
    interpolation_type = models.CharField(
        max_length=50,
        choices=[
            ('linear', 'Linear'),
            ('exponential', 'Exponential'),
            ('step', 'Step'),
        ],
        default='linear',
        help_text=_("How to interpolate between automation points")
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Track Automation")
        verbose_name_plural = _("Track Automations")
        unique_together = [['track', 'parameter_name']]
        indexes = [
            models.Index(fields=['track', 'parameter_name']),
        ]

    def __str__(self):
        return f"{self.parameter_name} automation for {self.track}"


class VocalLine(models.Model):
    """Represents a vocal line within a composition, supporting both lead and harmony parts."""
    id = models.BigAutoField(primary_key=True)
    composition = models.ForeignKey(SavedComposition, on_delete=models.CASCADE, related_name='vocal_lines')
    track = models.OneToOneField(TrackLayer, on_delete=models.CASCADE, related_name='vocal_line')
    voice_type = models.CharField(
        max_length=50,
        choices=[
            ('soprano', 'Soprano'),
            ('alto', 'Alto'),
            ('tenor', 'Tenor'),
            ('bass', 'Bass'),
            ('lead', 'Lead'),
            ('backing', 'Backing'),
        ],
        help_text=_("Type/register of the vocal line")
    )
    is_harmony = models.BooleanField(default=False, help_text=_("Whether this is a harmony part"))
    harmony_role = models.CharField(
        max_length=50,
        choices=[
            ('root', 'Root'),
            ('third', 'Third'),
            ('fifth', 'Fifth'),
            ('seventh', 'Seventh'),
            ('custom', 'Custom'),
        ],
        null=True,
        blank=True,
        help_text=_("Role in harmony stack")
    )
    vocal_range = JSONField(
        default=dict,
        help_text=_("Min/max note range for this vocal line")
    )
    synthesis_params = JSONField(
        default=dict,
        help_text=_("Parameters for voice synthesis")
    )
    melody_data = JSONField(
        help_text=_("Melodic line data (notes, timing, etc.)")
    )
    lyrics_alignment = JSONField(
        null=True,
        blank=True,
        help_text=_("Timing alignment between lyrics and melody")
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Vocal Line")
        verbose_name_plural = _("Vocal Lines")
        ordering = ['voice_type']
        indexes = [
            models.Index(fields=['composition']),
            models.Index(fields=['voice_type']),
        ]

    def __str__(self):
        return f"{self.voice_type} vocal line"


class HarmonyGroup(models.Model):
    """Groups related vocal lines into a harmony stack."""
    id = models.BigAutoField(primary_key=True)
    composition = models.ForeignKey(SavedComposition, on_delete=models.CASCADE, related_name='harmony_groups')
    name = models.CharField(max_length=255, help_text=_("Name of the harmony group"))
    vocal_lines = models.ManyToManyField(
        VocalLine,
        through='HarmonyVoicing',
        related_name='harmony_groups',
        help_text=_("Vocal lines in this harmony group")
    )
    voicing_type = models.CharField(
        max_length=50,
        choices=[
            ('2part', '2-Part'),
            ('3part', '3-Part'),
            ('4part', '4-Part'),
            ('custom', 'Custom'),
        ],
        help_text=_("Type of harmony voicing")
    )
    chord_progression = JSONField(
        help_text=_("Underlying chord progression for harmonization")
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Harmony Group")
        verbose_name_plural = _("Harmony Groups")
        indexes = [
            models.Index(fields=['composition']),
            models.Index(fields=['voicing_type']),
        ]

    def __str__(self):
        return f"{self.name} ({self.voicing_type})"


class HarmonyVoicing(models.Model):
    """Through model for vocal lines in a harmony group, with specific voicing details."""
    id = models.BigAutoField(primary_key=True)
    harmony_group = models.ForeignKey(HarmonyGroup, on_delete=models.CASCADE)
    vocal_line = models.ForeignKey(VocalLine, on_delete=models.CASCADE)
    voice_order = models.IntegerField(help_text=_("Order in the harmony stack (0 = bottom)"))
    transposition = models.IntegerField(
        default=0,
        help_text=_("Semitone transposition from root")
    )
    volume_adjustment = models.FloatField(
        default=0.0,
        help_text=_("Volume adjustment in dB")
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Harmony Voicing")
        verbose_name_plural = _("Harmony Voicings")
        ordering = ['voice_order']
        unique_together = [['harmony_group', 'voice_order']]
        indexes = [
            models.Index(fields=['harmony_group', 'vocal_line']),
        ]

    def __str__(self):
        return f"Voice {self.voice_order} in {self.harmony_group}"


class MasteringPreset(models.Model):
    """Represents a mastering preset with specific audio processing parameters."""
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=255, help_text=_("Name of the mastering preset"))
    description = models.TextField(help_text=_("Description of the sonic character"))
    preset_type = models.CharField(
        max_length=50,
        choices=[
            ('punchy', 'Loud and Punchy'),
            ('warm', 'Warm and Dynamic'),
            ('modern', 'Modern and Clean'),
            ('vintage', 'Vintage and Colored'),
            ('reference', 'Reference Based'),
            ('custom', 'Custom'),
        ],
        help_text=_("Type of mastering preset")
    )
    eq_settings = JSONField(
        help_text=_("Equalizer settings for different frequency bands")
    )
    dynamics_settings = JSONField(
        help_text=_("Compressor and limiter settings")
    )
    stereo_settings = JSONField(
        help_text=_("Stereo imaging and width settings")
    )
    saturation_settings = JSONField(
        null=True,
        blank=True,
        help_text=_("Harmonic enhancement settings")
    )
    target_lufs = models.FloatField(
        default=-14.0,
        help_text=_("Target integrated loudness in LUFS")
    )
    target_peak = models.FloatField(
        default=-1.0,
        help_text=_("Target true peak in dBFS")
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Mastering Preset")
        verbose_name_plural = _("Mastering Presets")
        indexes = [
            models.Index(fields=['preset_type']),
        ]

    def __str__(self):
        return f"{self.name} ({self.preset_type})"


class MasteringSession(models.Model):
    """Represents a mastering session for a composition version."""
    id = models.BigAutoField(primary_key=True)
    composition_version = models.ForeignKey(
        CompositionVersion,
        on_delete=models.CASCADE,
        related_name='mastering_sessions'
    )
    preset = models.ForeignKey(
        MasteringPreset,
        on_delete=models.PROTECT,
        related_name='sessions'
    )
    reference_track = models.FileField(
        upload_to='mastering/references/%Y/%m/%d/',
        null=True,
        blank=True,
        help_text=_("Optional reference track for matching")
    )
    reference_analysis = JSONField(
        null=True,
        blank=True,
        help_text=_("Spectral and dynamic analysis of reference track")
    )
    processing_status = models.CharField(
        max_length=50,
        choices=[
            ('pending', 'Pending'),
            ('analyzing', 'Analyzing'),
            ('processing', 'Processing'),
            ('completed', 'Completed'),
            ('failed', 'Failed'),
        ],
        default='pending'
    )
    processing_log = JSONField(
        default=list,
        help_text=_("Log of processing steps and measurements")
    )
    output_file = models.FileField(
        upload_to='mastering/output/%Y/%m/%d/',
        null=True,
        blank=True,
        help_text=_("Mastered output file")
    )
    output_analysis = JSONField(
        null=True,
        blank=True,
        help_text=_("Analysis of the mastered output")
    )
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = _("Mastering Session")
        verbose_name_plural = _("Mastering Sessions")
        indexes = [
            models.Index(fields=['composition_version']),
            models.Index(fields=['processing_status']),
        ]

    def __str__(self):
        return f"Mastering session for {self.composition_version}"


class SpectralMatch(models.Model):
    """
    Stores spectral matching data between a mastering session and its reference.
    """
    id = models.BigAutoField(primary_key=True)
    mastering_session = models.OneToOneField(
        MasteringSession,
        on_delete=models.CASCADE,
        related_name='spectral_match'
    )
    frequency_match = JSONField(
        help_text=_("Frequency response matching data")
    )
    dynamics_match = JSONField(
        help_text=_("Dynamic range matching data")
    )
    stereo_match = JSONField(
        help_text=_("Stereo field matching data")
    )
    match_quality = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)],
        help_text=_("Overall match quality score (0-1)")
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _("Spectral Match")
        verbose_name_plural = _("Spectral Matches")
        indexes = [
            models.Index(fields=['mastering_session']),
        ]

    def __str__(self):
        return f"Match for {self.mastering_session}"


class CreativeChallenge(models.Model):
    """
    Represents a community co-creation challenge for AI music generation.
    """
    id = models.BigAutoField(primary_key=True)
    title = models.CharField(max_length=255)
    description = models.TextField()
    challenge_type = models.CharField(
        max_length=50,
        choices=[
            ('remix', 'Remix Challenge'),
            ('genre_fusion', 'Genre Fusion'),
            ('mood_based', 'Mood Based'),
            ('cultural_blend', 'Cultural Blend'),
            ('collaborative', 'Collaborative Creation')
        ]
    )
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    max_participants = models.IntegerField(null=True, blank=True)
    reward_badge = models.CharField(max_length=100, null=True, blank=True)
    requirements = JSONField(default=dict)
    ai_parameters = JSONField(default=dict)
    status = models.CharField(
        max_length=20,
        choices=[
            ('draft', 'Draft'),
            ('active', 'Active'),
            ('completed', 'Completed'),
            ('archived', 'Archived')
        ],
        default='draft'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Creative Challenge")
        verbose_name_plural = _("Creative Challenges")
        indexes = [
            models.Index(fields=['challenge_type', 'status']),
            models.Index(fields=['start_date', 'end_date']),
        ]

    def __str__(self):
        return self.title


class ChallengeSubmission(models.Model):
    """
    Represents a submission to a creative challenge.
    """
    id = models.BigAutoField(primary_key=True)
    challenge = models.ForeignKey(
        CreativeChallenge,
        on_delete=models.CASCADE,
        related_name='submissions'
    )
    composition = models.ForeignKey(
        SavedComposition,
        on_delete=models.CASCADE,
        related_name='challenge_submissions'
    )
    participant = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='challenge_submissions'
    )
    ai_contribution_score = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)],
        help_text=_("AI's contribution level in the creation (0-1)")
    )
    community_rating = models.FloatField(
        null=True,
        blank=True,
        validators=[MinValueValidator(0.0), MaxValueValidator(5.0)],
        help_text=_("Average community rating (0-5)")
    )
    submission_notes = models.TextField(blank=True)
    badges_earned = JSONField(default=list)
    moderation_status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending Review'),
            ('approved', 'Approved'),
            ('flagged', 'Flagged for Review'),
            ('rejected', 'Rejected')
        ],
        default='pending'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _("Challenge Submission")
        verbose_name_plural = _("Challenge Submissions")
        indexes = [
            models.Index(fields=['challenge', 'moderation_status']),
            models.Index(fields=['community_rating']),
        ]
        unique_together = ['challenge', 'composition']

    def __str__(self):
        return f"{self.participant}'s submission to {self.challenge.title}"


class ContentModeration(models.Model):
    """
    Handles AI-driven content moderation for compositions.
    """
    id = models.BigAutoField(primary_key=True)
    composition = models.ForeignKey(
        SavedComposition,
        on_delete=models.CASCADE,
        related_name='moderation_checks'
    )
    check_type = models.CharField(
        max_length=50,
        choices=[
            ('copyright', 'Copyright Check'),
            ('content_safety', 'Content Safety'),
            ('quality', 'Quality Assessment'),
            ('originality', 'Originality Check')
        ]
    )
    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('processing', 'Processing'),
            ('passed', 'Passed'),
            ('flagged', 'Flagged'),
            ('failed', 'Failed')
        ],
        default='pending'
    )
    check_results = JSONField(default=dict)
    confidence_score = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)],
        help_text=_("Confidence level of the check result (0-1)")
    )
    admin_reviewed = models.BooleanField(default=False)
    admin_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Content Moderation")
        verbose_name_plural = _("Content Moderations")
        indexes = [
            models.Index(fields=['check_type', 'status']),
            models.Index(fields=['confidence_score']),
        ]

    def __str__(self):
        return f"{self.check_type} check for {self.composition}"

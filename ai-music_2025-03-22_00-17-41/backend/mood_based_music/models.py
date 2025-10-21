from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from django.db.models import JSONField
from django.contrib.postgres.fields import ArrayField

class Mood(models.Model):
    """
    Represents a predefined global mood.
    """
    id = models.BigAutoField(primary_key=True)
    name = models.TextField(unique=True, verbose_name=_("Mood Name"), help_text=_("Name of the mood (e.g., uplifting, melancholic)."))
    description = models.TextField(null=True, blank=True, verbose_name=_("Description"), help_text=_("Description of the mood."))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("Timestamp when the mood was created."))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"), help_text=_("Timestamp when the mood was last updated."))

    class Meta:
        verbose_name = _("Mood")
        verbose_name_plural = _("Moods")
        ordering = ["name"]

    def __str__(self):
        return self.name


class CustomMood(models.Model):
    """
    Represents a user-defined custom mood or emotional palette.
    """
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, verbose_name=_("User"), help_text=_("User who created the custom mood."))
    mood_name = models.TextField(verbose_name=_("Mood Name"), help_text=_("Name of the custom mood."))
    mood_parameters = JSONField(null=True, blank=True, verbose_name=_("Mood Parameters"), help_text=_("JSON object containing mood parameters (e.g., warmth, energy)."))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("Timestamp when the custom mood was created."))

    class Meta:
        verbose_name = _("Custom Mood")
        verbose_name_plural = _("Custom Moods")
        ordering = ["mood_name"]

    def __str__(self):
        return f"{self.mood_name} by {self.user.username}"


class MoodRequest(models.Model):
    """
    Represents a user's request for mood-based music generation.
    """
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, verbose_name=_("User"), help_text=_("User who made the mood request."))
    selected_mood = models.ForeignKey(Mood, on_delete=models.RESTRICT, null=True, blank=True, verbose_name=_("Selected Mood"), help_text=_("Predefined mood selected by the user."))
    custom_mood = models.ForeignKey(CustomMood, on_delete=models.SET_NULL, null=True, blank=True, verbose_name=_("Custom Mood"), help_text=_("Custom mood selected by the user."))
    intensity = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, verbose_name=_("Intensity"), help_text=_("Intensity of the mood (0.0 to 1.0)."))
    parameters = JSONField(null=True, blank=True, verbose_name=_("Parameters"), help_text=_("JSON object containing additional parameters (e.g., tempo bias, instrumentation)."))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("Timestamp when the mood request was created."))

    class Meta:
        verbose_name = _("Mood Request")
        verbose_name_plural = _("Mood Requests")
        ordering = ["-created_at"]

    def __str__(self):
        return f"Mood request by {self.user.username} at {self.created_at}"


class GeneratedMoodTrack(models.Model):
    """
    Represents a generated music track resulting from a mood request.
    """
    id = models.BigAutoField(primary_key=True)
    mood_request = models.ForeignKey(MoodRequest, on_delete=models.CASCADE, verbose_name=_("Mood Request"), help_text=_("Mood request that generated this track."))
    track_id = models.BigIntegerField(null=True, blank=True, verbose_name=_("Track ID"), help_text=_("Reference to a global track ID if available."))
    file_url = models.TextField(null=True, blank=True, verbose_name=_("File URL"), help_text=_("URL of the generated track file."))
    metadata = JSONField(null=True, blank=True, verbose_name=_("Metadata"), help_text=_("JSON object containing track metadata (e.g., duration, format)."))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("Timestamp when the track was generated."))

    class Meta:
        verbose_name = _("Generated Mood Track")
        verbose_name_plural = _("Generated Mood Tracks")
        ordering = ["-created_at"]

    def __str__(self):
        return f"Track for request {self.mood_request.id} at {self.created_at}"


class MoodFeedback(models.Model):
    """
    Represents user feedback on a generated music track.
    """
    id = models.BigAutoField(primary_key=True)
    generated_track = models.ForeignKey(GeneratedMoodTrack, on_delete=models.CASCADE, verbose_name=_("Generated Track"), help_text=_("Generated track that the feedback is for."))
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, verbose_name=_("User"), help_text=_("User who provided the feedback."))
    feedback_type = models.TextField(null=True, blank=True, verbose_name=_("Feedback Type"), help_text=_("Type of feedback (e.g., like, dislike, neutral)."))
    feedback_notes = models.TextField(null=True, blank=True, verbose_name=_("Feedback Notes"), help_text=_("Additional notes about the feedback."))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("Timestamp when the feedback was created."))

    class Meta:
        verbose_name = _("Mood Feedback")
        verbose_name_plural = _("Mood Feedbacks")
        ordering = ["-created_at"]

    def __str__(self):
        return f"Feedback by {self.user.username} on {self.generated_track.id} at {self.created_at}"


class MoodProfile(models.Model):
    """
    Represents a user's mood preferences over time.
    """
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, verbose_name=_("User"), help_text=_("User who owns the mood profile."))
    aggregated_preferences = JSONField(null=True, blank=True, verbose_name=_("Aggregated Preferences"), help_text=_("JSON object containing aggregated mood preferences."))
    last_updated = models.DateTimeField(auto_now=True, verbose_name=_("Last Updated"), help_text=_("Timestamp when the mood profile was last updated."))

    class Meta:
        verbose_name = _("Mood Profile")
        verbose_name_plural = _("Mood Profiles")
        ordering = ["-last_updated"]

    def __str__(self):
        return f"Mood profile for {self.user.username}"

class ExternalMoodReference(models.Model):
    """
    Represents external mood references (e.g., weather influence, global trend).
    """
    id = models.BigAutoField(primary_key=True)
    reference_type = models.TextField(verbose_name=_("Reference Type"), help_text=_("Type of reference (e.g., weather_influence, global_trend)."))
    data = JSONField(null=True, blank=True, verbose_name=_("Data"), help_text=_("JSON object containing reference data."))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("Timestamp when the reference was created."))

    class Meta:
        verbose_name = _("External Mood Reference")
        verbose_name_plural = _("External Mood References")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.reference_type} at {self.created_at}"

class MoodEmbedding(models.Model):
    """
    Represents a user's mood embedding vector.
    """
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, verbose_name=_("User"), help_text=_("User who owns the mood embedding."))
    embedding_vector = models.BinaryField(verbose_name=_("Embedding Vector"), help_text=_("Vector data representing the mood embedding."))
    dimensionality = models.IntegerField(verbose_name=_("Dimensionality"), help_text=_("Number of dimensions in the emotional embedding."))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("Timestamp when the embedding was created."))

    class Meta:
        verbose_name = _("Mood Embedding")
        verbose_name_plural = _("Mood Embeddings")
        ordering = ["-created_at"]

    def __str__(self):
        return f"Mood embedding for {self.user.username}"

class ContextualTrigger(models.Model):
    """
    Represents contextual triggers that influence mood.
    """
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, verbose_name=_("User"), help_text=_("User who owns the contextual trigger."))
    trigger_data = JSONField(null=True, blank=True, verbose_name=_("Trigger Data"), help_text=_("JSON object containing trigger data (e.g., time of day, weather)."))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("Timestamp when the trigger was created."))

    class Meta:
        verbose_name = _("Contextual Trigger")
        verbose_name_plural = _("Contextual Triggers")
        ordering = ["-created_at"]

    def __str__(self):
        return f"Contextual trigger for {self.user.username} at {self.created_at}"

class LiveMoodSession(models.Model):
    """
    Represents a live mood session with dynamic mood parameters.
    """
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, verbose_name=_("User"), help_text=_("User who owns the live mood session."))
    session_name = models.TextField(null=True, blank=True, verbose_name=_("Session Name"), help_text=_("Name of the live mood session."))
    active = models.BooleanField(default=True, verbose_name=_("Active"), help_text=_("Indicates if the session is currently active."))
    current_mood_state = JSONField(null=True, blank=True, verbose_name=_("Current Mood State"), help_text=_("JSON object containing dynamic mood parameters."))
    last_update = models.DateTimeField(auto_now=True, verbose_name=_("Last Update"), help_text=_("Timestamp when the mood session was last updated."))

    class Meta:
        verbose_name = _("Live Mood Session")
        verbose_name_plural = _("Live Mood Sessions")
        ordering = ["-last_update"]

    def __str__(self):
        return f"Live mood session for {self.user.username} at {self.last_update}"

class CollaborativeMoodSpace(models.Model):
    """
    Represents a collaborative mood space with multiple users.
    """
    id = models.BigAutoField(primary_key=True)
    space_name = models.TextField(verbose_name=_("Space Name"), help_text=_("Name of the collaborative mood space."))
    participant_ids = ArrayField(models.BigIntegerField(), verbose_name=_("Participant IDs"), help_text=_("Array of user IDs participating in the mood space."))
    combined_mood_state = JSONField(null=True, blank=True, verbose_name=_("Combined Mood State"), help_text=_("JSON object containing the blended mood from all participants."))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("Timestamp when the mood space was created."))

    class Meta:
        verbose_name = _("Collaborative Mood Space")
        verbose_name_plural = _("Collaborative Mood Spaces")
        ordering = ["-created_at"]

    def __str__(self):
        return f"Collaborative mood space {self.space_name} at {self.created_at}"

class AdvancedMoodParameter(models.Model):
    """
    Represents advanced mood parameters for fine-tuning the AI model.
    """
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, verbose_name=_("User"), help_text=_("User who owns the advanced mood parameter."))
    model_tweaks = JSONField(null=True, blank=True, verbose_name=_("Model Tweaks"), help_text=_("JSON object containing model tweaks (e.g., layer adjustments, tonal bias)."))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("Timestamp when the parameter was created."))

    class Meta:
        verbose_name = _("Advanced Mood Parameter")
        verbose_name_plural = _("Advanced Mood Parameters")
        ordering = ["-created_at"]

    def __str__(self):
        return f"Advanced mood parameter for {self.user.username} at {self.created_at}"

class MoodPlaylist(models.Model):
    """
    Represents a mood-based playlist.
    """
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, verbose_name=_("User"), help_text=_("User who owns the mood playlist."))
    playlist_name = models.TextField(verbose_name=_("Playlist Name"), help_text=_("Name of the mood playlist."))
    mood_profile = JSONField(null=True, blank=True, verbose_name=_("Mood Profile"), help_text=_("JSON object containing the mood profile for the playlist."))
    auto_update = models.BooleanField(default=True, verbose_name=_("Auto Update"), help_text=_("Indicates if the playlist should auto-update based on mood."))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("Timestamp when the playlist was created."))

    class Meta:
        verbose_name = _("Mood Playlist")
        verbose_name_plural = _("Mood Playlists")
        ordering = ["-created_at"]

    def __str__(self):
        return f"Mood playlist {self.playlist_name} for {self.user.username}"

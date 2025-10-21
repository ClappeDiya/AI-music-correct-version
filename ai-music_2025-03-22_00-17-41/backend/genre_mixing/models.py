from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from django.db.models import JSONField
from django.contrib.auth.models import User


class Genre(models.Model):
    """
    Genre model for categorizing music
    """
    id = models.BigAutoField(primary_key=True)
    genre_name = models.TextField(verbose_name=_("Genre Name"), help_text=_("The unique name of the genre."))
    description = models.TextField(blank=True, null=True, verbose_name=_("Description"), help_text=_("A brief description of the genre."))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("The date and time when the genre was created."))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"), help_text=_("The date and time when the genre was last updated."))
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='mixing_created_genres',
        verbose_name=_("Created By")
    )

    def __str__(self):
        return self.genre_name

    class Meta:
        verbose_name = _("Genre")
        verbose_name_plural = _("Genres")
        ordering = ["genre_name"]


class MixingSession(models.Model):
    """
    Table representing a user's genre mixing session.
    A session tracks which user started it, when, and possibly a name or title.
    "status" could reflect if a session is 'in_progress', 'completed', etc.
    """
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='mixing_sessions', verbose_name=_("User"), help_text=_("The user who started the mixing session.")) # The user who started the mixing session
    session_name = models.TextField(blank=True, null=True, verbose_name=_("Session Name"), help_text=_("The name of the mixing session.")) # The name of the mixing session
    status = models.TextField(default='in_progress', verbose_name=_("Status"), help_text=_("The status of the mixing session (e.g., in_progress, completed).")) # The status of the mixing session (e.g., in_progress, completed)
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("The date and time when the mixing session was created.")) # The date and time when the mixing session was created
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"), help_text=_("The date and time when the mixing session was last updated.")) # The date and time when the mixing session was last updated

    class Meta:
        verbose_name = _("Mixing Session") # Human-readable name for the model
        verbose_name_plural = _("Mixing Sessions") # Human-readable name for the model in plural
        ordering = ["-created_at"] # Default ordering for the model
        indexes = [
            models.Index(fields=['user']), # Index on user_id for faster queries
            models.Index(fields=['status']), # Index on status for faster queries
        ]

    def __str__(self):
        return f"{self.session_name} - {self.user.username}" # Human-readable representation of the model


class MixingSessionGenre(models.Model):
    """
    Bridge table linking a mixing session to multiple genres, storing each genre's relative contribution.
    "percentage" or "weight" determines how much a given genre influences the final mix.
    """
    id = models.BigAutoField(primary_key=True)
    session = models.ForeignKey(MixingSession, on_delete=models.CASCADE, related_name='session_genres', verbose_name=_("Mixing Session"), help_text=_("The mixing session this genre is associated with.")) # The mixing session this genre is associated with
    genre = models.ForeignKey(Genre, on_delete=models.RESTRICT, related_name='session_genres', verbose_name=_("Genre"), help_text=_("The genre associated with the mixing session.")) # The genre associated with the mixing session
    weight = models.DecimalField(max_digits=5, decimal_places=2, verbose_name=_("Weight"), help_text=_("The weight or percentage of the genre in the mix."), default=0) # The weight or percentage of the genre in the mix

    class Meta:
        verbose_name = _("Mixing Session Genre") # Human-readable name for the model
        verbose_name_plural = _("Mixing Session Genres") # Human-readable name for the model in plural
        unique_together = ['session', 'genre'] # Ensure that a genre is not added multiple times to the same session

    def __str__(self):
        return f"{self.session} - {self.genre} ({self.weight}%)" # Human-readable representation of the model


class MixingSessionParams(models.Model):
    """
    JSONB parameters capturing instrument balance, effects, energy levels, etc.
    Flexible schema allows adding new parameters without altering the database structure.
    """
    id = models.BigAutoField(primary_key=True)
    session = models.ForeignKey(MixingSession, on_delete=models.CASCADE, related_name='session_params', verbose_name=_("Mixing Session"), help_text=_("The mixing session these parameters are associated with.")) # The mixing session these parameters are associated with
    parameters = JSONField(blank=True, null=True, verbose_name=_("Parameters"), help_text=_("JSONB parameters for the mixing session (e.g., instrument balance, effects).")) # JSONB parameters for the mixing session (e.g., instrument balance, effects)
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("The date and time when the parameters were created.")) # The date and time when the parameters were created

    class Meta:
        verbose_name = _("Mixing Session Parameter") # Human-readable name for the model
        verbose_name_plural = _("Mixing Session Parameters") # Human-readable name for the model in plural
        indexes = [
            models.Index(fields=['parameters'], name='idx_mixing_params'), # GIN index for JSONB field
        ]

    def __str__(self):
        return f"Parameters for {self.session}" # Human-readable representation of the model


class MixingOutput(models.Model):
    """
    Final output of a mixing session, referencing the generated track.
    This could store a URL to the generated audio file or a reference to another module's track ID.
    notation_data can hold chord progressions or waveform_data for visualization.
    """
    id = models.BigAutoField(primary_key=True)
    session = models.ForeignKey(MixingSession, on_delete=models.CASCADE, related_name='mixing_outputs', verbose_name=_("Mixing Session"), help_text=_("The mixing session this output is associated with.")) # The mixing session this output is associated with
    audio_file_url = models.TextField(blank=True, null=True, verbose_name=_("Audio File URL"), help_text=_("Link to the generated track audio file (S3, GCS, etc.).")) # Link to the generated track audio file (S3, GCS, etc.)
    notation_data = JSONField(blank=True, null=True, verbose_name=_("Notation Data"), help_text=_("JSON representation of musical structure, chord progressions.")) # JSON representation of musical structure, chord progressions
    waveform_data = JSONField(blank=True, null=True, verbose_name=_("Waveform Data"), help_text=_("Waveform info for visualizations.")) # Waveform info for visualizations
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("The date and time when the output was created.")) # The date and time when the output was created
    finalization_timestamp = models.DateTimeField(blank=True, null=True, verbose_name=_("Finalization Timestamp"), help_text=_("The date and time when the mixing session was finalized.")) # The date and time when the mixing session was finalized

    class Meta:
        verbose_name = _("Mixing Output") # Human-readable name for the model
        verbose_name_plural = _("Mixing Outputs") # Human-readable name for the model in plural
        indexes = [
            models.Index(fields=['notation_data'], name='idx_output_notation'), # GIN index for JSONB field
            models.Index(fields=['waveform_data'], name='idx_output_waveform'), # GIN index for JSONB field
        ]

    def __str__(self):
        return f"Output for {self.session}" # Human-readable representation of the model


class TrackReference(models.Model):
    """
    Track reference model for managing versions and sharing
    """
    id = models.BigAutoField(primary_key=True)
    title = models.TextField(verbose_name=_("Title"))
    artist = models.TextField(verbose_name=_("Artist"))
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='mixing_track_references')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} by {self.artist}"

    class Meta:
        verbose_name = _("Track Reference")
        verbose_name_plural = _("Track References")

from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from user_management.models import User

class Track(models.Model):
    """
    A global track model, shared across all users.
    """
    id = models.BigAutoField(primary_key=True, editable=False)
    title = models.TextField(verbose_name=_("Title"), help_text=_("Title of the track"))
    artist = models.TextField(verbose_name=_("Artist"), help_text=_("Artist of the track"), null=True, blank=True)
    album = models.TextField(verbose_name=_("Album"), help_text=_("Album of the track"), null=True, blank=True)
    duration_seconds = models.IntegerField(verbose_name=_("Duration (seconds)"), help_text=_("Duration of the track in seconds"), null=True, blank=True)
    genre = models.TextField(verbose_name=_("Genre"), help_text=_("Genre of the track"), null=True, blank=True)
    original_language = models.CharField(max_length=10, verbose_name=_("Original Language"), 
                                       help_text=_("ISO 639-1 language code of the original track"), 
                                       default='en')
    available_translations = models.JSONField(verbose_name=_("Available Translations"), 
                                            help_text=_("List of available language codes for this track"), 
                                            default=list)
    metadata = models.JSONField(verbose_name=_("Additional Metadata"), 
                              help_text=_("Additional track metadata like mood, energy, etc."), 
                              null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"))

    class Meta:
        verbose_name = _("Track")
        verbose_name_plural = _("Tracks")
        db_table = 'tracks'
        indexes = [
            models.Index(fields=['original_language']),
        ]

    def __str__(self):
        return self.title

    def get_translation(self, language_code):
        """
        Get track metadata in the specified language
        """
        try:
            return self.translations.get(language_code=language_code)
        except TrackTranslation.DoesNotExist:
            return None

    def get_lyrics(self, language_code=None):
        """
        Get track lyrics in the specified language or original language if not specified
        """
        if language_code:
            try:
                return self.lyrics.get(language_code=language_code)
            except TrackLyrics.DoesNotExist:
                pass
        
        # Fallback to original language
        try:
            return self.lyrics.get(is_original=True)
        except TrackLyrics.DoesNotExist:
            return None

    def update_available_translations(self):
        """
        Update the list of available translations
        """
        translations = set(self.translations.values_list('language_code', flat=True))
        lyrics = set(self.lyrics.values_list('language_code', flat=True))
        self.available_translations = list(translations.union(lyrics))
        self.save(update_fields=['available_translations'])


class TrackTranslation(models.Model):
    """
    Stores translations of track metadata in different languages.
    """
    id = models.BigAutoField(primary_key=True, editable=False)
    track = models.ForeignKey('Track', on_delete=models.CASCADE, related_name='translations')
    language_code = models.CharField(max_length=10, verbose_name=_("Language Code"), help_text=_("ISO 639-1 language code"))
    title = models.TextField(verbose_name=_("Translated Title"))
    artist = models.TextField(verbose_name=_("Translated Artist Name"), null=True, blank=True)
    album = models.TextField(verbose_name=_("Translated Album Name"), null=True, blank=True)
    description = models.TextField(verbose_name=_("Translated Description"), null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Track Translation")
        verbose_name_plural = _("Track Translations")
        unique_together = ['track', 'language_code']
        indexes = [
            models.Index(fields=['track', 'language_code']),
        ]
        db_table = 'track_translations'

    def __str__(self):
        return f"{self.track.title} ({self.language_code})"


class TrackLyrics(models.Model):
    """
    Stores track lyrics with translations and timestamps.
    """
    id = models.BigAutoField(primary_key=True, editable=False)
    track = models.ForeignKey('Track', on_delete=models.CASCADE, related_name='lyrics')
    language_code = models.CharField(max_length=10, verbose_name=_("Language Code"), help_text=_("ISO 639-1 language code"))
    is_original = models.BooleanField(verbose_name=_("Is Original Language"), default=False)
    lyrics_text = models.TextField(verbose_name=_("Lyrics Text"))
    lyrics_with_timestamps = models.JSONField(verbose_name=_("Timestamped Lyrics"), 
                                            help_text=_("JSON array of {start_time, end_time, text} objects"), 
                                            null=True, blank=True)
    translation_source = models.CharField(max_length=50, verbose_name=_("Translation Source"), null=True, blank=True)
    verified = models.BooleanField(verbose_name=_("Verified Translation"), default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Track Lyrics")
        verbose_name_plural = _("Track Lyrics")
        unique_together = ['track', 'language_code']
        indexes = [
            models.Index(fields=['track', 'language_code']),
        ]
        db_table = 'track_lyrics'

    def __str__(self):
        return f"{self.track.title} lyrics ({self.language_code})"

    def get_snippet(self, max_length=100):
        """
        Get a representative snippet of the lyrics
        """
        if not self.lyrics_text:
            return ""
        
        # Try to get a complete verse or chorus
        paragraphs = self.lyrics_text.split('\n\n')
        for para in paragraphs:
            if len(para.strip()) <= max_length:
                return para.strip()
        
        # Fallback to first few lines
        return self.lyrics_text[:max_length].rsplit('\n', 1)[0]


class AIDJSession(models.Model):
    """
    Represents an AI DJ session for a user.
    """
    VOICE_STYLE_CHOICES = [
        ('formal', _('Formal')),
        ('casual', _('Casual')),
        ('energetic', _('Energetic')),
        ('calm', _('Calm')),
    ]

    id = models.BigAutoField(primary_key=True, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name=_("User"), help_text=_("User associated with the session"), related_name='ai_dj_sessions')
    mood_settings = models.JSONField(verbose_name=_("Mood Settings"), help_text=_("JSON object storing mood settings"), null=True, blank=True)
    last_voice_command = models.TextField(verbose_name=_("Last Voice Command"), help_text=_("Last voice command given by the user"), null=True, blank=True)
    command_language = models.CharField(verbose_name=_("Command Language"), help_text=_("Language of the last voice command (ISO 639-1)"), max_length=10, default='en')
    preferred_language = models.CharField(verbose_name=_("Preferred Language"), help_text=_("User's preferred language for voice commands (ISO 639-1)"), max_length=10, default='en')
    voice_style = models.CharField(verbose_name=_("Voice Style"), help_text=_("Preferred style of DJ announcements"), max_length=20, choices=VOICE_STYLE_CHOICES, default='casual')
    voice_accent = models.CharField(verbose_name=_("Voice Accent"), help_text=_("Preferred regional accent for TTS"), max_length=20, null=True, blank=True)
    announcement_frequency = models.CharField(verbose_name=_("Announcement Frequency"), help_text=_("How often the DJ should make announcements"), 
                                           max_length=20, default='medium', 
                                           choices=[('low', _('Low')), ('medium', _('Medium')), ('high', _('High'))])
    enable_announcements = models.BooleanField(verbose_name=_("Enable Announcements"), help_text=_("Whether DJ announcements are enabled"), default=True)
    last_announcement = models.TextField(verbose_name=_("Last Announcement"), help_text=_("Last announcement made by the DJ"), null=True, blank=True)
    announcement_templates = models.JSONField(verbose_name=_("Announcement Templates"), help_text=_("Language-specific templates for announcements"), default=dict)
    supported_languages = models.JSONField(verbose_name=_("Supported Languages"), help_text=_("List of languages supported for voice commands"), default=list)
    command_mappings = models.JSONField(verbose_name=_("Command Mappings"), help_text=_("Multilingual command mappings and their standardized actions"), default=dict)
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"), help_text=_("Timestamp when the session was last updated"))

    class Meta:
        verbose_name = _("AI DJ Session")
        verbose_name_plural = _("AI DJ Sessions")
        indexes = [
            models.Index(fields=['user'], name='idx_ai_dj_sessions_user'),
        ]
        db_table = 'ai_dj_sessions'

    def __str__(self):
        return f"AI DJ Session for {self.user}"

    def detect_command_language(self, command_text):
        """
        Detects the language of the given command text.
        Returns ISO 639-1 language code.
        """
        try:
            from langdetect import detect
            return detect(command_text)
        except:
            return self.preferred_language

    def get_command_action(self, command_text):
        """
        Maps a voice command in any supported language to its standardized action.
        """
        command_lang = self.detect_command_language(command_text)
        self.command_language = command_lang
        self.save(update_fields=['command_language'])
        
        # Get language-specific command mappings
        lang_mappings = self.command_mappings.get(command_lang, {})
        
        # Try to match the command
        for pattern, action in lang_mappings.items():
            if pattern.lower() in command_text.lower():
                return action
                
        # Fallback to English if no match found
        return None

    def get_announcement_template(self, template_key):
        """
        Get a language-specific announcement template
        """
        templates = self.announcement_templates.get(self.preferred_language, {})
        return templates.get(template_key, templates.get('default', ''))

    def format_announcement(self, template_key, **kwargs):
        """
        Format an announcement using a template and provided variables
        """
        template = self.get_announcement_template(template_key)
        try:
            return template.format(**kwargs)
        except KeyError:
            return template


class AIDJPlayHistory(models.Model):
    """
    Logs the play history of tracks for a user.
    """
    id = models.BigAutoField(primary_key=True, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name=_("User"), help_text=_("User who played the track"), related_name='ai_dj_play_histories')
    track = models.ForeignKey(Track, on_delete=models.RESTRICT, verbose_name=_("Track"), help_text=_("Track that was played"))
    played_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Played At"), help_text=_("Timestamp when the track was played"))

    class Meta:
        verbose_name = _("AI DJ Play History")
        verbose_name_plural = _("AI DJ Play Histories")
        indexes = [
            models.Index(fields=['user'], name='idx_ai_dj_play_history_user'),
        ]
        db_table = 'ai_dj_play_history'

    def __str__(self):
        return f"{self.track.title} played by {self.user} at {self.played_at}"


class AIDJRecommendation(models.Model):
    """
    Stores AI DJ recommendations for a user.
    """
    id = models.BigAutoField(primary_key=True, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name=_("User"), help_text=_("User for whom the recommendation was made"), related_name='ai_dj_recommendations')
    recommendation_data = models.JSONField(verbose_name=_("Recommendation Data"), help_text=_("JSON object storing recommendation data"), null=True, blank=True)
    recommended_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Recommended At"), help_text=_("Timestamp when the recommendation was made"))

    class Meta:
        verbose_name = _("AI DJ Recommendation")
        verbose_name_plural = _("AI DJ Recommendations")
        indexes = [
            models.Index(fields=['user'], name='idx_ai_dj_recommendations_user'),
        ]
        db_table = 'ai_dj_recommendations'

    def __str__(self):
        return f"Recommendation for {self.user} at {self.recommended_at}"


class AIDJFeedback(models.Model):
    """
    Stores user feedback on AI DJ recommendations.
    """
    id = models.BigAutoField(primary_key=True, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name=_("User"), help_text=_("User who provided the feedback"), related_name='ai_dj_feedbacks')
    track = models.ForeignKey(Track, on_delete=models.RESTRICT, verbose_name=_("Track"), help_text=_("Track that the feedback is about"), null=True, blank=True)
    recommendation = models.ForeignKey(AIDJRecommendation, on_delete=models.CASCADE, verbose_name=_("Recommendation"), help_text=_("Recommendation that the feedback is about"), null=True, blank=True)
    feedback_type = models.TextField(verbose_name=_("Feedback Type"), help_text=_("Type of feedback (like, dislike, skip)"), null=True, blank=True)
    feedback_notes = models.TextField(verbose_name=_("Feedback Notes"), help_text=_("Additional notes about the feedback"), null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("Timestamp when the feedback was created"))

    class Meta:
        verbose_name = _("AI DJ Feedback")
        verbose_name_plural = _("AI DJ Feedbacks")
        indexes = [
            models.Index(fields=['user'], name='idx_ai_dj_feedback_user'),
        ]
        db_table = 'ai_dj_feedback'

    def __str__(self):
        return f"Feedback from {self.user} on {self.track or self.recommendation}"


class AIDJSavedSet(models.Model):
    """
    Stores AI DJ saved sets/playlists for a user.
    """
    id = models.BigAutoField(primary_key=True, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name=_("User"), help_text=_("User who saved the set"), related_name='ai_dj_saved_sets')
    set_name = models.TextField(verbose_name=_("Set Name"), help_text=_("Name of the saved set"), null=True, blank=True)
    track_list = models.JSONField(verbose_name=_("Track List"), help_text=_("JSON object storing the list of tracks in the set"), null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("Timestamp when the set was created"))

    class Meta:
        verbose_name = _("AI DJ Saved Set")
        verbose_name_plural = _("AI DJ Saved Sets")
        indexes = [
            models.Index(fields=['user'], name='idx_ai_dj_saved_sets_user'),
        ]
        db_table = 'ai_dj_saved_sets'

    def __str__(self):
        return f"{self.set_name} by {self.user}"

from django.db import models
from django.utils.translation import gettext_lazy as _
from django.db.models import JSONField
from user_management.models import User


class Language(models.Model):
    id = models.BigAutoField(primary_key=True)
    language_code = models.TextField(unique=True, verbose_name=_("Language Code"), help_text=_("e.g., 'en', 'fr', 'es'"))  # e.g., "en", "fr", "es"
    language_name = models.TextField(verbose_name=_("Language Name"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))

    def __str__(self):
        return self.language_name

    class Meta:
        verbose_name = _("Language")
        verbose_name_plural = _("Languages")


class Locale(models.Model):
    id = models.BigAutoField(primary_key=True)
    language = models.ForeignKey(Language, on_delete=models.RESTRICT, verbose_name=_("Language"), help_text=_("The language this locale is associated with"))
    region_code = models.TextField(null=True, blank=True, verbose_name=_("Region Code"), help_text=_("e.g., 'US', 'FR', 'JP'"))  # "US","FR","JP"
    date_format = models.TextField(null=True, blank=True, verbose_name=_("Date Format"), help_text=_("e.g., 'MM/DD/YYYY'"))  # "MM/DD/YYYY"
    currency_symbol = models.TextField(null=True, blank=True, verbose_name=_("Currency Symbol"), help_text=_("e.g., '$', '€', '¥'"))  # "$","€","¥"
    numeric_format = JSONField(null=True, blank=True, verbose_name=_("Numeric Format"), help_text=_("e.g., {'decimal_separator':'.','thousand_separator':','}"))  # {"decimal_separator":".","thousand_separator":","}
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))

    def __str__(self):
        return f"{self.language.language_name} - {self.region_code}" if self.region_code else self.language.language_name

    class Meta:
        verbose_name = _("Locale")
        verbose_name_plural = _("Locales")
        unique_together = ('language', 'region_code')


class UserAccessibilitySettings(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name=_("User"), help_text=_("The user these settings belong to"))
    settings = JSONField(verbose_name=_("Settings"), help_text=_("e.g., {'text_size':'large','color_contrast':'high','screen_reader_support':true}"))  # {"text_size":"large","color_contrast":"high","screen_reader_support":true}
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"))

    def __str__(self):
        return f"Accessibility settings for {self.user.email}"

    class Meta:
        verbose_name = _("User Accessibility Setting")
        verbose_name_plural = _("User Accessibility Settings")
        unique_together = ('user',)


class Translation(models.Model):
    id = models.BigAutoField(primary_key=True)
    key = models.TextField(verbose_name=_("Key"), help_text=_("e.g., 'home_page.title'"))  # e.g. "home_page.title"
    language = models.ForeignKey(Language, on_delete=models.RESTRICT, verbose_name=_("Language"), help_text=_("The language this translation is for"))
    translated_text = models.TextField(verbose_name=_("Translated Text"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"))

    def __str__(self):
        return f"{self.key} - {self.language.language_code}"

    class Meta:
        verbose_name = _("Translation")
        verbose_name_plural = _("Translations")
        unique_together = ('key', 'language')


class LocalizedFormat(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name=_("User"), help_text=_("The user these formats are for, if applicable"))
    locale = models.ForeignKey(Locale, on_delete=models.RESTRICT, verbose_name=_("Locale"), help_text=_("The base locale for these formats"))
    override_formats = JSONField(null=True, blank=True, verbose_name=_("Override Formats"), help_text=_("e.g., {'date_format':'DD/MM/YYYY','currency_symbol':'£'}"))  # {"date_format":"DD/MM/YYYY","currency_symbol":"£"}
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"))

    def __str__(self):
         return f"Localized formats for {self.user.email if self.user else 'default'} - {self.locale}"

    class Meta:
        verbose_name = _("Localized Format")
        verbose_name_plural = _("Localized Formats")


class GenreLocalization(models.Model):
    id = models.BigAutoField(primary_key=True)
    genre_id = models.BigIntegerField(verbose_name=_("Genre ID"), help_text=_("The ID of the genre being localized"))
    language = models.ForeignKey(Language, on_delete=models.RESTRICT, verbose_name=_("Language"), help_text=_("The language this localization is for"))
    localized_name = models.TextField(verbose_name=_("Localized Name"))
    localized_description = models.TextField(null=True, blank=True, verbose_name=_("Localized Description"))
    is_default = models.BooleanField(default=False, verbose_name=_("Is Default"), help_text=_("Indicates if this is the default translation for this genre"))
    fallback_order = models.PositiveSmallIntegerField(default=0, verbose_name=_("Fallback Order"), help_text=_("Order in which translations should be tried as fallbacks"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"))

    def __str__(self):
        return f"{self.localized_name} ({self.language.language_code})"

    class Meta:
        verbose_name = _("Genre Localization")
        verbose_name_plural = _("Genre Localizations")
        unique_together = ('genre_id', 'language')
        ordering = ['language__language_code', 'fallback_order']

class UserGenrePreferences(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name=_("User"), help_text=_("The user these preferences belong to"))
    genre_id = models.BigIntegerField(verbose_name=_("Genre ID"), help_text=_("The ID of the genre being customized"))
    preferred_name = models.TextField(null=True, blank=True, verbose_name=_("Preferred Name"), help_text=_("User's preferred name for this genre"))
    preferred_description = models.TextField(null=True, blank=True, verbose_name=_("Preferred Description"), help_text=_("User's preferred description for this genre"))
    is_shared = models.BooleanField(default=False, verbose_name=_("Is Shared"), help_text=_("Indicates if this preference is shared with other users"))
    shared_by = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='shared_genre_preferences', verbose_name=_("Shared By"), help_text=_("User who shared this preference, if applicable"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"))

    def __str__(self):
        return f"Genre preferences for {self.user.email} - {self.genre_id}"

    class Meta:
        verbose_name = _("User Genre Preference")
        verbose_name_plural = _("User Genre Preferences")
        unique_together = ('user', 'genre_id')
        ordering = ['user__email', 'genre_id']


class AdvancedAdaptationSettings(models.Model):
    id = models.BigAutoField(primary_key=True)
    adaptation_rules = JSONField(null=True, blank=True, verbose_name=_("Adaptation Rules"), help_text=_("e.g., {'auto_simplify_language':true,'sign_language_preferred':true,'complexity_threshold':0.8}"))  # {"auto_simplify_language":true,"sign_language_preferred":true,"complexity_threshold":0.8}
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"))

    def __str__(self):
        return f"Advanced adaptation settings (ID: {self.id})"

    class Meta:
        verbose_name = _("Advanced Adaptation Setting")
        verbose_name_plural = _("Advanced Adaptation Settings")


class SignLanguageAsset(models.Model):
    id = models.BigAutoField(primary_key=True)
    translation_key = models.TextField(verbose_name=_("Translation Key"), help_text=_("Link to a translations key to provide sign-language video"))  # link to a translations key to provide sign-language video
    asset_url = models.TextField(verbose_name=_("Asset URL"), help_text=_("Link to a sign-language video asset"))  # link to a sign-language video asset
    language = models.ForeignKey(Language, on_delete=models.RESTRICT, verbose_name=_("Language"), help_text=_("The sign language variant, possibly a pseudo-language code"))  # The sign language variant, possibly a pseudo-language code
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"))

    def __str__(self):
        return f"Sign language asset for {self.translation_key} ({self.language.language_code})"

    class Meta:
        verbose_name = _("Sign Language Asset")
        verbose_name_plural = _("Sign Language Assets")
        unique_together = ('translation_key', 'language')


class BrailleHapticProfile(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name=_("User"), help_text=_("The user this profile is for, if applicable"))
    profile_data = JSONField(null=True, blank=True, verbose_name=_("Profile Data"), help_text=_("e.g., {'braille_patterns':{'A':'⠁','B':'⠃'},'haptic_patterns':{'notification':'long_vibrate'}}"))  # {"braille_patterns":{"A":"⠁","B":"⠃"},"haptic_patterns":{"notification":"long_vibrate"}}
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"))

    def __str__(self):
        return f"Braille/Haptic profile for {self.user.email if self.user else 'default'}"

    class Meta:
        verbose_name = _("Braille/Haptic Profile")
        verbose_name_plural = _("Braille/Haptic Profiles")


class VoiceSynthesisProfile(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name=_("User"), help_text=_("The user this profile is for, if applicable"))
    synthesis_params = JSONField(null=True, blank=True, verbose_name=_("Synthesis Parameters"), help_text=_("e.g., {'voice_pitch':1.2,'speech_rate':0.9,'accent':'British','voice_gender':'female'}"))  # {"voice_pitch":1.2,"speech_rate":0.9,"accent":"British","voice_gender":"female"}
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"))

    def __str__(self):
        return f"Voice synthesis profile for {self.user.email if self.user else 'default'}"

    class Meta:
        verbose_name = _("Voice Synthesis Profile")
        verbose_name_plural = _("Voice Synthesis Profiles")


class CulturalNuance(models.Model):
    id = models.BigAutoField(primary_key=True)
    language = models.ForeignKey(Language, on_delete=models.RESTRICT, verbose_name=_("Language"), help_text=_("The language this cultural nuance is for"))
    key = models.TextField(verbose_name=_("Key"), help_text=_("e.g., 'greeting_formal', 'music_instruction_jazz_swing'"))  # "greeting_formal","music_instruction_jazz_swing"
    nuance_data = JSONField(verbose_name=_("Nuance Data"), help_text=_("e.g., {'description':'formal greeting in Japanese includes a bow','localized_phrases':['...']}"))  # {"description":"formal greeting in Japanese includes a bow","localized_phrases":["..."]}
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"))

    def __str__(self):
        return f"Cultural nuance for {self.key} ({self.language.language_code})"

    class Meta:
        verbose_name = _("Cultural Nuance")
        verbose_name_plural = _("Cultural Nuances")
        unique_together = ('language', 'key')


class AccessibilityUsageLog(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name=_("User"), help_text=_("The user who performed the action, if applicable"))
    action_type = models.TextField(verbose_name=_("Action Type"), help_text=_("e.g., 'increase_text_size', 'enable_sign_language_overlay'"))  # "increase_text_size","enable_sign_language_overlay"
    context = JSONField(null=True, blank=True, verbose_name=_("Context"), help_text=_("e.g., {'previous_setting':'medium','new_setting':'large'}"))  # {"previous_setting":"medium","new_setting":"large"}
    occurred_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Occurred At"))

    def __str__(self):
        return f"Accessibility usage log for {self.user.email if self.user else 'default'} - {self.action_type}"

    class Meta:
        verbose_name = _("Accessibility Usage Log")
        verbose_name_plural = _("Accessibility Usage Logs")


class AccessibilityRecommendation(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name=_("User"), help_text=_("The user this recommendation is for, if applicable"))
    recommendation_data = JSONField(null=True, blank=True, verbose_name=_("Recommendation Data"), help_text=_("e.g., {'suggested_changes':{'text_size':'x-large'},'confidence':0.95}"))  # {"suggested_changes":{"text_size":"x-large"},"confidence":0.95}
    generated_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Generated At"))

    def __str__(self):
        return f"Accessibility recommendation for {self.user.email if self.user else 'default'}"

    class Meta:
        verbose_name = _("Accessibility Recommendation")
        verbose_name_plural = _("Accessibility Recommendations")


class ScriptLayoutRule(models.Model):
    id = models.BigAutoField(primary_key=True)
    language = models.ForeignKey(Language, on_delete=models.RESTRICT, verbose_name=_("Language"), help_text=_("The language this layout rule is for"))
    layout_data = JSONField(verbose_name=_("Layout Data"), help_text=_("e.g., {'direction':'rtl','fallback_fonts':['NotoSansArabic'],'line_spacing_adjustment':1.1}"))  # {"direction":"rtl","fallback_fonts":["NotoSansArabic"],"line_spacing_adjustment":1.1}
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"))

    def __str__(self):
        return f"Script layout rule for {self.language.language_code}"

    class Meta:
        verbose_name = _("Script Layout Rule")
        verbose_name_plural = _("Script Layout Rules")
        unique_together = ('language',)

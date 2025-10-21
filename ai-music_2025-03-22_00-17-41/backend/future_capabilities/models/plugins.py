from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator


class PluginDeveloper(models.Model):
    """
    Model for managing third-party plugin developers.
    """
    user_id = models.IntegerField(
        verbose_name=_("User ID")
    )
    company_name = models.CharField(
        max_length=100,
        verbose_name=_("Company Name")
    )
    website = models.URLField(
        blank=True,
        verbose_name=_("Website")
    )
    api_key = models.CharField(
        max_length=64,
        unique=True,
        verbose_name=_("API Key")
    )
    is_verified = models.BooleanField(
        default=False,
        verbose_name=_("Verified Status")
    )
    verification_date = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_("Verification Date")
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_("Created At")
    )

    class Meta:
        verbose_name = _("Plugin Developer")
        verbose_name_plural = _("Plugin Developers")
        indexes = [
            models.Index(fields=['user_id'], name='idx_developer_user')
        ]

    def __str__(self):
        return f"{self.company_name} ({self.api_key})"


class Plugin(models.Model):
    """
    Model for third-party plugins with versioning and certification.
    """
    developer = models.ForeignKey(
        PluginDeveloper,
        on_delete=models.CASCADE,
        related_name='plugins',
        verbose_name=_("Developer")
    )
    name = models.CharField(
        max_length=100,
        verbose_name=_("Plugin Name")
    )
    type = models.CharField(
        max_length=50,
        choices=[
            ('instrument', 'Instrument'),
            ('effect', 'Effect'),
            ('ai_model', 'AI Model'),
            ('visualization', 'Visualization'),
            ('analysis', 'Analysis Tool')
        ],
        verbose_name=_("Plugin Type")
    )
    version = models.CharField(
        max_length=20,
        verbose_name=_("Version")
    )
    description = models.TextField(
        verbose_name=_("Description")
    )
    icon_url = models.URLField(
        blank=True,
        verbose_name=_("Icon URL")
    )
    entry_point = models.CharField(
        max_length=200,
        verbose_name=_("Entry Point")
    )
    is_certified = models.BooleanField(
        default=False,
        verbose_name=_("Certification Status")
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name=_("Active Status")
    )
    certification_date = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_("Certification Date")
    )
    required_permissions = models.JSONField(
        default=list,
        verbose_name=_("Required Permissions")
    )
    compatibility = models.JSONField(
        default=dict,
        verbose_name=_("Compatibility Info")
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_("Created At")
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name=_("Updated At")
    )

    class Meta:
        verbose_name = _("Plugin")
        verbose_name_plural = _("Plugins")
        unique_together = ['developer', 'name', 'version']
        indexes = [
            models.Index(fields=['type', 'is_certified'], name='idx_plugin_type_cert')
        ]

    def __str__(self):
        return f"{self.name} v{self.version}"


class PluginInstallation(models.Model):
    """
    Model for tracking plugin installations per user.
    """
    user_id = models.IntegerField(
        verbose_name=_("User ID")
    )
    plugin = models.ForeignKey(
        Plugin,
        on_delete=models.CASCADE,
        related_name='installations',
        verbose_name=_("Plugin")
    )
    is_enabled = models.BooleanField(
        default=True,
        verbose_name=_("Enabled Status")
    )
    settings = models.JSONField(
        default=dict,
        verbose_name=_("User Settings")
    )
    granted_permissions = models.JSONField(
        default=list,
        verbose_name=_("Granted Permissions")
    )
    installed_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_("Installed At")
    )
    last_used = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_("Last Used")
    )

    class Meta:
        verbose_name = _("Plugin Installation")
        verbose_name_plural = _("Plugin Installations")
        unique_together = ['user_id', 'plugin']
        indexes = [
            models.Index(fields=['user_id', 'is_enabled'], name='idx_install_user_status')
        ]

    def __str__(self):
        return f"{self.plugin.name} for User {self.user_id}"


class PluginRating(models.Model):
    """
    Model for user ratings and reviews of plugins.
    """
    user_id = models.IntegerField(
        verbose_name=_("User ID")
    )
    plugin = models.ForeignKey(
        Plugin,
        on_delete=models.CASCADE,
        related_name='ratings',
        verbose_name=_("Plugin")
    )
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name=_("Rating")
    )
    review = models.TextField(
        blank=True,
        verbose_name=_("Review")
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_("Created At")
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name=_("Updated At")
    )

    class Meta:
        verbose_name = _("Plugin Rating")
        verbose_name_plural = _("Plugin Ratings")
        unique_together = ['user_id', 'plugin']
        indexes = [
            models.Index(fields=['plugin', 'rating'], name='idx_rating_plugin_score')
        ]

    def __str__(self):
        return f"{self.plugin.name} - {self.rating}/5"


class PluginUsageLog(models.Model):
    """
    Model for tracking plugin usage and data access.
    """
    installation = models.ForeignKey(
        PluginInstallation,
        on_delete=models.CASCADE,
        related_name='usage_logs',
        verbose_name=_("Installation")
    )
    action_type = models.CharField(
        max_length=50,
        choices=[
            ('initialize', 'Initialize'),
            ('process_audio', 'Process Audio'),
            ('generate_content', 'Generate Content'),
            ('access_data', 'Access Data'),
            ('modify_settings', 'Modify Settings')
        ],
        verbose_name=_("Action Type")
    )
    accessed_data = models.JSONField(
        default=list,
        verbose_name=_("Accessed Data Types")
    )
    performance_metrics = models.JSONField(
        default=dict,
        verbose_name=_("Performance Metrics")
    )
    error_log = models.TextField(
        blank=True,
        verbose_name=_("Error Log")
    )
    timestamp = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_("Timestamp")
    )

    class Meta:
        verbose_name = _("Plugin Usage Log")
        verbose_name_plural = _("Plugin Usage Logs")
        indexes = [
            models.Index(fields=['installation', 'action_type'], name='idx_usage_install_action'),
            models.Index(fields=['timestamp'], name='idx_usage_time')
        ]

    def __str__(self):
        return f"{self.installation.plugin.name} - {self.action_type}"

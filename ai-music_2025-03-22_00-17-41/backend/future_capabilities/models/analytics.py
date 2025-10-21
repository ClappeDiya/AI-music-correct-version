from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator


class FeatureUsageAnalytics(models.Model):
    """
    Model for tracking feature usage analytics.
    """
    user_id = models.IntegerField(
        verbose_name=_("User ID")
    )
    feature_name = models.CharField(
        max_length=100,
        verbose_name=_("Feature Name")
    )
    feature_category = models.CharField(
        max_length=50,
        choices=[
            ('vr', 'Virtual Reality'),
            ('collaboration', 'Collaboration'),
            ('ai', 'AI Tools'),
            ('interface', 'User Interface'),
            ('audio', 'Audio Processing'),
            ('other', 'Other')
        ],
        verbose_name=_("Feature Category")
    )
    session_duration = models.DurationField(
        verbose_name=_("Session Duration")
    )
    interaction_count = models.IntegerField(
        default=0,
        verbose_name=_("Interaction Count")
    )
    success_rate = models.FloatField(
        validators=[MinValueValidator(0), MaxValueValidator(1)],
        verbose_name=_("Success Rate")
    )
    errors_encountered = models.IntegerField(
        default=0,
        verbose_name=_("Errors Encountered")
    )
    performance_metrics = models.JSONField(
        default=dict,
        verbose_name=_("Performance Metrics")
    )
    user_feedback = models.TextField(
        blank=True,
        verbose_name=_("User Feedback")
    )
    timestamp = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_("Timestamp")
    )

    class Meta:
        verbose_name = _("Feature Usage Analytics")
        verbose_name_plural = _("Feature Usage Analytics")
        indexes = [
            models.Index(fields=['feature_category', 'timestamp'], name='idx_analytics_cat_time'),
            models.Index(fields=['user_id', 'feature_name'], name='idx_analytics_user_feature')
        ]

    def __str__(self):
        return f"{self.feature_name} usage by User {self.user_id}"

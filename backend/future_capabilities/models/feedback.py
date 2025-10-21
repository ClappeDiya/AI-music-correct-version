from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator
from django.conf import settings


class FeatureSurvey(models.Model):
    """
    Model for gathering user feedback on potential features.
    """
    title = models.CharField(
        max_length=200,
        verbose_name=_("Survey Title")
    )
    description = models.TextField(
        verbose_name=_("Description")
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
    priority_level = models.CharField(
        max_length=20,
        choices=[
            ('low', 'Low Priority'),
            ('medium', 'Medium Priority'),
            ('high', 'High Priority'),
            ('critical', 'Critical')
        ],
        default='medium',
        verbose_name=_("Priority Level")
    )
    start_date = models.DateTimeField(
        verbose_name=_("Start Date")
    )
    end_date = models.DateTimeField(
        verbose_name=_("End Date")
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name=_("Active Status")
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_("Created At")
    )

    class Meta:
        verbose_name = _("Feature Survey")
        verbose_name_plural = _("Feature Surveys")
        indexes = [
            models.Index(fields=['feature_category', 'is_active'], name='idx_survey_cat_status')
        ]

    def __str__(self):
        return f"{self.title} ({self.feature_category})"


class SurveyResponse(models.Model):
    """
    Model for storing user responses to feature surveys.
    """
    user_id = models.IntegerField(
        verbose_name=_("User ID")
    )
    survey = models.ForeignKey(
        FeatureSurvey,
        on_delete=models.CASCADE,
        related_name='responses',
        verbose_name=_("Survey")
    )
    interest_level = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name=_("Interest Level")
    )
    importance_level = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name=_("Importance Level")
    )
    feedback = models.TextField(
        blank=True,
        verbose_name=_("Feedback")
    )
    would_use = models.BooleanField(
        verbose_name=_("Would Use Feature")
    )
    submitted_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_("Submitted At")
    )

    class Meta:
        verbose_name = _("Survey Response")
        verbose_name_plural = _("Survey Responses")
        unique_together = ['user_id', 'survey']
        indexes = [
            models.Index(fields=['survey', 'interest_level'], name='idx_response_survey_interest')
        ]

    def __str__(self):
        return f"Response to {self.survey.title} by User {self.user_id}"


class FeatureRequest(models.Model):
    """
    Model for user-submitted feature requests that can be voted on by other users.
    """
    title = models.CharField(
        max_length=200,
        verbose_name=_("Feature Title")
    )
    description = models.TextField(
        verbose_name=_("Description")
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='feature_requests',
        verbose_name=_("Submitted By")
    )
    category = models.CharField(
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
    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending Review'),
            ('approved', 'Approved'),
            ('in_progress', 'In Progress'),
            ('completed', 'Completed'),
            ('declined', 'Declined')
        ],
        default='pending',
        verbose_name=_("Status")
    )
    priority = models.CharField(
        max_length=20,
        choices=[
            ('low', 'Low Priority'),
            ('medium', 'Medium Priority'),
            ('high', 'High Priority'),
            ('critical', 'Critical')
        ],
        default='medium',
        verbose_name=_("Priority")
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_("Created At")
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name=_("Updated At")
    )
    
    @property
    def vote_count(self):
        """Calculate the total number of upvotes."""
        return self.votes.count()
    
    class Meta:
        verbose_name = _("Feature Request")
        verbose_name_plural = _("Feature Requests")
        indexes = [
            models.Index(fields=['category', 'status'], name='idx_feature_req_cat_status'),
            models.Index(fields=['created_at'], name='idx_feature_req_created')
        ]
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.category})"


class FeatureRequestVote(models.Model):
    """
    Model for storing votes on feature requests.
    """
    feature_request = models.ForeignKey(
        FeatureRequest,
        on_delete=models.CASCADE,
        related_name='votes',
        verbose_name=_("Feature Request")
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='feature_request_votes',
        verbose_name=_("User")
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_("Created At")
    )
    
    class Meta:
        verbose_name = _("Feature Request Vote")
        verbose_name_plural = _("Feature Request Votes")
        unique_together = ['feature_request', 'user']
        indexes = [
            models.Index(fields=['feature_request'], name='idx_feature_vote_request')
        ]

    def __str__(self):
        return f"Vote by {self.user.username} on {self.feature_request.title}"

from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class SharedModelGroup(models.Model):
    """
    Represents a group of users collaborating on a shared AI model.
    """
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(
        max_length=255,
        verbose_name=_("Name"),
        help_text=_("Name of the shared model group")
    )
    description = models.TextField(
        blank=True,
        verbose_name=_("Description"),
        help_text=_("Description of the group's musical style or goals")
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='created_model_groups',
        verbose_name=_("Created By"),
        help_text=_("User who created the group")
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_("Created At")
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name=_("Updated At")
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name=_("Is Active"),
        help_text=_("Whether the group is currently active")
    )
    training_status = models.CharField(
        max_length=50,
        choices=[
            ('pending', 'Pending'),
            ('training', 'Training'),
            ('ready', 'Ready'),
            ('failed', 'Failed'),
        ],
        default='pending',
        verbose_name=_("Training Status")
    )
    model_version = models.IntegerField(
        default=1,
        verbose_name=_("Model Version"),
        help_text=_("Current version of the trained model")
    )
    style_tags = models.JSONField(
        default=list,
        verbose_name=_("Style Tags"),
        help_text=_("Tags describing the group's musical style")
    )
    training_config = models.JSONField(
        default=dict,
        verbose_name=_("Training Config"),
        help_text=_("Configuration for model training")
    )

    class Meta:
        verbose_name = _("Shared Model Group")
        verbose_name_plural = _("Shared Model Groups")
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['created_at']),
            models.Index(fields=['training_status']),
        ]


class SharedModelMember(models.Model):
    """
    Represents a member of a shared model group with their role and permissions.
    """
    id = models.BigAutoField(primary_key=True)
    group = models.ForeignKey(
        SharedModelGroup,
        on_delete=models.CASCADE,
        related_name='members',
        verbose_name=_("Group")
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='shared_model_memberships',
        verbose_name=_("User")
    )
    role = models.CharField(
        max_length=50,
        choices=[
            ('admin', 'Administrator'),
            ('contributor', 'Contributor'),
            ('viewer', 'Viewer'),
        ],
        default='contributor',
        verbose_name=_("Role")
    )
    joined_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_("Joined At")
    )
    contribution_count = models.IntegerField(
        default=0,
        verbose_name=_("Contribution Count"),
        help_text=_("Number of tracks contributed by this member")
    )

    class Meta:
        verbose_name = _("Shared Model Member")
        verbose_name_plural = _("Shared Model Members")
        unique_together = ['group', 'user']
        indexes = [
            models.Index(fields=['group', 'user']),
            models.Index(fields=['joined_at']),
        ]


class TrainingContribution(models.Model):
    """
    Represents a track or composition contributed to the shared model's training dataset.
    """
    id = models.BigAutoField(primary_key=True)
    group = models.ForeignKey(
        SharedModelGroup,
        on_delete=models.CASCADE,
        related_name='training_contributions',
        verbose_name=_("Group")
    )
    contributor = models.ForeignKey(
        SharedModelMember,
        on_delete=models.CASCADE,
        related_name='contributions',
        verbose_name=_("Contributor")
    )
    composition = models.ForeignKey(
        'SavedComposition',
        on_delete=models.CASCADE,
        related_name='training_uses',
        verbose_name=_("Composition")
    )
    contributed_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_("Contributed At")
    )
    status = models.CharField(
        max_length=50,
        choices=[
            ('pending', 'Pending Review'),
            ('approved', 'Approved'),
            ('rejected', 'Rejected'),
        ],
        default='pending',
        verbose_name=_("Status")
    )
    review_notes = models.TextField(
        blank=True,
        verbose_name=_("Review Notes"),
        help_text=_("Notes from the review process")
    )
    training_metadata = models.JSONField(
        default=dict,
        verbose_name=_("Training Metadata"),
        help_text=_("Metadata about how this contribution was used in training")
    )

    class Meta:
        verbose_name = _("Training Contribution")
        verbose_name_plural = _("Training Contributions")
        ordering = ['-contributed_at']
        indexes = [
            models.Index(fields=['group', 'status']),
            models.Index(fields=['contributed_at']),
        ]


class ModelTrainingJob(models.Model):
    """
    Represents a training job for updating the shared model.
    """
    id = models.BigAutoField(primary_key=True)
    group = models.ForeignKey(
        SharedModelGroup,
        on_delete=models.CASCADE,
        related_name='training_jobs',
        verbose_name=_("Group")
    )
    started_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_("Started At")
    )
    completed_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_("Completed At")
    )
    status = models.CharField(
        max_length=50,
        choices=[
            ('queued', 'Queued'),
            ('running', 'Running'),
            ('completed', 'Completed'),
            ('failed', 'Failed'),
        ],
        default='queued',
        verbose_name=_("Status")
    )
    error_message = models.TextField(
        blank=True,
        verbose_name=_("Error Message")
    )
    training_metrics = models.JSONField(
        default=dict,
        verbose_name=_("Training Metrics"),
        help_text=_("Metrics from the training process")
    )
    model_artifacts = models.JSONField(
        default=dict,
        verbose_name=_("Model Artifacts"),
        help_text=_("Paths to saved model artifacts")
    )

    class Meta:
        verbose_name = _("Model Training Job")
        verbose_name_plural = _("Model Training Jobs")
        ordering = ['-started_at']
        indexes = [
            models.Index(fields=['group', 'status']),
            models.Index(fields=['started_at']),
        ]

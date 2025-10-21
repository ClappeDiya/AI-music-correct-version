from django.db import models
from django.utils.translation import gettext_lazy as _
from django.db.models import JSONField
from user_management.models import User  # Import the custom user model


class ModerationReason(models.Model):
    """
    Represents a standard reason for content moderation.
    Only editable by admins.
    """
    id = models.BigAutoField(primary_key=True) # Changed from UUIDField
    reason_code = models.TextField(unique=True, verbose_name=_("Reason Code"), help_text=_("Unique code for the moderation reason (e.g., 'hate_speech', 'copyright_infringement').")) # Unique code for the moderation reason
    description = models.TextField(blank=True, null=True, verbose_name=_("Description"), help_text=_("Detailed description of the moderation reason.")) # Detailed description of the moderation reason
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("Timestamp when the moderation reason was created.")) # Timestamp when the moderation reason was created

    class Meta:
        verbose_name = _("Moderation Reason")
        verbose_name_plural = _("Moderation Reasons")

    def __str__(self):
        return self.reason_code


class ReportedContent(models.Model):
    """
    Records each user report against some content.
    """
    id = models.BigAutoField(primary_key=True)
    assigned_moderator = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_reports',
        verbose_name=_("Assigned Moderator"),
        help_text=_("Moderator assigned to handle this report.")
    )
    status = models.CharField(
        max_length=20,
        choices=[
            ('unassigned', 'Unassigned'),
            ('in_progress', 'In Progress'),
            ('resolved', 'Resolved'),
            ('escalated', 'Escalated to Admin'),
        ],
        default='unassigned'
    )
    reporter_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reported_contents', verbose_name=_("Reporter User"), help_text=_("User who reported the content.")) # User who reported the content
    content_ref = models.TextField(verbose_name=_("Content Reference"), help_text=_("Reference to the reported content (e.g., 'post:123', 'track:456').")) # Reference to the reported content
    reason = models.ForeignKey(ModerationReason, on_delete=models.SET_NULL, null=True, blank=True, verbose_name=_("Reason"), help_text=_("Optional link to a standard moderation reason.")) # Optional link to a standard moderation reason
    additional_details = JSONField(blank=True, null=True, verbose_name=_("Additional Details"), help_text=_("Additional details about the report (e.g., screenshot URL, comment).")) # Additional details about the report
    reported_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Reported At"), help_text=_("Timestamp when the content was reported.")) # Timestamp when the content was reported

    class Meta:
        verbose_name = _("Reported Content")
        verbose_name_plural = _("Reported Contents")
        indexes = [
            models.Index(fields=['reporter_user']),
        ]

    def __str__(self):
        return f"Reported by {self.reporter_user} - {self.content_ref}"


class ModerationAction(models.Model):
    """
    Records moderation actions taken by admins/moderators.
    This model is tenant-specific.
    """
    id = models.BigAutoField(primary_key=True) # Changed from UUIDField
    admin_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='moderation_actions', verbose_name=_("Admin User"), help_text=_("Admin or moderator who took the action.")) # Admin or moderator who took the action
    target_ref = models.TextField(blank=True, null=True, verbose_name=_("Target Reference"), help_text=_("Reference to the target of the action (e.g., 'user:789', 'post:123').")) # Reference to the target of the action
    action_type = models.TextField(verbose_name=_("Action Type"), help_text=_("Type of moderation action (e.g., 'remove_content', 'warn_user', 'suspend_user').")) # Type of moderation action
    action_details = JSONField(blank=True, null=True, verbose_name=_("Action Details"), help_text=_("Additional details about the action (e.g., duration, justification).")) # Additional details about the action
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("Timestamp when the action was taken.")) # Timestamp when the action was taken

    class Meta:
        verbose_name = _("Moderation Action")
        verbose_name_plural = _("Moderation Actions")
        indexes = [
            models.Index(fields=['admin_user']),
        ]

    def __str__(self):
        return f"{self.action_type} by {self.admin_user} - {self.target_ref}"


class BulkAction(models.Model):
    """
    Records bulk actions for efficient handling of multiple issues at once.
    This model is tenant-specific.
    """
    id = models.BigAutoField(primary_key=True) # Changed from UUIDField
    admin_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bulk_actions', verbose_name=_("Admin User"), help_text=_("Admin or moderator who initiated the bulk action.")) # Admin or moderator who initiated the bulk action
    action_type = models.TextField(verbose_name=_("Action Type"), help_text=_("Type of bulk action (e.g., 'mass_suspension', 'bulk_content_removal').")) # Type of bulk action
    targets = JSONField(verbose_name=_("Targets"), help_text=_("Targets of the bulk action (e.g., list of users, posts).")) # Targets of the bulk action
    executed_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Executed At"), help_text=_("Timestamp when the bulk action was executed.")) # Timestamp when the bulk action was executed

    class Meta:
        verbose_name = _("Bulk Action")
        verbose_name_plural = _("Bulk Actions")
        indexes = [
            models.Index(fields=['admin_user']),
        ]

    def __str__(self):
        return f"{self.action_type} by {self.admin_user}"


class AutomatedScanningResult(models.Model):
    """
    Logs results from automated AI scanning of content.
    This model is tenant-specific.
    """
    id = models.BigAutoField(primary_key=True) # Changed from UUIDField
    content_ref = models.TextField(verbose_name=_("Content Reference"), help_text=_("Reference to the scanned content.")) # Reference to the scanned content
    scan_data = JSONField(verbose_name=_("Scan Data"), help_text=_("Data from the scan (e.g., detected hate speech, confidence score).")) # Data from the scan
    scanned_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Scanned At"), help_text=_("Timestamp when the content was scanned.")) # Timestamp when the content was scanned

    class Meta:
        verbose_name = _("Automated Scanning Result")
        verbose_name_plural = _("Automated Scanning Results")
        indexes = [
            models.Index(fields=['content_ref']),
        ]

    def __str__(self):
        return f"Scan result for {self.content_ref}"


class AuditLog(models.Model):
    """
    Logs all admin/moderator actions for auditing purposes.
    This model is tenant-specific.
    """
    id = models.BigAutoField(primary_key=True) # Changed from UUIDField
    actor_user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='audit_logs', verbose_name=_("Actor User"), help_text=_("User who performed the action.")) # User who performed the action
    action_description = models.TextField(verbose_name=_("Action Description"), help_text=_("Description of the action performed.")) # Description of the action performed
    related_ref = models.TextField(blank=True, null=True, verbose_name=_("Related Reference"), help_text=_("Reference to the related content or user.")) # Reference to the related content or user
    timestamp = models.DateTimeField(auto_now_add=True, verbose_name=_("Timestamp"), help_text=_("Timestamp when the action was performed.")) # Timestamp when the action was performed

    class Meta:
        verbose_name = _("Audit Log")
        verbose_name_plural = _("Audit Logs")
        indexes = [
            models.Index(fields=['actor_user']),
        ]

    def __str__(self):
        return f"Audit log by {self.actor_user} - {self.action_description}"


class PatternModerationRule(models.Model):
    """
    Stores evolving rules/patterns for automated interventions.
    This model is tenant-specific.
    """
    id = models.BigAutoField(primary_key=True) # Changed from UUIDField
    rule_name = models.TextField(unique=True, verbose_name=_("Rule Name"), help_text=_("Unique name for the moderation rule.")) # Unique name for the moderation rule
    rule_data = JSONField(verbose_name=_("Rule Data"), help_text=_("Data for the moderation rule (e.g., trigger keywords, action).")) # Data for the moderation rule
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"), help_text=_("Timestamp when the rule was last updated.")) # Timestamp when the rule was last updated

    class Meta:
        verbose_name = _("Pattern Moderation Rule")
        verbose_name_plural = _("Pattern Moderation Rules")
        indexes = [
            models.Index(fields=['rule_name']),
        ]

    def __str__(self):
        return self.rule_name


class DelegationChain(models.Model):
    """
    Assigns responsibilities in moderation workflows.
    This model is tenant-specific.
    """
    id = models.BigAutoField(primary_key=True) # Changed from UUIDField
    senior_admin = models.ForeignKey(User, on_delete=models.CASCADE, related_name='delegation_chains_senior', verbose_name=_("Senior Admin"), help_text=_("Senior admin in the delegation chain.")) # Senior admin in the delegation chain
    junior_admin = models.ForeignKey(User, on_delete=models.CASCADE, related_name='delegation_chains_junior', verbose_name=_("Junior Admin"), help_text=_("Junior admin in the delegation chain.")) # Junior admin in the delegation chain
    permissions = JSONField(verbose_name=_("Permissions"), help_text=_("Permissions granted to the junior admin (e.g., can remove content, can suspend users).")) # Permissions granted to the junior admin
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("Timestamp when the delegation chain was created.")) # Timestamp when the delegation chain was created

    class Meta:
        verbose_name = _("Delegation Chain")
        verbose_name_plural = _("Delegation Chains")
        constraints = [
            models.CheckConstraint(check=~models.Q(senior_admin=models.F('junior_admin')), name='senior_admin_not_equal_junior_admin')
        ]
        indexes = [
            models.Index(fields=['senior_admin']),
        ]

    def __str__(self):
        return f"Delegation chain: {self.senior_admin} -> {self.junior_admin}"


class ComplianceReference(models.Model):
    """
    Links moderation actions to external legal frameworks.
    This model is tenant-specific.
    """
    id = models.BigAutoField(primary_key=True) # Changed from UUIDField
    reference_code = models.TextField(unique=True, verbose_name=_("Reference Code"), help_text=_("Unique code for the compliance reference.")) # Unique code for the compliance reference
    reference_details = JSONField(blank=True, null=True, verbose_name=_("Reference Details"), help_text=_("Details about the compliance reference (e.g., law, section).")) # Details about the compliance reference

    class Meta:
        verbose_name = _("Compliance Reference")
        verbose_name_plural = _("Compliance References")

    def __str__(self):
        return self.reference_code


class BulkModerationTemplate(models.Model):
    """
    Stores reusable sets of actions for bulk moderation.
    This model is tenant-specific.
    """
    id = models.BigAutoField(primary_key=True) # Changed from UUIDField
    template_name = models.TextField(unique=True, verbose_name=_("Template Name"), help_text=_("Unique name for the bulk moderation template.")) # Unique name for the bulk moderation template
    template_data = JSONField(verbose_name=_("Template Data"), help_text=_("Data for the bulk moderation template (e.g., action type, criteria).")) # Data for the bulk moderation template
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("Timestamp when the template was created.")) # Timestamp when the template was created

    class Meta:
        verbose_name = _("Bulk Moderation Template")
        verbose_name_plural = _("Bulk Moderation Templates")
        indexes = [
            models.Index(fields=['template_name']),
        ]

    def __str__(self):
        return self.template_name


class AnomalyAlert(models.Model):
    """
    Stores alerts when unusual moderation patterns or spikes in reported content occur.
    This model is tenant-specific.
    """
    id = models.BigAutoField(primary_key=True) # Changed from UUIDField
    alert_type = models.TextField(verbose_name=_("Alert Type"), help_text=_("Type of anomaly alert (e.g., 'spike_in_reports', 'unusual_language_pattern').")) # Type of anomaly alert
    alert_data = JSONField(verbose_name=_("Alert Data"), help_text=_("Data for the anomaly alert (e.g., report count, expected count).")) # Data for the anomaly alert
    triggered_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Triggered At"), help_text=_("Timestamp when the alert was triggered.")) # Timestamp when the alert was triggered

    class Meta:
        verbose_name = _("Anomaly Alert")
        verbose_name_plural = _("Anomaly Alerts")
        indexes = [
            models.Index(fields=['alert_type']),
        ]

    def __str__(self):
        return f"Anomaly alert: {self.alert_type}"


class ModerationKnowledgeExchange(models.Model):
    """
    Allows tenants to opt-in to share or browse anonymized spammer fingerprints or known abusive patterns.
    This model is tenant-specific.
    """
    id = models.BigAutoField(primary_key=True) # Changed from UUIDField
    shared_by_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='shared_knowledge', verbose_name=_("Shared By User"), help_text=_("User who shared the data.")) # User who shared the data
    pattern_data = JSONField(verbose_name=_("Pattern Data"), help_text=_("Data about the shared patterns (e.g., spam signatures, abuse patterns).")) # Data about the shared patterns
    tags = models.TextField(verbose_name=_("Tags"), help_text=_("Tags for the shared data (e.g., 'spam', 'phishing').")) # Tags for the shared data
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("Timestamp when the data was shared.")) # Timestamp when the data was shared

    class Meta:
        verbose_name = _("Moderation Knowledge Exchange")
        verbose_name_plural = _("Moderation Knowledge Exchanges")
        indexes = [
            models.Index(fields=['tags'], name='idx_moderation_knowledge_tags'),
        ]
        constraints = [
            models.CheckConstraint(check=~models.Q(tags__exact=''), name='tags_not_empty')
        ]

    def __str__(self):
        return f"Shared by tenant {self.shared_by_tenant_id}"


class ModeratorPerformance(models.Model):
    """
    Tracks moderator metrics and assigns scores or badges.
    This model is tenant-specific.
    """
    id = models.BigAutoField(primary_key=True) # Changed from UUIDField
    moderator_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='moderator_performances', verbose_name=_("Moderator User"), help_text=_("Moderator user whose performance is being tracked.")) # Moderator user whose performance is being tracked
    performance_metrics = JSONField(verbose_name=_("Performance Metrics"), help_text=_("Metrics about the moderator's performance (e.g., resolved reports, average response time).")) # Metrics about the moderator's performance
    badges_awarded = models.TextField(blank=True, null=True, verbose_name=_("Badges Awarded"), help_text=_("Badges awarded to the moderator (e.g., 'Top Moderator Q1', 'Accuracy Star').")) # Badges awarded to the moderator
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"), help_text=_("Timestamp when the performance was last updated.")) # Timestamp when the performance was last updated

    class Meta:
        verbose_name = _("Moderator Performance")
        verbose_name_plural = _("Moderator Performances")
        indexes = [
            models.Index(fields=['moderator_user']),
        ]

    def __str__(self):
        return f"Performance for {self.moderator_user}"


class InterventionPipeline(models.Model):
    """
    Defines triggers and pipelines for immediate actions (e.g., freeze content upon pattern detection).
    This model is tenant-specific.
    """
    id = models.BigAutoField(primary_key=True) # Changed from UUIDField
    pipeline_name = models.TextField(unique=True, verbose_name=_("Pipeline Name"), help_text=_("Unique name for the intervention pipeline.")) # Unique name for the intervention pipeline
    trigger_conditions = JSONField(verbose_name=_("Trigger Conditions"), help_text=_("Conditions that trigger the pipeline (e.g., spike in reports, specific keyword).")) # Conditions that trigger the pipeline
    actions = JSONField(verbose_name=_("Actions"), help_text=_("Actions to take when the pipeline is triggered (e.g., freeze content, notify admin).")) # Actions to take when the pipeline is triggered
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("Timestamp when the pipeline was created.")) # Timestamp when the pipeline was created

    class Meta:
        verbose_name = _("Intervention Pipeline")
        verbose_name_plural = _("Intervention Pipelines")
        indexes = [
            models.Index(fields=['pipeline_name']),
        ]

    def __str__(self):
        return self.pipeline_name


class LegalSummary(models.Model):
    """
    Stores NLP-generated summaries of laws or compliance guidelines for quick reference.
    This model is tenant-specific.
    """
    id = models.BigAutoField(primary_key=True) # Changed from UUIDField
    reference_code = models.TextField(unique=True, verbose_name=_("Reference Code"), help_text=_("Unique code for the legal reference.")) # Unique code for the legal reference
    summary_text = models.TextField(verbose_name=_("Summary Text"), help_text=_("Human-readable summary of the legal text.")) # Human-readable summary of the legal text
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"), help_text=_("Timestamp when the summary was last updated.")) # Timestamp when the summary was last updated

    class Meta:
        verbose_name = _("Legal Summary")
        verbose_name_plural = _("Legal Summaries")
        indexes = [
            models.Index(fields=['reference_code']),
        ]

    def __str__(self):
        return self.reference_code


class ModeratorAssistantInteraction(models.Model):
    """
    Logs interactions and suggestions provided by an AI assistant to moderators.
    This model is tenant-specific.
    """
    id = models.BigAutoField(primary_key=True) # Changed from UUIDField
    moderator_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='moderator_assistant_interactions', verbose_name=_("Moderator User"), help_text=_("Moderator user who interacted with the AI assistant.")) # Moderator user who interacted with the AI assistant
    query = models.TextField(verbose_name=_("Query"), help_text=_("Query made by the moderator to the AI assistant.")) # Query made by the moderator to the AI assistant
    suggested_actions = JSONField(verbose_name=_("Suggested Actions"), help_text=_("Actions suggested by the AI assistant (e.g., recommended action, confidence score).")) # Actions suggested by the AI assistant
    provided_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Provided At"), help_text=_("Timestamp when the suggestion was provided.")) # Timestamp when the suggestion was provided

    class Meta:
        verbose_name = _("Moderator Assistant Interaction")
        verbose_name_plural = _("Moderator Assistant Interactions")
        indexes = [
            models.Index(fields=['moderator_user']),
        ]

    def __str__(self):
        return f"Interaction with {self.moderator_user}"

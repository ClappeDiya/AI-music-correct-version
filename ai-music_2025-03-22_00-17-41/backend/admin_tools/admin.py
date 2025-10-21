# admin.py for Admin and Moderation Tools Module
# This file defines how the models in the admin_tools app are displayed and managed
# in the Django admin interface.

from django.contrib import admin
from .models import (
    ModerationReason,
    ReportedContent,
    ModerationAction,
    BulkAction,
    AutomatedScanningResult,
    AuditLog,
    PatternModerationRule,
    DelegationChain,
    ComplianceReference,
    BulkModerationTemplate,
    AnomalyAlert,
    ModerationKnowledgeExchange,
    ModeratorPerformance,
    InterventionPipeline,
    LegalSummary,
    ModeratorAssistantInteraction,
)
from user_management.models import User  # Import the custom user model


@admin.register(ModerationReason)
class ModerationReasonAdmin(admin.ModelAdmin):
    """
    Admin class for the ModerationReason model.
    This model is shared across all tenants.
    """
    list_display = ['reason_code', 'description', 'created_at']
    search_fields = ['reason_code', 'description']
    readonly_fields = ['created_at']


@admin.register(ReportedContent)
class ReportedContentAdmin(admin.ModelAdmin):
    """
    Admin class for the ReportedContent model.
    This model is tenant-specific.
    """
    list_display = ['reporter_user', 'content_ref', 'reason', 'reported_at']
    list_filter = ['reported_at']
    search_fields = ['content_ref', 'additional_details']
    autocomplete_fields = []
    readonly_fields = ['reported_at']
    list_select_related = ['reporter_user']


@admin.register(ModerationAction)
class ModerationActionAdmin(admin.ModelAdmin):
    """
    Admin class for the ModerationAction model.
    This model is tenant-specific.
    """
    list_display = ['admin_user', 'target_ref', 'action_type', 'created_at']
    list_filter = ['created_at']
    search_fields = ['target_ref', 'action_type', 'action_details']
    autocomplete_fields = []
    readonly_fields = ['created_at']
    list_select_related = []


@admin.register(BulkAction)
class BulkActionAdmin(admin.ModelAdmin):
    """
    Admin class for the BulkAction model.
    This model is tenant-specific.
    """
    list_display = ['admin_user', 'action_type', 'executed_at']
    list_filter = ['admin_user', 'action_type', 'executed_at']
    search_fields = ['action_type', 'targets']
    autocomplete_fields = []
    readonly_fields = ['executed_at']
    list_select_related = []


@admin.register(AutomatedScanningResult)
class AutomatedScanningResultAdmin(admin.ModelAdmin):
    """
    Admin class for the AutomatedScanningResult model.
    This model is tenant-specific.
    """
    list_display = ['content_ref', 'scanned_at']
    list_filter = ['scanned_at']
    search_fields = ['content_ref', 'scan_data']
    readonly_fields = ['scanned_at']


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    """
    Admin class for the AuditLog model.
    This model is tenant-specific.
    """
    list_display = ['actor_user', 'action_description', 'timestamp']
    list_filter = ['timestamp']
    search_fields = ['action_description', 'related_ref']
    autocomplete_fields = []
    readonly_fields = ['timestamp']
    list_select_related = []


@admin.register(PatternModerationRule)
class PatternModerationRuleAdmin(admin.ModelAdmin):
    """
    Admin class for the PatternModerationRule model.
    This model is tenant-specific.
    """
    list_display = ['rule_name', 'updated_at']
    search_fields = ['rule_name', 'rule_data']
    readonly_fields = ['updated_at']


@admin.register(DelegationChain)
class DelegationChainAdmin(admin.ModelAdmin):
    """
    Admin class for the DelegationChain model.
    This model is tenant-specific.
    """
    list_display = ['senior_admin', 'junior_admin', 'created_at']
    list_filter = ['created_at']
    autocomplete_fields = []
    readonly_fields = ['created_at']
    list_select_related = []


@admin.register(ComplianceReference)
class ComplianceReferenceAdmin(admin.ModelAdmin):
    """
    Admin class for the ComplianceReference model.
    This model is tenant-specific.
    """
    list_display = ['reference_code']
    search_fields = ['reference_code', 'reference_details']


@admin.register(BulkModerationTemplate)
class BulkModerationTemplateAdmin(admin.ModelAdmin):
    """
    Admin class for the BulkModerationTemplate model.
    This model is tenant-specific.
    """
    list_display = ['template_name', 'created_at']
    search_fields = ['template_name', 'template_data']
    readonly_fields = ['created_at']


@admin.register(AnomalyAlert)
class AnomalyAlertAdmin(admin.ModelAdmin):
    """
    Admin class for the AnomalyAlert model.
    This model is tenant-specific.
    """
    list_display = ['alert_type', 'triggered_at']
    list_filter = ['alert_type', 'triggered_at']
    search_fields = ['alert_type', 'alert_data']
    readonly_fields = ['triggered_at']


@admin.register(ModerationKnowledgeExchange)
class ModerationKnowledgeExchangeAdmin(admin.ModelAdmin):
    """
    Admin class for the ModerationKnowledgeExchange model.
    This model is tenant-specific.
    """
    list_display = ['shared_by_user', 'tags', 'created_at']
    list_filter = ['created_at', 'tags']
    search_fields = ['shared_by_user__username', 'pattern_data', 'tags']
    readonly_fields = ['created_at']


@admin.register(ModeratorPerformance)
class ModeratorPerformanceAdmin(admin.ModelAdmin):
    """
    Admin class for the ModeratorPerformance model.
    This model is tenant-specific.
    """
    list_display = ['moderator_user', 'updated_at']
    list_filter = ['updated_at']
    search_fields = ['performance_metrics', 'badges_awarded']
    pass
    readonly_fields = ['updated_at']
    list_select_related = []


@admin.register(InterventionPipeline)
class InterventionPipelineAdmin(admin.ModelAdmin):
    """
    Admin class for the InterventionPipeline model.
    This model is tenant-specific.
    """
    list_display = ['pipeline_name', 'created_at']
    search_fields = ['pipeline_name', 'trigger_conditions', 'actions']
    readonly_fields = ['created_at']


@admin.register(LegalSummary)
class LegalSummaryAdmin(admin.ModelAdmin):
    """
    Admin class for the LegalSummary model.
    This model is tenant-specific.
    """
    list_display = ['reference_code', 'updated_at']
    search_fields = ['reference_code', 'summary_text']
    readonly_fields = ['updated_at']


@admin.register(ModeratorAssistantInteraction)
class ModeratorAssistantInteractionAdmin(admin.ModelAdmin):
    """
    Admin class for the ModeratorAssistantInteraction model.
    This model is tenant-specific.
    """
    list_display = ['moderator_user', 'provided_at']
    list_filter = ['provided_at']
    search_fields = ['query', 'suggested_actions']
    pass
    readonly_fields = ['provided_at']
    list_select_related = []

from rest_framework import serializers
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
    User,
)
from tenants.serializers import TenantAwareMixin


class ModerationReasonSerializer(TenantAwareMixin, serializers.ModelSerializer):
    """
    Serializer for the ModerationReason model.
    This model is shared across all tenants.
    """
    class Meta:
        model = ModerationReason
        fields = ['id', 'reason_code', 'description', 'created_at']
        read_only_fields = ['id', 'created_at']


class ReportedContentSerializer(TenantAwareMixin, serializers.ModelSerializer):
    """
    Serializer for the ReportedContent model.
    This model is tenant-specific.
    """
    reporter_user = serializers.UUIDField(source='reporter_user.id') # Explicitly serialize the reporter_user as a UUID
    reason = ModerationReasonSerializer(read_only=True) # Use nested serializer for the reason
    assigned_moderator = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(groups__name='Moderators'),
        required=False,
        allow_null=True
    )
    
    class Meta:
        model = ReportedContent
        fields = ['id', 'reporter_user', 'content_ref', 'reason', 'additional_details', 'reported_at', 'assigned_moderator', 'status']
        read_only_fields = ['id', 'reported_at']

    def validate_assigned_moderator(self, value):
        user = self.context['request'].user
        if not user.is_staff and value != user:
            raise serializers.ValidationError("You can only assign reports to yourself.")
        return value


class ModerationActionSerializer(TenantAwareMixin, serializers.ModelSerializer):
    """
    Serializer for the ModerationAction model.
    This model is tenant-specific.
    """
    admin_user = serializers.UUIDField(source='admin_user.id') # Explicitly serialize the admin_user as a UUID
    class Meta:
        model = ModerationAction
        fields = ['id', 'admin_user', 'target_ref', 'action_type', 'action_details', 'created_at']
        read_only_fields = ['id', 'created_at']


class BulkActionSerializer(TenantAwareMixin, serializers.ModelSerializer):
    """
    Serializer for the BulkAction model.
    This model is tenant-specific.
    """
    admin_user = serializers.UUIDField(source='admin_user.id') # Explicitly serialize the admin_user as a UUID
    class Meta:
        model = BulkAction
        fields = ['id', 'admin_user', 'action_type', 'targets', 'executed_at']
        read_only_fields = ['id', 'executed_at']


class AutomatedScanningResultSerializer(TenantAwareMixin, serializers.ModelSerializer):
    """
    Serializer for the AutomatedScanningResult model.
    This model is tenant-specific.
    """
    class Meta:
        model = AutomatedScanningResult
        fields = ['id', 'content_ref', 'scan_data', 'scanned_at']
        read_only_fields = ['id', 'scanned_at']


class AuditLogSerializer(TenantAwareMixin, serializers.ModelSerializer):
    """
    Serializer for the AuditLog model.
    This model is tenant-specific.
    """
    actor_user = serializers.UUIDField(source='actor_user.id', allow_null=True) # Explicitly serialize the actor_user as a UUID
    class Meta:
        model = AuditLog
        fields = ['id', 'actor_user', 'action_description', 'related_ref', 'timestamp']
        read_only_fields = ['id', 'timestamp']


class PatternModerationRuleSerializer(TenantAwareMixin, serializers.ModelSerializer):
    """
    Serializer for the PatternModerationRule model.
    This model is tenant-specific.
    """
    class Meta:
        model = PatternModerationRule
        fields = ['id', 'rule_name', 'rule_data', 'updated_at']
        read_only_fields = ['id', 'updated_at']


class DelegationChainSerializer(TenantAwareMixin, serializers.ModelSerializer):
    """
    Serializer for the DelegationChain model.
    This model is tenant-specific.
    """
    senior_admin = serializers.UUIDField(source='senior_admin.id') # Explicitly serialize the senior_admin as a UUID
    junior_admin = serializers.UUIDField(source='junior_admin.id') # Explicitly serialize the junior_admin as a UUID
    class Meta:
        model = DelegationChain
        fields = ['id', 'senior_admin', 'junior_admin', 'permissions', 'created_at']
        read_only_fields = ['id', 'created_at']


class ComplianceReferenceSerializer(TenantAwareMixin, serializers.ModelSerializer):
    """
    Serializer for the ComplianceReference model.
    This model is tenant-specific.
    """
    class Meta:
        model = ComplianceReference
        fields = ['id', 'reference_code', 'reference_details']
        read_only_fields = ['id']


class BulkModerationTemplateSerializer(TenantAwareMixin, serializers.ModelSerializer):
    """
    Serializer for the BulkModerationTemplate model.
    This model is tenant-specific.
    """
    class Meta:
        model = BulkModerationTemplate
        fields = ['id', 'template_name', 'template_data', 'created_at']
        read_only_fields = ['id', 'created_at']


class AnomalyAlertSerializer(TenantAwareMixin, serializers.ModelSerializer):
    """
    Serializer for the AnomalyAlert model.
    This model is tenant-specific.
    """
    class Meta:
        model = AnomalyAlert
        fields = ['id', 'alert_type', 'alert_data', 'triggered_at']
        read_only_fields = ['id', 'triggered_at']


class ModerationKnowledgeExchangeSerializer(TenantAwareMixin, serializers.ModelSerializer):
    """
    Serializer for the ModerationKnowledgeExchange model.
    This model is tenant-specific.
    """
    class Meta:
        model = ModerationKnowledgeExchange
        fields = ['id', 'shared_by_tenant_id', 'pattern_data', 'tags', 'created_at']
        read_only_fields = ['id', 'created_at']


class ModeratorPerformanceSerializer(TenantAwareMixin, serializers.ModelSerializer):
    """
    Serializer for the ModeratorPerformance model.
    This model is tenant-specific.
    """
    moderator_user = serializers.UUIDField(source='moderator_user.id') # Explicitly serialize the moderator_user as a UUID
    class Meta:
        model = ModeratorPerformance
        fields = ['id', 'moderator_user', 'performance_metrics', 'badges_awarded', 'updated_at']
        read_only_fields = ['id', 'updated_at']


class InterventionPipelineSerializer(TenantAwareMixin, serializers.ModelSerializer):
    """
    Serializer for the InterventionPipeline model.
    This model is tenant-specific.
    """
    class Meta:
        model = InterventionPipeline
        fields = ['id', 'pipeline_name', 'trigger_conditions', 'actions', 'created_at']
        read_only_fields = ['id', 'created_at']


class LegalSummarySerializer(TenantAwareMixin, serializers.ModelSerializer):
    """
    Serializer for the LegalSummary model.
    This model is tenant-specific.
    """
    class Meta:
        model = LegalSummary
        fields = ['id', 'reference_code', 'summary_text', 'updated_at']
        read_only_fields = ['id', 'updated_at']


class ModeratorAssistantInteractionSerializer(TenantAwareMixin, serializers.ModelSerializer):
    """
    Serializer for the ModeratorAssistantInteraction model.
    This model is tenant-specific.
    """
    moderator_user = serializers.UUIDField(source='moderator_user.id') # Explicitly serialize the moderator_user as a UUID
    class Meta:
        model = ModeratorAssistantInteraction
        fields = ['id', 'moderator_user', 'query', 'suggested_actions', 'provided_at']
        read_only_fields = ['id', 'provided_at']

# views.py for Admin and Moderation Tools Module
# This file contains the viewsets for the admin and moderation tools module,
# providing API endpoints for managing moderation-related data within a multi-tenant environment.

from rest_framework import viewsets, permissions, filters
from rest_framework.pagination import PageNumberPagination
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.conf import settings
import logging
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
from .serializers import (
    ModerationReasonSerializer,
    ReportedContentSerializer,
    ModerationActionSerializer,
    BulkActionSerializer,
    AutomatedScanningResultSerializer,
    AuditLogSerializer,
    PatternModerationRuleSerializer,
    DelegationChainSerializer,
    ComplianceReferenceSerializer,
    BulkModerationTemplateSerializer,
    AnomalyAlertSerializer,
    ModerationKnowledgeExchangeSerializer,
    ModeratorPerformanceSerializer,
    InterventionPipelineSerializer,
    LegalSummarySerializer,
    ModeratorAssistantInteractionSerializer,
)
from user_management.models import User
from rest_framework.permissions import BasePermission

logger = logging.getLogger(__name__)

class IsModeratorOrAdmin(BasePermission):
    """
    Custom permission to only allow moderators or admins.
    """
    def has_permission(self, request, view):
        return request.user and (request.user.is_staff or request.user.groups.filter(name='Moderators').exists())

class FilterSearchMixin:
    """
    Mixin to add filtering and searching capabilities to viewsets.
    """
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = []
    ordering_fields = ['created_at', 'updated_at', 'timestamp', 'reported_at', 'executed_at', 'scanned_at', 'provided_at', 'triggered_at']

class BaseModeratorViewSet(FilterSearchMixin, viewsets.ModelViewSet):
    """
    Base viewset that combines FilterSearchMixin and ModelViewSet with moderator permissions.
    """
    pagination_class = PageNumberPagination
    page_size = 20
    permission_classes = [permissions.IsAuthenticated, IsModeratorOrAdmin]

    def get_queryset(self):
        """
        Filter queryset based on user's role and permissions.
        """
        queryset = super().get_queryset()
        user = self.request.user

        if not user.is_staff:  # Regular moderator
            # Filter based on delegation chains
            delegated_actions = DelegationChain.objects.filter(
                junior_admin=user
            ).values_list('permissions', flat=True)
            
            # Add role-specific filters here
            return queryset.filter(
                Q(admin_user=user) |  # Own actions
                Q(moderator_user=user)  # Assigned actions
            )
        
        return queryset  # Admin sees everything

class ModerationReasonViewSet(BaseModeratorViewSet):
    """
    ViewSet for the ModerationReason model.
    Accessible by moderators and admins.
    """
    queryset = ModerationReason.objects.all()
    serializer_class = ModerationReasonSerializer
    search_fields = ['reason_code', 'description']


class ReportedContentViewSet(BaseModeratorViewSet):
    """
    ViewSet for the ReportedContent model.
    """
    queryset = ReportedContent.objects.all()
    serializer_class = ReportedContentSerializer
    search_fields = ['content_ref', 'additional_details']
    filterset_fields = ['reporter_user', 'reason']

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        
        if not user.is_staff:
            # Regular moderators only see reports assigned to them
            return queryset.filter(
                Q(assigned_moderator=user) |
                Q(status='unassigned')  # Assuming you want moderators to see unassigned reports
            )
        return queryset


class ModerationActionViewSet(BaseModeratorViewSet):
    """
    ViewSet for the ModerationAction model.
    """
    queryset = ModerationAction.objects.all()
    serializer_class = ModerationActionSerializer
    search_fields = ['target_ref', 'action_type', 'action_details']
    filterset_fields = ['admin_user']

    def perform_create(self, serializer):
        # Always associate the action with the current user
        serializer.save(admin_user=self.request.user)


class BulkActionViewSet(BaseModeratorViewSet):
    """
    ViewSet for the BulkAction model.
    """
    queryset = BulkAction.objects.all()
    serializer_class = BulkActionSerializer
    search_fields = ['action_type', 'targets']
    filterset_fields = ['admin_user']


class AutomatedScanningResultViewSet(BaseModeratorViewSet):
    """
    ViewSet for the AutomatedScanningResult model.
    """
    queryset = AutomatedScanningResult.objects.all()
    serializer_class = AutomatedScanningResultSerializer
    search_fields = ['content_ref', 'scan_data']


class AuditLogViewSet(BaseModeratorViewSet):
    """
    ViewSet for the AuditLog model.
    """
    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer
    search_fields = ['action_description', 'related_ref']
    filterset_fields = ['actor_user']


class PatternModerationRuleViewSet(BaseModeratorViewSet):
    """
    ViewSet for the PatternModerationRule model.
    """
    queryset = PatternModerationRule.objects.all()
    serializer_class = PatternModerationRuleSerializer
    search_fields = ['rule_name', 'rule_data']


class DelegationChainViewSet(BaseModeratorViewSet):
    """
    ViewSet for the DelegationChain model.
    """
    queryset = DelegationChain.objects.all()
    serializer_class = DelegationChainSerializer
    filterset_fields = ['senior_admin', 'junior_admin']


class ComplianceReferenceViewSet(BaseModeratorViewSet):
    """
    ViewSet for the ComplianceReference model.
    """
    queryset = ComplianceReference.objects.all()
    serializer_class = ComplianceReferenceSerializer
    search_fields = ['reference_code', 'reference_details']


class BulkModerationTemplateViewSet(BaseModeratorViewSet):
    """
    ViewSet for the BulkModerationTemplate model.
    """
    queryset = BulkModerationTemplate.objects.all()
    serializer_class = BulkModerationTemplateSerializer
    search_fields = ['template_name', 'template_data']


class AnomalyAlertViewSet(BaseModeratorViewSet):
    """
    ViewSet for the AnomalyAlert model.
    """
    queryset = AnomalyAlert.objects.all()
    serializer_class = AnomalyAlertSerializer
    search_fields = ['alert_type', 'alert_data']


class ModerationKnowledgeExchangeViewSet(BaseModeratorViewSet):
    """
    ViewSet for the ModerationKnowledgeExchange model.
    """
    queryset = ModerationKnowledgeExchange.objects.all()
    serializer_class = ModerationKnowledgeExchangeSerializer
    search_fields = ['pattern_data', 'tags']
    filterset_fields = ['shared_by_tenant_id']


class ModeratorPerformanceViewSet(BaseModeratorViewSet):
    """
    ViewSet for the ModeratorPerformance model.
    """
    queryset = ModeratorPerformance.objects.all()
    serializer_class = ModeratorPerformanceSerializer
    search_fields = ['performance_metrics', 'badges_awarded']
    filterset_fields = ['moderator_user']


class InterventionPipelineViewSet(BaseModeratorViewSet):
    """
    ViewSet for the InterventionPipeline model.
    """
    queryset = InterventionPipeline.objects.all()
    serializer_class = InterventionPipelineSerializer
    search_fields = ['pipeline_name', 'trigger_conditions', 'actions']


class LegalSummaryViewSet(BaseModeratorViewSet):
    """
    ViewSet for the LegalSummary model.
    """
    queryset = LegalSummary.objects.all()
    serializer_class = LegalSummarySerializer
    search_fields = ['reference_code', 'summary_text']


class ModeratorAssistantInteractionViewSet(BaseModeratorViewSet):
    """
    ViewSet for the ModeratorAssistantInteraction model.
    """
    queryset = ModeratorAssistantInteraction.objects.all()
    serializer_class = ModeratorAssistantInteractionSerializer
    search_fields = ['query', 'suggested_actions']
    filterset_fields = ['moderator_user']

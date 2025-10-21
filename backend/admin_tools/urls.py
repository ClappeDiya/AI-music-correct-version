# urls.py for Admin and Moderation Tools Module
# This file defines the URL patterns for the admin and moderation tools module,
# including routing for viewsets and any additional custom URLs.

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from tenants.routers import TenantAwareRouter  # Import the custom router


# Instantiate the TenantAwareRouter
router = TenantAwareRouter()

# Register viewsets with the router
router.register(r'moderation-reasons', views.ModerationReasonViewSet, basename='moderation-reason')
router.register(r'reported-content', views.ReportedContentViewSet, basename='reported-content')
router.register(r'moderation-actions', views.ModerationActionViewSet, basename='moderation-action')
router.register(r'bulk-actions', views.BulkActionViewSet, basename='bulk-action')
router.register(r'automated-scanning-results', views.AutomatedScanningResultViewSet, basename='automated-scanning-result')
router.register(r'audit-logs', views.AuditLogViewSet, basename='audit-log')
router.register(r'pattern-moderation-rules', views.PatternModerationRuleViewSet, basename='pattern-moderation-rule')
router.register(r'delegation-chains', views.DelegationChainViewSet, basename='delegation-chain')
router.register(r'compliance-references', views.ComplianceReferenceViewSet, basename='compliance-reference')
router.register(r'bulk-moderation-templates', views.BulkModerationTemplateViewSet, basename='bulk-moderation-template')
router.register(r'anomaly-alerts', views.AnomalyAlertViewSet, basename='anomaly-alert')
router.register(r'moderation-knowledge-exchange', views.ModerationKnowledgeExchangeViewSet, basename='moderation-knowledge-exchange')
router.register(r'moderator-performance', views.ModeratorPerformanceViewSet, basename='moderator-performance')
router.register(r'intervention-pipelines', views.InterventionPipelineViewSet, basename='intervention-pipeline')
router.register(r'legal-summaries', views.LegalSummaryViewSet, basename='legal-summary')
router.register(r'moderator-assistant-interactions', views.ModeratorAssistantInteractionViewSet, basename='moderator-assistant-interaction')


# Define URL patterns
urlpatterns = [
    path('', include(router.urls)), # Include router URLs
    # Add any additional URL patterns here if needed
]

# Set the app namespace
app_name = 'admin_tools'

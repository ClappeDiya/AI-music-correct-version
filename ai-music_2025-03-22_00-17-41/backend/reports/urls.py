# urls.py for reports
# This file defines the URL patterns for the reports app, including API endpoints for managing reports, KPIs, and related data.

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    KPIDefinitionViewSet,
    ReportViewSet,
    ReportResultViewSet,
    ReportScheduleViewSet,
    ReportFeedbackViewSet,
    MetricCacheViewSet,
    AuditLogViewSet,
    DataPrivacySettingsViewSet,
    ExternalDataSourceViewSet,
    VisualizationViewSet,
)

app_name = 'reports'

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r'kpi-definitions', KPIDefinitionViewSet)
router.register(r'reports', ReportViewSet)
router.register(r'report-results', ReportResultViewSet)
router.register(r'report-schedules', ReportScheduleViewSet)
router.register(r'feedback', ReportFeedbackViewSet, basename='feedback')
router.register(r'metrics', MetricCacheViewSet, basename='metrics')
router.register(r'audit-logs', AuditLogViewSet, basename='audit-logs')
router.register(r'privacy-settings', DataPrivacySettingsViewSet)
router.register(r'external-sources', ExternalDataSourceViewSet)
router.register(r'visualizations', VisualizationViewSet, basename='visualizations')

# The API URLs are now determined automatically by the router.
urlpatterns = [
    path('', include(router.urls)),
    
    # Advanced visualization endpoints
    path('visualizations/heatmap/', 
         VisualizationViewSet.as_view({'post': 'heatmap'}),
         name='heatmap'),
    path('visualizations/geomap/',
         VisualizationViewSet.as_view({'post': 'geomap'}),
         name='geomap'),
    path('visualizations/network/',
         VisualizationViewSet.as_view({'post': 'network'}),
         name='network'),
    
    # Metric computation endpoints
    path('metrics/compute/',
         MetricCacheViewSet.as_view({'post': 'compute'}),
         name='compute-metrics'),
    
    # External data sync endpoints
    path('external-sources/<int:pk>/sync/',
         ExternalDataSourceViewSet.as_view({'post': 'sync'}),
         name='sync-external-data'),
    
    # Privacy rule application endpoints
    path('privacy-settings/<int:pk>/apply/',
         DataPrivacySettingsViewSet.as_view({'post': 'apply_rules'}),
         name='apply-privacy-rules'),
    
    # Audit logging endpoints
    path('audit-logs/record/',
         AuditLogViewSet.as_view({'post': 'log_action'}),
         name='log-audit-action'),
]

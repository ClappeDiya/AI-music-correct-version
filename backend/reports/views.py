# views.py for reports
# This file contains the viewsets for the reports app, providing API endpoints for managing reports, KPIs, and related data.

from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters import rest_framework as filters
from django.utils.translation import gettext_lazy as _
from .models import (
    KPIDefinition,
    Report,
    ReportResult,
    ReportSchedule,
    ForecastedMetric,
    PersonaSegment,
    ReportPersonaAssignment,
    QueryTemplate,
    KPIVersionHistory,
    MultiModalInteraction,
    QuantumLicensingKey,
    BlockchainRoyaltyLedger,
    NeurofeedbackMusicConfig,
    HolographicStageSetting,
    BioInspiredRecoStrategy,
    DecentralizedComputeConfig,
    ReportFeedback,
    MetricCache,
    AuditLog,
    DataPrivacySettings,
    ExternalDataSource,
    VisualizationCache,
)
from .serializers import (
    KPIDefinitionSerializer,
    ReportSerializer,
    ReportResultSerializer,
    ReportScheduleSerializer,
    ForecastedMetricSerializer,
    PersonaSegmentSerializer,
    ReportPersonaAssignmentSerializer,
    QueryTemplateSerializer,
    KPIVersionHistorySerializer,
    MultiModalInteractionSerializer,
    QuantumLicensingKeySerializer,
    BlockchainRoyaltyLedgerSerializer,
    NeurofeedbackMusicConfigSerializer,
    HolographicStageSettingSerializer,
    BioInspiredRecoStrategySerializer,
    DecentralizedComputeConfigSerializer,
    ReportFeedbackSerializer,
    MetricCacheSerializer,
    AuditLogSerializer,
    DataPrivacySettingsSerializer,
    ExternalDataSourceSerializer,
    VisualizationCacheSerializer,
    AdvancedMetricsSerializer,
    GeoVisualizationSerializer,
    HeatmapDataSerializer,
    NetworkGraphSerializer,
)
from tenants.mixins import TenantAwareMixin, FilterSearchMixin
from user_management.models import User  # Import the custom user model
from django.db.models import Q
from rest_framework.permissions import IsAuthenticated
from .permissions import IsReportOwner
from .utils import (
    anonymize_data,
    apply_privacy_rules,
    compute_metrics,
    fetch_external_data,
)


class BaseTenantAwareViewSet(TenantAwareMixin, FilterSearchMixin, viewsets.ModelViewSet):
    """
    Base viewset that combines TenantAwareMixin, FilterSearchMixin, and ModelViewSet.
    """
    pass


class UserSpecificViewSet(viewsets.ModelViewSet):
    """
    Base ViewSet that implements user-specific access control
    """
    def get_queryset(self):
        """
        Filter queryset based on user permissions and ownership
        """
        base_qs = super().get_queryset()
        user = self.request.user
        
        if hasattr(base_qs.model, 'user_viewable_reports'):
            return base_qs.model.user_viewable_reports(user)
        
        # Default to user-specific filtering if no custom method exists
        if hasattr(base_qs.model, 'user'):
            return base_qs.filter(user=user)
        
        return base_qs

    def perform_create(self, serializer):
        """
        Set the user when creating new objects
        """
        if hasattr(serializer.Meta.model, 'user'):
            serializer.save(user=self.request.user)
        else:
            serializer.save()


class KPIDefinitionViewSet(UserSpecificViewSet):
    """
    ViewSet for KPI definitions with user-specific access control
    """
    serializer_class = KPIDefinitionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return KPIDefinition.user_viewable_kpis(self.request.user)


class ReportViewSet(viewsets.ModelViewSet):
    """
    ViewSet for reports with user-specific access control
    """
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Report.objects.filter(
            Q(user=user) | Q(is_public=True) | Q(shared_with__contains=[user.id])
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def share(self, request, pk=None):
        report = self.get_object()
        users = request.data.get('users', [])
        
        if not isinstance(users, list):
            return Response(
                {"error": "users must be a list of user IDs"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify all users exist
        user_count = User.objects.filter(id__in=users).count()
        if user_count != len(users):
            return Response(
                {"error": "Some user IDs are invalid"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update shared_with field
        current_shared = report.shared_with or []
        report.shared_with = list(set(current_shared + users))
        report.save()
        
        return Response({"status": "success", "shared_with": report.shared_with})


class ReportResultViewSet(BaseTenantAwareViewSet):
    """
    ViewSet for the ReportResult model.
    """
    queryset = ReportResult.objects.all()
    serializer_class = ReportResultSerializer
    filter_fields = ['report']
    search_fields = ['generated_data']


class ReportScheduleViewSet(viewsets.ModelViewSet):
    """
    ViewSet for the ReportSchedule model.
    """
    serializer_class = ReportScheduleSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ReportSchedule.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        schedule = self.get_object()
        schedule.is_active = True
        schedule.save()
        
        # Trigger immediate schedule processing if needed
        process_report_schedule.delay(schedule.id)
        
        return Response({
            "status": "success",
            "message": "Schedule activated successfully"
        })

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        schedule = self.get_object()
        schedule.is_active = False
        schedule.save()
        
        # Cancel any pending scheduled tasks
        cancel_scheduled_reports.delay(schedule.id)
        
        return Response({
            "status": "success",
            "message": "Schedule deactivated successfully"
        })

    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        schedule = self.get_object()
        schedule.is_active = not schedule.is_active
        schedule.save()
        
        if schedule.is_active:
            process_report_schedule.delay(schedule.id)
        else:
            cancel_scheduled_reports.delay(schedule.id)
        
        return Response({
            "status": "success",
            "is_active": schedule.is_active
        })


class ForecastedMetricViewSet(BaseTenantAwareViewSet):
    """
    ViewSet for the ForecastedMetric model.
    """
    queryset = ForecastedMetric.objects.all()
    serializer_class = ForecastedMetricSerializer
    filter_fields = ['report', 'model_version']
    search_fields = ['forecast_data']


class PersonaSegmentViewSet(BaseTenantAwareViewSet):
    """
    ViewSet for the PersonaSegment model.
    """
    queryset = PersonaSegment.objects.all()
    serializer_class = PersonaSegmentSerializer
    filter_fields = ['segment_name']
    search_fields = ['segment_name', 'segment_criteria']


class ReportPersonaAssignmentViewSet(BaseTenantAwareViewSet):
    """
    ViewSet for the ReportPersonaAssignment model.
    """
    queryset = ReportPersonaAssignment.objects.all()
    serializer_class = ReportPersonaAssignmentSerializer
    filter_fields = ['report', 'persona']


class QueryTemplateViewSet(BaseTenantAwareViewSet):
    """
    ViewSet for the QueryTemplate model.
    """
    queryset = QueryTemplate.objects.all()
    serializer_class = QueryTemplateSerializer
    filter_fields = ['template_name', 'user']
    search_fields = ['template_name', 'query_definition']


class KPIVersionHistoryViewSet(BaseTenantAwareViewSet):
    """
    ViewSet for the KPIVersionHistory model.
    """
    queryset = KPIVersionHistory.objects.all()
    serializer_class = KPIVersionHistorySerializer
    filter_fields = ['kpi_name', 'version']
    search_fields = ['kpi_name', 'definition_snapshot']


class MultiModalInteractionViewSet(BaseTenantAwareViewSet):
    """
    ViewSet for the MultiModalInteraction model.
    """
    queryset = MultiModalInteraction.objects.all()
    serializer_class = MultiModalInteractionSerializer
    filter_fields = ['user']
    search_fields = ['interaction_config']


class QuantumLicensingKeyViewSet(BaseTenantAwareViewSet):
    """
    ViewSet for the QuantumLicensingKey model.
    """
    queryset = QuantumLicensingKey.objects.all()
    serializer_class = QuantumLicensingKeySerializer
    filter_fields = ['track_id']
    search_fields = ['quantum_safe_key', 'validity_period']


class BlockchainRoyaltyLedgerViewSet(BaseTenantAwareViewSet):
    """
    ViewSet for the BlockchainRoyaltyLedger model.
    """
    queryset = BlockchainRoyaltyLedger.objects.all()
    serializer_class = BlockchainRoyaltyLedgerSerializer
    filter_fields = ['track_id']
    search_fields = ['transaction_ref', 'distribution_data']


class NeurofeedbackMusicConfigViewSet(BaseTenantAwareViewSet):
    """
    ViewSet for the NeurofeedbackMusicConfig model.
    """
    queryset = NeurofeedbackMusicConfig.objects.all()
    serializer_class = NeurofeedbackMusicConfigSerializer
    filter_fields = ['user']
    search_fields = ['neural_params']


class HolographicStageSettingViewSet(BaseTenantAwareViewSet):
    """
    ViewSet for the HolographicStageSetting model.
    """
    queryset = HolographicStageSetting.objects.all()
    serializer_class = HolographicStageSettingSerializer
    filter_fields = ['event_id']
    search_fields = ['hologram_config']


class BioInspiredRecoStrategyViewSet(BaseTenantAwareViewSet):
    """
    ViewSet for the BioInspiredRecoStrategy model.
    """
    queryset = BioInspiredRecoStrategy.objects.all()
    serializer_class = BioInspiredRecoStrategySerializer
    filter_fields = ['strategy_name']
    search_fields = ['strategy_name', 'algorithm_params']


class DecentralizedComputeConfigViewSet(BaseTenantAwareViewSet):
    """
    ViewSet for the DecentralizedComputeConfig model.
    """
    queryset = DecentralizedComputeConfig.objects.all()
    serializer_class = DecentralizedComputeConfigSerializer
    filter_fields = ['partner_id']
    search_fields = ['partner_id', 'connection_details']


class ReportFeedbackViewSet(viewsets.ModelViewSet):
    serializer_class = ReportFeedbackSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ReportFeedback.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class MetricCacheViewSet(viewsets.ModelViewSet):
    serializer_class = MetricCacheSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return MetricCache.objects.filter(
            expires_at__gt=timezone.now()
        )

    @action(detail=False, methods=['post'])
    def compute(self, request):
        key = request.data.get('key')
        if not key:
            return Response(
                {"error": "Key is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        data = MetricCache.get_or_compute(
            key,
            lambda: compute_metrics(request.data),
            timeout=3600
        )
        return Response(data)


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return AuditLog.objects.filter(user=self.request.user)

    @action(detail=False, methods=['post'])
    def log_action(self, request):
        serializer = AuditLogSerializer(data={
            **request.data,
            'user': request.user.id,
            'ip_address': request.META.get('REMOTE_ADDR'),
            'user_agent': request.META.get('HTTP_USER_AGENT'),
        })
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class DataPrivacySettingsViewSet(viewsets.ModelViewSet):
    serializer_class = DataPrivacySettingsSerializer
    permission_classes = [IsAuthenticated]
    queryset = DataPrivacySettings.objects.all()

    @action(detail=True, methods=['post'])
    def apply_rules(self, request, pk=None):
        settings = self.get_object()
        data = request.data.get('data', [])
        
        anonymized_data = apply_privacy_rules(
            data,
            settings.anonymization_rules,
            settings.masking_rules,
            settings.min_aggregation_size
        )
        return Response(anonymized_data)


class ExternalDataSourceViewSet(viewsets.ModelViewSet):
    serializer_class = ExternalDataSourceSerializer
    permission_classes = [IsAuthenticated]
    queryset = ExternalDataSource.objects.all()

    @action(detail=True, methods=['post'])
    def sync(self, request, pk=None):
        source = self.get_object()
        try:
            data = fetch_external_data(source)
            source.last_sync = timezone.now()
            source.save()
            return Response(data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class VisualizationViewSet(viewsets.ModelViewSet):
    serializer_class = VisualizationCacheSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return VisualizationCache.objects.filter(
            expires_at__gt=timezone.now()
        )

    @action(detail=False, methods=['post'])
    def heatmap(self, request):
        serializer = HeatmapDataSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        cache_key = f"heatmap:{hash(frozenset(request.data.items()))}"
        data = VisualizationCache.get_or_compute(
            cache_key,
            lambda: self._compute_heatmap(serializer.validated_data)
        )
        return Response(data)

    @action(detail=False, methods=['post'])
    def geomap(self, request):
        serializer = GeoVisualizationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        cache_key = f"geomap:{hash(frozenset(request.data.items()))}"
        data = VisualizationCache.get_or_compute(
            cache_key,
            lambda: self._compute_geomap(serializer.validated_data)
        )
        return Response(data)

    @action(detail=False, methods=['post'])
    def network(self, request):
        serializer = NetworkGraphSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        cache_key = f"network:{hash(frozenset(request.data.items()))}"
        data = VisualizationCache.get_or_compute(
            cache_key,
            lambda: self._compute_network(serializer.validated_data)
        )
        return Response(data)

    def _compute_heatmap(self, data):
        # Implementation for heatmap computation
        pass

    def _compute_geomap(self, data):
        # Implementation for geomap computation
        pass

    def _compute_network(self, data):
        # Implementation for network graph computation
        pass

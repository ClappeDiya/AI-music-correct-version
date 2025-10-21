from rest_framework import serializers
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
from tenants.serializers import TenantAwareMixin


class UserAwareSerializer(serializers.ModelSerializer):
    """
    Base serializer that handles user-specific logic
    """
    def validate(self, data):
        """
        Add user-specific validation
        """
        request = self.context.get('request')
        if request and hasattr(self.Meta.model, 'user'):
            data['user'] = request.user
        return data


class KPIDefinitionSerializer(UserAwareSerializer):
    """
    Serializer for the KPIDefinition model.
    """
    class Meta:
        model = KPIDefinition
        fields = ['id', 'kpi_name', 'description', 'calculation_details', 'created_at']
        read_only_fields = ['id', 'created_at']


class ReportSerializer(UserAwareSerializer):
    """
    Serializer for the Report model.
    """
    class Meta:
        model = Report
        fields = ['id', 'report_name', 'report_parameters', 'created_at', 'is_public', 'shared_with']
        read_only_fields = ['id', 'created_at']

    def validate_shared_with(self, value):
        """
        Validate that the user has permission to share reports
        """
        request = self.context.get('request')
        if request and not request.user.has_perm('reports.share_reports'):
            raise serializers.ValidationError("You don't have permission to share reports")
        return value


class ReportResultSerializer(TenantAwareMixin, serializers.ModelSerializer):
    """
    Serializer for the ReportResult model.
    """
    class Meta:
        model = ReportResult
        fields = ['id', 'report', 'generated_data', 'generated_at']
        read_only_fields = ['id', 'generated_at']


class ReportScheduleSerializer(TenantAwareMixin, serializers.ModelSerializer):
    """
    Serializer for the ReportSchedule model.
    """
    class Meta:
        model = ReportSchedule
        fields = ['id', 'report', 'schedule_cron', 'delivery_channels', 'active']
        read_only_fields = ['id']


class ForecastedMetricSerializer(TenantAwareMixin, serializers.ModelSerializer):
    """
    Serializer for the ForecastedMetric model.
    """
    class Meta:
        model = ForecastedMetric
        fields = ['id', 'report', 'forecast_data', 'model_version', 'generated_at']
        read_only_fields = ['id', 'generated_at']


class PersonaSegmentSerializer(TenantAwareMixin, serializers.ModelSerializer):
    """
    Serializer for the PersonaSegment model.
    """
    class Meta:
        model = PersonaSegment
        fields = ['id', 'segment_name', 'segment_criteria', 'created_at']
        read_only_fields = ['id', 'created_at']


class ReportPersonaAssignmentSerializer(TenantAwareMixin, serializers.ModelSerializer):
    """
    Serializer for the ReportPersonaAssignment model.
    """
    class Meta:
        model = ReportPersonaAssignment
        fields = ['id', 'report', 'persona']
        read_only_fields = ['id']


class QueryTemplateSerializer(TenantAwareMixin, serializers.ModelSerializer):
    """
    Serializer for the QueryTemplate model.
    """
    class Meta:
        model = QueryTemplate
        fields = ['id', 'user', 'template_name', 'query_definition', 'created_at']
        read_only_fields = ['id', 'created_at']


class KPIVersionHistorySerializer(TenantAwareMixin, serializers.ModelSerializer):
    """
    Serializer for the KPIVersionHistory model.
    """
    class Meta:
        model = KPIVersionHistory
        fields = ['id', 'kpi_name', 'version', 'definition_snapshot', 'changed_at']
        read_only_fields = ['id', 'changed_at']


class MultiModalInteractionSerializer(TenantAwareMixin, serializers.ModelSerializer):
    """
    Serializer for the MultiModalInteraction model.
    """
    class Meta:
        model = MultiModalInteraction
        fields = ['id', 'user', 'interaction_config', 'updated_at']
        read_only_fields = ['id', 'updated_at']


class QuantumLicensingKeySerializer(TenantAwareMixin, serializers.ModelSerializer):
    """
    Serializer for the QuantumLicensingKey model.
    """
    class Meta:
        model = QuantumLicensingKey
        fields = ['id', 'track_id', 'quantum_safe_key', 'validity_period', 'updated_at']
        read_only_fields = ['id', 'updated_at']


class BlockchainRoyaltyLedgerSerializer(TenantAwareMixin, serializers.ModelSerializer):
    """
    Serializer for the BlockchainRoyaltyLedger model.
    """
    class Meta:
        model = BlockchainRoyaltyLedger
        fields = ['id', 'track_id', 'transaction_ref', 'distribution_data', 'recorded_at']
        read_only_fields = ['id', 'recorded_at']


class NeurofeedbackMusicConfigSerializer(TenantAwareMixin, serializers.ModelSerializer):
    """
    Serializer for the NeurofeedbackMusicConfig model.
    """
    class Meta:
        model = NeurofeedbackMusicConfig
        fields = ['id', 'user', 'neural_params', 'last_calibrated']
        read_only_fields = ['id', 'last_calibrated']


class HolographicStageSettingSerializer(TenantAwareMixin, serializers.ModelSerializer):
    """
    Serializer for the HolographicStageSetting model.
    """
    class Meta:
        model = HolographicStageSetting
        fields = ['id', 'event_id', 'hologram_config', 'updated_at']
        read_only_fields = ['id', 'updated_at']


class BioInspiredRecoStrategySerializer(TenantAwareMixin, serializers.ModelSerializer):
    """
    Serializer for the BioInspiredRecoStrategy model.
    """
    class Meta:
        model = BioInspiredRecoStrategy
        fields = ['id', 'strategy_name', 'algorithm_params', 'updated_at']
        read_only_fields = ['id', 'updated_at']


class DecentralizedComputeConfigSerializer(TenantAwareMixin, serializers.ModelSerializer):
    """
    Serializer for the DecentralizedComputeConfig model.
    """
    class Meta:
        model = DecentralizedComputeConfig
        fields = ['id', 'partner_id', 'connection_details', 'established_at']
        read_only_fields = ['id', 'established_at']


class ReportFeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReportFeedback
        fields = ['id', 'user', 'report_id', 'rating', 'category', 'comment', 'created_at']
        read_only_fields = ['id', 'created_at']


class MetricCacheSerializer(serializers.ModelSerializer):
    class Meta:
        model = MetricCache
        fields = ['key', 'data', 'last_updated', 'expires_at']
        read_only_fields = ['last_updated']


class AuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditLog
        fields = ['id', 'user', 'action', 'report_id', 'timestamp', 'details', 'ip_address', 'user_agent']
        read_only_fields = ['id', 'timestamp']


class ReportScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReportSchedule
        fields = ['id', 'user', 'report_type', 'frequency', 'parameters', 'next_run', 
                 'last_run', 'recipients', 'is_active']
        read_only_fields = ['id', 'last_run']

    def validate_recipients(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("Recipients must be a list")
        return value


class DataPrivacySettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = DataPrivacySettings
        fields = ['id', 'report_type', 'anonymization_rules', 'masking_rules', 
                 'min_aggregation_size', 'retention_days', 'requires_consent']

    def validate_min_aggregation_size(self, value):
        if value < 1:
            raise serializers.ValidationError("Minimum aggregation size must be at least 1")
        return value


class ExternalDataSourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExternalDataSource
        fields = ['id', 'name', 'source_type', 'connection_details', 'last_sync', 
                 'sync_frequency', 'is_active']
        read_only_fields = ['id', 'last_sync']

    def validate_connection_details(self, value):
        required_fields = ['url', 'auth_type']
        for field in required_fields:
            if field not in value:
                raise serializers.ValidationError(f"Missing required field: {field}")
        return value


class VisualizationCacheSerializer(serializers.ModelSerializer):
    class Meta:
        model = VisualizationCache
        fields = ['id', 'cache_key', 'data', 'created_at', 'expires_at', 
                 'visualization_type', 'parameters']
        read_only_fields = ['id', 'created_at']


class AdvancedMetricsSerializer(serializers.Serializer):
    start_date = serializers.DateField(required=True)
    end_date = serializers.DateField(required=True)
    metrics = serializers.ListField(child=serializers.CharField(), required=True)
    grouping = serializers.ListField(child=serializers.CharField(), required=False)
    filters = serializers.DictField(required=False)

    def validate(self, data):
        if data['start_date'] > data['end_date']:
            raise serializers.ValidationError("End date must be after start date")
        return data


class GeoVisualizationSerializer(serializers.Serializer):
    location_type = serializers.ChoiceField(choices=['country', 'region', 'city'])
    metric = serializers.CharField()
    time_range = serializers.IntegerField(min_value=1)
    aggregation = serializers.ChoiceField(choices=['sum', 'avg', 'count'])


class HeatmapDataSerializer(serializers.Serializer):
    x_axis = serializers.CharField()
    y_axis = serializers.CharField()
    value_field = serializers.CharField()
    time_range = serializers.IntegerField(min_value=1)
    filters = serializers.DictField(required=False)


class NetworkGraphSerializer(serializers.Serializer):
    node_type = serializers.CharField()
    edge_type = serializers.CharField()
    metrics = serializers.ListField(child=serializers.CharField())
    depth = serializers.IntegerField(min_value=1, max_value=3)
    filters = serializers.DictField(required=False)

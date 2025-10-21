from django.contrib import admin
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
    DecentralizedComputeConfig
)


@admin.register(KPIDefinition)
class KPIDefinitionAdmin(admin.ModelAdmin):
    """
    Admin class for the KPIDefinition model.
    """
    list_display = ['kpi_name', 'description', 'created_at']
    search_fields = ['kpi_name', 'description']
    readonly_fields = ['id', 'created_at']


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    """
    Admin class for the Report model.
    """
    list_display = ['report_name', 'user', 'created_at']
    list_filter = ['user']
    search_fields = ['report_name', 'report_parameters']
    readonly_fields = ['id', 'created_at']
    list_select_related = ['user']


@admin.register(ReportResult)
class ReportResultAdmin(admin.ModelAdmin):
    """
    Admin class for the ReportResult model.
    """
    list_display = ['report', 'generated_at']
    list_filter = ['report']
    search_fields = ['generated_data']
    readonly_fields = ['id', 'generated_at']
    list_select_related = ['report']


@admin.register(ReportSchedule)
class ReportScheduleAdmin(admin.ModelAdmin):
    """
    Admin class for the ReportSchedule model.
    """
    list_display = ['report', 'schedule_cron', 'active']
    list_filter = ['active']
    search_fields = ['schedule_cron', 'delivery_channels']
    readonly_fields = ['id']
    list_select_related = ['report']


@admin.register(ForecastedMetric)
class ForecastedMetricAdmin(admin.ModelAdmin):
    """
    Admin class for the ForecastedMetric model.
    """
    list_display = ['report', 'model_version', 'generated_at']
    list_filter = ['report', 'model_version']
    search_fields = ['forecast_data']
    readonly_fields = ['id', 'generated_at']
    list_select_related = ['report']


@admin.register(PersonaSegment)
class PersonaSegmentAdmin(admin.ModelAdmin):
    """
    Admin class for the PersonaSegment model.
    """
    list_display = ['segment_name', 'created_at']
    search_fields = ['segment_name', 'segment_criteria']
    readonly_fields = ['id', 'created_at']


@admin.register(ReportPersonaAssignment)
class ReportPersonaAssignmentAdmin(admin.ModelAdmin):
    """
    Admin class for the ReportPersonaAssignment model.
    """
    list_display = ['report', 'persona']
    list_filter = ['report', 'persona']
    readonly_fields = ['id']
    list_select_related = ['report', 'persona']


@admin.register(QueryTemplate)
class QueryTemplateAdmin(admin.ModelAdmin):
    """
    Admin class for the QueryTemplate model.
    """
    list_display = ['template_name', 'user', 'created_at']
    list_filter = ['user']
    search_fields = ['template_name', 'query_definition']
    readonly_fields = ['id', 'created_at']
    list_select_related = ['user']


@admin.register(KPIVersionHistory)
class KPIVersionHistoryAdmin(admin.ModelAdmin):
    """
    Admin class for the KPIVersionHistory model.
    """
    list_display = ['kpi_name', 'version', 'changed_at']
    list_filter = ['kpi_name']
    search_fields = ['kpi_name', 'definition_snapshot']
    readonly_fields = ['id', 'changed_at']


@admin.register(MultiModalInteraction)
class MultiModalInteractionAdmin(admin.ModelAdmin):
    """
    Admin class for the MultiModalInteraction model.
    """
    list_display = ['user', 'updated_at']
    list_filter = ['user']
    search_fields = ['interaction_config']
    readonly_fields = ['id', 'updated_at']
    list_select_related = ['user']


@admin.register(QuantumLicensingKey)
class QuantumLicensingKeyAdmin(admin.ModelAdmin):
    """
    Admin class for the QuantumLicensingKey model.
    """
    list_display = ['track_id', 'updated_at']
    list_filter = ['track_id']
    search_fields = ['quantum_safe_key', 'validity_period']
    readonly_fields = ['id', 'updated_at']
    list_select_related = ['track_id']


@admin.register(BlockchainRoyaltyLedger)
class BlockchainRoyaltyLedgerAdmin(admin.ModelAdmin):
    """
    Admin class for the BlockchainRoyaltyLedger model.
    """
    list_display = ['track_id', 'recorded_at']
    list_filter = ['track_id']
    search_fields = ['transaction_ref', 'distribution_data']
    readonly_fields = ['id', 'recorded_at']
    list_select_related = ['track_id']


@admin.register(NeurofeedbackMusicConfig)
class NeurofeedbackMusicConfigAdmin(admin.ModelAdmin):
    """
    Admin class for the NeurofeedbackMusicConfig model.
    """
    list_display = ['user', 'last_calibrated']
    list_filter = ['user']
    search_fields = ['neural_params']
    readonly_fields = ['id', 'last_calibrated']
    list_select_related = ['user']


@admin.register(HolographicStageSetting)
class HolographicStageSettingAdmin(admin.ModelAdmin):
    """
    Admin class for the HolographicStageSetting model.
    """
    list_display = ['event_id', 'updated_at']
    list_filter = ['event_id']
    search_fields = ['hologram_config']
    readonly_fields = ['id', 'updated_at']
    list_select_related = ['event_id']


@admin.register(BioInspiredRecoStrategy)
class BioInspiredRecoStrategyAdmin(admin.ModelAdmin):
    """
    Admin class for the BioInspiredRecoStrategy model.
    """
    list_display = ['strategy_name', 'updated_at']
    search_fields = ['strategy_name', 'algorithm_params']
    readonly_fields = ['id', 'updated_at']


@admin.register(DecentralizedComputeConfig)
class DecentralizedComputeConfigAdmin(admin.ModelAdmin):
    """
    Admin class for the DecentralizedComputeConfig model.
    """
    list_display = ['partner_id', 'established_at']
    search_fields = ['partner_id', 'connection_details']
    readonly_fields = ['id', 'established_at']

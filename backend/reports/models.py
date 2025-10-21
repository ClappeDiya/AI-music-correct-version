from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from django.db.models import Q
from django.contrib.auth import get_user_model
from django.db.models import JSONField
from django.core.cache import cache
from django.core.cache.backends.base import InvalidCacheBackendError
from django.core.cache.utils import make_template_fragment_key
from django.utils import timezone
from datetime import timedelta

User = get_user_model()

class KPIDefinition(models.Model):
    """
    Represents a global KPI definition.
    """
    id = models.BigAutoField(primary_key=True, verbose_name=_("ID"), help_text=_("Unique identifier for the KPI definition."))
    kpi_name = models.TextField(unique=True, verbose_name=_("KPI Name"), help_text=_("Unique name of the KPI."))
    description = models.TextField(null=True, blank=True, verbose_name=_("Description"), help_text=_("Description of the KPI."))
    calculation_details = models.JSONField(null=True, blank=True, verbose_name=_("Calculation Details"), help_text=_("JSON object containing details on how to calculate the KPI."))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='created_kpis')

    def __str__(self):
        return self.kpi_name

    class Meta:
        verbose_name = _("KPI Definition")
        verbose_name_plural = _("KPI Definitions")
        permissions = [
            ("view_all_kpis", "Can view all KPI definitions"),
            ("manage_kpis", "Can manage KPI definitions"),
        ]

    @staticmethod
    def user_viewable_kpis(user):
        """Return KPIs viewable by the user based on permissions"""
        if user.has_perm('reports.view_all_kpis'):
            return KPIDefinition.objects.all()
        return KPIDefinition.objects.filter(created_by=user)


class Report(models.Model):
    """
    Represents a report configuration.
    """
    id = models.BigAutoField(primary_key=True, verbose_name=_("ID"))
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reports')
    report_name = models.TextField(verbose_name=_("Report Name"))
    report_parameters = models.JSONField(null=True, blank=True, verbose_name=_("Report Parameters"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))
    is_public = models.BooleanField(default=False, verbose_name=_("Public Report"))
    shared_with = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='shared_reports',
        blank=True,
        verbose_name=_("Shared With")
    )

    def __str__(self):
        return self.report_name

    class Meta:
        verbose_name = _("Report")
        verbose_name_plural = _("Reports")
        permissions = [
            ("share_reports", "Can share reports with other users"),
            ("view_all_reports", "Can view all reports"),
        ]

    @staticmethod
    def user_viewable_reports(user):
        """Return reports viewable by the user"""
        if user.has_perm('reports.view_all_reports'):
            return Report.objects.all()
        return Report.objects.filter(
            Q(user=user) |  # Own reports
            Q(shared_with=user) |  # Shared with user
            Q(is_public=True)  # Public reports
        ).distinct()


class ReportResult(models.Model):
    """
    Stores the results of a generated report.
    """
    id = models.BigAutoField(primary_key=True, verbose_name=_("ID"), help_text=_("Unique identifier for the report result."))
    report = models.ForeignKey(Report, on_delete=models.CASCADE, related_name='report_results', verbose_name=_("Report"), help_text=_("Report for which the result was generated."))
    generated_data = models.JSONField(null=True, blank=True, verbose_name=_("Generated Data"), help_text=_("JSON object containing the final data result, including rows and summary."))
    generated_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Generated At"), help_text=_("Timestamp when the report result was generated."))

    def __str__(self):
        return f"Result for {self.report.report_name} at {self.generated_at}"

    class Meta:
        verbose_name = _("Report Result")
        verbose_name_plural = _("Report Results")
        # Indexes and Constraints
        # CREATE INDEX IF NOT EXISTS idx_rr_report_id ON tenant_{tenant_id}.report_results(report_id);
        # Security Policies
        # ALTER TABLE tenant_{tenant_id}.report_results ENABLE ROW LEVEL SECURITY;
        # CREATE POLICY report_results_access ON tenant_{tenant_id}.report_results
        #     FOR SELECT USING (report_id IN (SELECT id FROM tenant_{tenant_id}.reports WHERE user_id = current_setting('app.current_user_id')::uuid));


class ReportSchedule(models.Model):
    """
    Defines a schedule for automated report generation.
    """
    id = models.BigAutoField(primary_key=True, verbose_name=_("ID"), help_text=_("Unique identifier for the report schedule."))
    report = models.ForeignKey(Report, on_delete=models.CASCADE, related_name='report_schedules', verbose_name=_("Report"), help_text=_("Report to be scheduled."))
    schedule_cron = models.TextField(verbose_name=_("Schedule Cron"), help_text=_("Cron expression for the report schedule."))
    delivery_channels = models.JSONField(null=True, blank=True, verbose_name=_("Delivery Channels"), help_text=_("JSON object containing delivery channels, such as email addresses and Slack webhooks."))
    active = models.BooleanField(default=True, verbose_name=_("Active"), help_text=_("Indicates if the schedule is active."))

    def __str__(self):
        return f"Schedule for {self.report.report_name}"

    class Meta:
        verbose_name = _("Report Schedule")
        verbose_name_plural = _("Report Schedules")
        # Indexes and Constraints
        # CREATE INDEX IF NOT EXISTS idx_rs_report_id ON tenant_{tenant_id}.report_schedules(report_id);
        # Security Policies
        # ALTER TABLE tenant_{tenant_id}.report_schedules ENABLE ROW LEVEL SECURITY;
        # CREATE POLICY report_schedules_access ON tenant_{tenant_id}.report_schedules
        #     FOR SELECT USING (report_id IN (SELECT id FROM tenant_{tenant_id}.reports WHERE user_id = current_setting('app.current_user_id')::uuid));


class ForecastedMetric(models.Model):
    """
    Stores forecasted metrics for reports.
    """
    id = models.BigAutoField(primary_key=True, verbose_name=_("ID"), help_text=_("Unique identifier for the forecasted metric."))
    report = models.ForeignKey(Report, on_delete=models.CASCADE, related_name='forecasted_metrics', verbose_name=_("Report"), help_text=_("Report for which the metrics are forecasted."))
    forecast_data = models.JSONField(null=True, blank=True, verbose_name=_("Forecast Data"), help_text=_("JSON object containing forecasted data, including predictions and dates."))
    model_version = models.TextField(null=True, blank=True, verbose_name=_("Model Version"), help_text=_("Version of the model used for forecasting."))
    generated_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Generated At"), help_text=_("Timestamp when the forecast was generated."))

    def __str__(self):
         return f"Forecast for {self.report.report_name} at {self.generated_at}"

    class Meta:
        verbose_name = _("Forecasted Metric")
        verbose_name_plural = _("Forecasted Metrics")
        # Indexes and Constraints
        # CREATE INDEX IF NOT EXISTS idx_fm_report_id ON tenant_{tenant_id}.forecasted_metrics(report_id);
        # Security Policies
        # ALTER TABLE tenant_{tenant_id}.forecasted_metrics ENABLE ROW LEVEL SECURITY;
        # CREATE POLICY forecasted_metrics_access ON tenant_{tenant_id}.forecasted_metrics
        #     FOR SELECT USING (report_id IN (SELECT id FROM tenant_{tenant_id}.reports WHERE user_id = current_setting('app.current_user_id')::uuid));


class PersonaSegment(models.Model):
    """
    Defines a persona segment for targeted reports.
    """
    id = models.BigAutoField(primary_key=True, verbose_name=_("ID"), help_text=_("Unique identifier for the persona segment."))
    segment_name = models.TextField(unique=True, verbose_name=_("Segment Name"), help_text=_("Name of the persona segment."))
    segment_criteria = models.JSONField(null=True, blank=True, verbose_name=_("Segment Criteria"), help_text=_("JSON object containing criteria for the persona segment."))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("Timestamp when the persona segment was created."))

    def __str__(self):
        return self.segment_name

    class Meta:
        verbose_name = _("Persona Segment")
        verbose_name_plural = _("Persona Segments")
        # Indexes and Constraints
        models.Index(fields=['segment_name'], name='idx_ps_name'),
        # Security Policies
        # ALTER TABLE tenant_{tenant_id}.persona_segments ENABLE ROW LEVEL SECURITY;
        # CREATE POLICY persona_segments_access ON tenant_{tenant_id}.persona_segments
        #     FOR SELECT USING (TRUE);


class ReportPersonaAssignment(models.Model):
    """
    Assigns persona segments to reports.
    """
    id = models.BigAutoField(primary_key=True, verbose_name=_("ID"), help_text=_("Unique identifier for the report persona assignment."))
    report = models.ForeignKey(Report, on_delete=models.CASCADE, related_name='report_persona_assignments', verbose_name=_("Report"), help_text=_("Report to which the persona segment is assigned."))
    persona = models.ForeignKey(PersonaSegment, on_delete=models.CASCADE, related_name='report_persona_assignments', verbose_name=_("Persona Segment"), help_text=_("Persona segment assigned to the report."))

    def __str__(self):
        return f"Assignment of {self.persona.segment_name} to {self.report.report_name}"

    class Meta:
        verbose_name = _("Report Persona Assignment")
        verbose_name_plural = _("Report Persona Assignments")
        unique_together = ('report', 'persona')
        # Indexes and Constraints
        # Security Policies
        # ALTER TABLE tenant_{tenant_id}.report_persona_assignments ENABLE ROW LEVEL SECURITY;
        # CREATE POLICY report_persona_assignments_access ON tenant_{tenant_id}.report_persona_assignments
        #     FOR SELECT USING (report_id IN (SELECT id FROM tenant_{tenant_id}.reports WHERE user_id = current_setting('app.current_user_id')::uuid));


class QueryTemplate(models.Model):
    """
    Stores interactive query templates for ad-hoc analysis.
    """
    id = models.BigAutoField(primary_key=True, verbose_name=_("ID"), help_text=_("Unique identifier for the query template."))
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='query_templates', verbose_name=_("User"), help_text=_("User who created the query template."))
    template_name = models.TextField(verbose_name=_("Template Name"), help_text=_("Name of the query template."))
    query_definition = models.JSONField(null=True, blank=True, verbose_name=_("Query Definition"), help_text=_("JSON object containing the SQL query and parameters."))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("Timestamp when the query template was created."))

    def __str__(self):
        return self.template_name

    class Meta:
        verbose_name = _("Query Template")
        verbose_name_plural = _("Query Templates")
        unique_together = ('user', 'template_name')
        # Indexes and Constraints
        # CREATE INDEX IF NOT EXISTS idx_qt_user_id ON tenant_{tenant_id}.query_templates(user_id);
        # Security Policies
        # ALTER TABLE tenant_{tenant_id}.query_templates ENABLE ROW LEVEL SECURITY;
        # CREATE POLICY query_templates_access ON tenant_{tenant_id}.query_templates
        #     FOR SELECT USING (user_id = current_setting('app.current_user_id')::uuid);


class KPIVersionHistory(models.Model):
    """
    Tracks changes in KPI definitions over time.
    """
    id = models.BigAutoField(primary_key=True, verbose_name=_("ID"), help_text=_("Unique identifier for the KPI version history."))
    kpi_name = models.TextField(verbose_name=_("KPI Name"), help_text=_("Name of the KPI."))
    version = models.IntegerField(verbose_name=_("Version"), help_text=_("Version number of the KPI definition."))
    definition_snapshot = models.JSONField(null=True, blank=True, verbose_name=_("Definition Snapshot"), help_text=_("JSON object containing a snapshot of how the KPI was defined at a certain version."))
    changed_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Changed At"), help_text=_("Timestamp when the KPI definition was changed."))

    def __str__(self):
        return f"{self.kpi_name} - Version {self.version}"

    class Meta:
        verbose_name = _("KPI Version History")
        verbose_name_plural = _("KPI Version Histories")
        unique_together = ('kpi_name', 'version')
        # Indexes and Constraints
        models.Index(fields=['kpi_name'], name='idx_kvh_kname'),
        # Security Policies
        # ALTER TABLE tenant_{tenant_id}.kpi_version_history ENABLE ROW LEVEL SECURITY;
        # CREATE POLICY kpi_version_history_access ON tenant_{tenant_id}.kpi_version_history
        #     FOR SELECT USING (TRUE);


class MultiModalInteraction(models.Model):
    """
    Orchestrates multi-modal interactions (voice, gesture, AR/VR).
    """
    id = models.BigAutoField(primary_key=True, verbose_name=_("ID"), help_text=_("Unique identifier for the multi-modal interaction."))
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='multi_modal_interactions', verbose_name=_("User"), help_text=_("User associated with the interaction configuration."))
    interaction_config = models.JSONField(null=True, blank=True, verbose_name=_("Interaction Configuration"), help_text=_("JSON object containing supported inputs and orchestration rules."))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"), help_text=_("Timestamp when the interaction configuration was last updated."))

    def __str__(self):
        return f"Multi-modal interaction for {self.user}" if self.user else "Multi-modal interaction (no user)"

    class Meta:
        verbose_name = _("Multi-Modal Interaction")
        verbose_name_plural = _("Multi-Modal Interactions")
        # Indexes and Constraints
        models.Index(fields=['user'], name='idx_mmi_uid'),
        # Security Policies
        # ALTER TABLE tenant_{tenant_id}.multi_modal_interactions ENABLE ROW LEVEL SECURITY;
        # CREATE POLICY multi_modal_interactions_access ON tenant_{tenant_id}.multi_modal_interactions
        #     FOR SELECT USING (user_id = current_setting('app.current_user_id')::uuid OR user_id IS NULL);


class QuantumLicensingKey(models.Model):
    """
    Stores quantum-resistant licensing keys.
    """
    id = models.BigAutoField(primary_key=True, verbose_name=_("ID"), help_text=_("Unique identifier for the quantum licensing key."))
    track_id = models.ForeignKey('ai_dj.Track', on_delete=models.SET_NULL, null=True, blank=True, related_name='quantum_licensing_keys', verbose_name=_("Track"), help_text=_("Track associated with the licensing key."))
    quantum_safe_key = models.TextField(verbose_name=_("Quantum Safe Key"), help_text=_("Quantum-resistant public key or hash."))
    validity_period = models.JSONField(null=True, blank=True, verbose_name=_("Validity Period"), help_text=_("JSON object containing the start and end dates of the validity period."))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"), help_text=_("Timestamp when the licensing key was last updated."))

    def __str__(self):
        return f"Licensing key for track {self.track_id}" if self.track_id else "Licensing key (no track)"

    class Meta:
        verbose_name = _("Quantum Licensing Key")
        verbose_name_plural = _("Quantum Licensing Keys")
        # Indexes and Constraints
        models.Index(fields=['track_id'], name='idx_qlk_tid'),
        # Security Policies
        # ALTER TABLE tenant_{tenant_id}.quantum_licensing_keys ENABLE ROW LEVEL SECURITY;
        # CREATE POLICY quantum_licensing_keys_access ON tenant_{tenant_id}.quantum_licensing_keys
        #     FOR SELECT USING (TRUE);


class BlockchainRoyaltyLedger(models.Model):
    """
    Stores blockchain-backed royalty ledger entries.
    """
    id = models.BigAutoField(primary_key=True, verbose_name=_("ID"), help_text=_("Unique identifier for the blockchain royalty ledger entry."))
    transaction_ref = models.TextField(verbose_name=_("Transaction Reference"), help_text=_("Reference to a blockchain transaction."))
    track_id = models.ForeignKey('ai_dj.Track', on_delete=models.SET_NULL, null=True, blank=True, related_name='blockchain_royalty_ledgers', verbose_name=_("Track"), help_text=_("Track associated with the royalty ledger entry."))
    distribution_data = models.JSONField(null=True, blank=True, verbose_name=_("Distribution Data"), help_text=_("JSON object containing creator information, splits, and timestamp."))
    recorded_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Recorded At"), help_text=_("Timestamp when the royalty ledger entry was recorded."))

    def __str__(self):
        return f"Royalty ledger entry for track {self.track_id}" if self.track_id else "Royalty ledger entry (no track)"

    class Meta:
        verbose_name = _("Blockchain Royalty Ledger")
        verbose_name_plural = _("Blockchain Royalty Ledgers")
        # Indexes and Constraints
        models.Index(fields=['track_id'], name='idx_brl_tid'),
        # Security Policies
        # ALTER TABLE tenant_{tenant_id}.blockchain_royalty_ledger ENABLE ROW LEVEL SECURITY;
        # CREATE POLICY blockchain_royalty_ledger_access ON tenant_{tenant_id}.blockchain_royalty_ledger
        #     FOR SELECT USING (TRUE);


class NeurofeedbackMusicConfig(models.Model):
    """
    Stores neurofeedback-adaptive music settings.
    """
    id = models.BigAutoField(primary_key=True, verbose_name=_("ID"), help_text=_("Unique identifier for the neurofeedback music configuration."))
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='neurofeedback_music_configs', verbose_name=_("User"), help_text=_("User associated with the neurofeedback music configuration."))
    neural_params = models.JSONField(null=True, blank=True, verbose_name=_("Neural Parameters"), help_text=_("JSON object containing brainwave response thresholds and adjustment rules."))
    last_calibrated = models.DateTimeField(auto_now=True, verbose_name=_("Last Calibrated"), help_text=_("Timestamp when the neurofeedback settings were last calibrated."))

    def __str__(self):
        return f"Neurofeedback config for {self.user}" if self.user else "Neurofeedback config (no user)"

    class Meta:
        verbose_name = _("Neurofeedback Music Config")
        verbose_name_plural = _("Neurofeedback Music Configs")
        # Indexes and Constraints
        models.Index(fields=['user'], name='idx_nmc_uid'),
        # Security Policies
        # ALTER TABLE tenant_{tenant_id}.neurofeedback_music_configs ENABLE ROW LEVEL SECURITY;
        # CREATE POLICY neurofeedback_music_configs_access ON tenant_{tenant_id}.neurofeedback_music_configs
        #     FOR SELECT USING (user_id = current_setting('app.current_user_id')::uuid OR user_id IS NULL);


class HolographicStageSetting(models.Model):
    """
    Stores holographic concert integration settings.
    """
    id = models.BigAutoField(primary_key=True, verbose_name=_("ID"), help_text=_("Unique identifier for the holographic stage setting."))
    event_id = models.ForeignKey('social_community.Event', on_delete=models.SET_NULL, null=True, blank=True, related_name='holographic_stage_settings', verbose_name=_("Event"), help_text=_("Event associated with the holographic stage settings."))
    hologram_config = models.JSONField(null=True, blank=True, verbose_name=_("Hologram Configuration"), help_text=_("JSON object containing stage layout, hologram positions, and lighting matrix."))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"), help_text=_("Timestamp when the holographic stage settings were last updated."))

    def __str__(self):
        return f"Holographic stage settings for event {self.event_id}" if self.event_id else "Holographic stage settings (no event)"

    class Meta:
        verbose_name = _("Holographic Stage Setting")
        verbose_name_plural = _("Holographic Stage Settings")
        # Security Policies
        # ALTER TABLE tenant_{tenant_id}.holographic_stage_settings ENABLE ROW LEVEL SECURITY;
        # CREATE POLICY holographic_stage_settings_access ON tenant_{tenant_id}.holographic_stage_settings
        #     FOR SELECT USING (TRUE);


class BioInspiredRecoStrategy(models.Model):
    """
    Stores bio-inspired recommendation algorithm strategies.
    """
    id = models.BigAutoField(primary_key=True, verbose_name=_("ID"), help_text=_("Unique identifier for the bio-inspired recommendation strategy."))
    strategy_name = models.TextField(unique=True, verbose_name=_("Strategy Name"), help_text=_("Name of the bio-inspired recommendation strategy."))
    algorithm_params = models.JSONField(null=True, blank=True, verbose_name=_("Algorithm Parameters"), help_text=_("JSON object containing algorithm type, initial population size, and mutation rate."))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"), help_text=_("Timestamp when the strategy was last updated."))

    def __str__(self):
        return self.strategy_name

    class Meta:
        verbose_name = _("Bio-Inspired Recommendation Strategy")
        verbose_name_plural = _("Bio-Inspired Recommendation Strategies")
        # Indexes and Constraints
        models.Index(fields=['strategy_name'], name='idx_birs_name'),
        # Security Policies
        # ALTER TABLE tenant_{tenant_id}.bio_inspired_reco_strategies ENABLE ROW LEVEL SECURITY;
        # CREATE POLICY bio_inspired_reco_strategies_access ON tenant_{tenant_id}.bio_inspired_reco_strategies
        #     FOR SELECT USING (TRUE);


class DecentralizedComputeConfig(models.Model):
    """
    Stores decentralized compute partnership configurations.
    """
    id = models.BigAutoField(primary_key=True, verbose_name=_("ID"), help_text=_("Unique identifier for the decentralized compute configuration."))
    partner_id = models.TextField(unique=True, verbose_name=_("Partner ID"), help_text=_("Identifier for a decentralized compute network partner."))
    connection_details = models.JSONField(null=True, blank=True, verbose_name=_("Connection Details"), help_text=_("JSON object containing API endpoint, auth token, and capabilities."))
    established_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Established At"), help_text=_("Timestamp when the partnership was established."))

    def __str__(self):
        return self.partner_id

    class Meta:
        verbose_name = _("Decentralized Compute Config")
        verbose_name_plural = _("Decentralized Compute Configs")
        # Indexes and Constraints
        models.Index(fields=['partner_id'], name='idx_dcc_part'),
        # Security Policies
        # ALTER TABLE tenant_{tenant_id}.decentralized_compute_configs ENABLE ROW LEVEL SECURITY;
        # CREATE POLICY decentralized_compute_configs_access ON tenant_{tenant_id}.decentralized_compute_configs
        #     FOR SELECT USING (TRUE);

class ReportFeedback(models.Model):
    RATING_CHOICES = [
        ('positive', 'Positive'),
        ('negative', 'Negative'),
    ]
    CATEGORY_CHOICES = [
        ('clarity', 'Clarity'),
        ('usability', 'Usability'),
        ('completeness', 'Completeness'),
        ('other', 'Other'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    report_id = models.CharField(max_length=255)
    rating = models.CharField(max_length=10, choices=RATING_CHOICES)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['report_id']),
            models.Index(fields=['created_at']),
        ]

class MetricCache(models.Model):
    """
    Caches computed metrics for performance.
    """
    metric_key = models.CharField(max_length=100)
    data = JSONField(default=dict)
    last_updated = models.DateTimeField(auto_now=True)
    expires_at = models.DateTimeField()

    class Meta:
        verbose_name = _("Metric Cache")
        verbose_name_plural = _("Metric Caches")
        ordering = ['-last_updated']

    def __str__(self):
        return self.metric_key

class AuditLog(models.Model):
    """
    Tracks important system events and changes
    """
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='audit_logs')
    action = models.CharField(max_length=100)
    timestamp = models.DateTimeField(auto_now_add=True)
    details = JSONField(default=dict)
    ip_address = models.GenericIPAddressField(null=True, blank=True)

    class Meta:
        verbose_name = _("Audit Log")
        verbose_name_plural = _("Audit Logs")
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.action} by {self.user} at {self.timestamp}"

class DataPrivacySettings(models.Model):
    """
    Configures data privacy and protection rules
    """
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    anonymization_rules = JSONField(default=dict)
    masking_rules = JSONField(default=dict)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Data Privacy Settings")
        verbose_name_plural = _("Data Privacy Settings")
        ordering = ['name']

    def __str__(self):
        return self.name

class ExternalDataSource(models.Model):
    """
    Represents external data sources for integration
    """
    name = models.CharField(max_length=100)
    source_type = models.CharField(max_length=50)
    connection_details = JSONField(default=dict)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("External Data Source")
        verbose_name_plural = _("External Data Sources")
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.source_type})"

class VisualizationCache(models.Model):
    """
    Caches visualization data for performance
    """
    cache_key = models.CharField(max_length=100)
    data = JSONField(default=dict)
    parameters = JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    class Meta:
        verbose_name = _("Visualization Cache")
        verbose_name_plural = _("Visualization Caches")
        ordering = ['-created_at']

    def __str__(self):
        return self.cache_key

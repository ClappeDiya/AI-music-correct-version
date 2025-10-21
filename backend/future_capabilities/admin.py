from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model
from .models import (
    VREnvironmentConfig,
    VRSession,
    VRInteraction,
    NeuralDevice,
    NeuralSignal,
    NeuralControl,
    PluginDeveloper,
    Plugin,
    PluginInstallation,
    PluginRating,
    PluginUsageLog,
    FeatureUsageAnalytics,
    FeatureSurvey,
    SurveyResponse,
    WearableDevice,
    BiofeedbackData,
    BiofeedbackEvent
)
from django.db.models import Q

User = get_user_model()


class BaseSecureAdmin(admin.ModelAdmin):
    """
    Base admin class with security features.
    """
    readonly_fields = ('created_by', 'created_at', 'updated_at')
    list_filter = ('created_at', 'updated_at')

    def save_model(self, request, obj, form, change):
        if not change:  # Only set created_by on creation
            obj.created_by = request.user
        super().save_model(request, obj, form, change)

    def has_change_permission(self, request, obj=None):
        if obj and not request.user.is_superuser:
            return obj.created_by == request.user or request.user.has_perm('future_capabilities.change_all')
        return super().has_change_permission(request, obj)


@admin.register(VREnvironmentConfig)
class VREnvironmentConfigAdmin(BaseSecureAdmin):
    """
    Admin class for VREnvironmentConfig model.
    """
    list_display = ('id', 'name', 'scene_type', 'interaction_mode', 'created_at')
    list_filter = ('scene_type', 'interaction_mode', 'created_at')
    search_fields = ('name', 'environment_name')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(VRSession)
class VRSessionAdmin(admin.ModelAdmin):
    """
    Admin class for VRSession model.
    """
    list_display = ('id', 'user_id', 'get_environment_name', 'get_started_at', 'get_ended_at')
    search_fields = ('user_id', 'session_notes')

    def get_environment_name(self, obj):
        return obj.environment_config.name
    get_environment_name.short_description = 'Environment'
    get_environment_name.admin_order_field = 'environment_config__name'

    def get_started_at(self, obj):
        return obj.started_at
    get_started_at.short_description = 'Started At'
    get_started_at.admin_order_field = 'started_at'

    def get_ended_at(self, obj):
        return obj.ended_at
    get_ended_at.short_description = 'Ended At'
    get_ended_at.admin_order_field = 'ended_at'


@admin.register(VRInteraction)
class VRInteractionAdmin(admin.ModelAdmin):
    """
    Admin class for VRInteraction model.
    """
    list_display = ('id', 'session', 'interaction_type', 'timestamp')
    list_filter = ('interaction_type', 'timestamp')
    search_fields = ('session__user_id', 'interaction_type')
    readonly_fields = ('timestamp',)


@admin.register(NeuralDevice)
class NeuralDeviceAdmin(admin.ModelAdmin):
    """
    Admin class for NeuralDevice model.
    """
    list_display = ('id', 'user_id', 'device_name', 'device_type', 'connection_status', 'last_calibration')
    list_filter = ('device_type', 'connection_status', 'last_calibration')
    search_fields = ('user_id', 'device_name')
    readonly_fields = ('last_calibration',)


@admin.register(NeuralSignal)
class NeuralSignalAdmin(admin.ModelAdmin):
    """
    Admin class for NeuralSignal model.
    """
    list_display = ('id', 'get_device_name', 'signal_type', 'timestamp')
    list_filter = ('signal_type', 'timestamp')
    search_fields = ('device__device_name', 'signal_type')
    readonly_fields = ('timestamp',)

    def get_device_name(self, obj):
        return obj.device.device_name
    get_device_name.short_description = 'Device'
    get_device_name.admin_order_field = 'device__device_name'


@admin.register(NeuralControl)
class NeuralControlAdmin(admin.ModelAdmin):
    """
    Admin class for NeuralControl model.
    """
    list_display = ('id', 'get_device_name', 'get_control_type', 'get_timestamp')
    search_fields = ('device__device_name', 'control_type')

    def get_device_name(self, obj):
        return obj.device.device_name
    get_device_name.short_description = 'Device'
    get_device_name.admin_order_field = 'device__device_name'

    def get_control_type(self, obj):
        return obj.control_type
    get_control_type.short_description = 'Control Type'
    get_control_type.admin_order_field = 'control_type'

    def get_timestamp(self, obj):
        return obj.timestamp
    get_timestamp.short_description = 'Timestamp'
    get_timestamp.admin_order_field = 'timestamp'


@admin.register(PluginDeveloper)
class PluginDeveloperAdmin(admin.ModelAdmin):
    """
    Admin class for PluginDeveloper model.
    """
    list_display = ('id', 'user_id', 'company_name', 'is_verified', 'verification_date', 'created_at')
    list_filter = ('is_verified', 'verification_date', 'created_at')
    search_fields = ('user_id', 'company_name')
    readonly_fields = ('created_at',)


@admin.register(Plugin)
class PluginAdmin(BaseSecureAdmin):
    """
    Admin class for Plugin model.
    """
    list_display = ('id', 'name', 'version', 'get_developer_name', 'get_status', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('name', 'developer__company_name')
    readonly_fields = ('created_at',)

    def get_developer_name(self, obj):
        return obj.developer.company_name
    get_developer_name.short_description = 'Developer'
    get_developer_name.admin_order_field = 'developer__company_name'

    def get_status(self, obj):
        return obj.status
    get_status.short_description = 'Status'
    get_status.admin_order_field = 'status'


@admin.register(PluginInstallation)
class PluginInstallationAdmin(admin.ModelAdmin):
    """
    Admin class for PluginInstallation model.
    """
    list_display = ('id', 'get_plugin_name', 'user_id', 'get_status', 'installed_at')
    list_filter = ('installed_at',)
    search_fields = ('plugin__name', 'user_id')
    readonly_fields = ('installed_at',)

    def get_plugin_name(self, obj):
        return obj.plugin.name
    get_plugin_name.short_description = 'Plugin'
    get_plugin_name.admin_order_field = 'plugin__name'

    def get_status(self, obj):
        return obj.status
    get_status.short_description = 'Status'
    get_status.admin_order_field = 'status'


@admin.register(PluginRating)
class PluginRatingAdmin(admin.ModelAdmin):
    """
    Admin class for PluginRating model.
    """
    list_display = ('id', 'get_plugin_name', 'user_id', 'rating', 'created_at')
    list_filter = ('rating', 'created_at')
    search_fields = ('plugin__name', 'user_id')
    readonly_fields = ('created_at',)

    def get_plugin_name(self, obj):
        return obj.plugin.name
    get_plugin_name.short_description = 'Plugin'
    get_plugin_name.admin_order_field = 'plugin__name'


@admin.register(PluginUsageLog)
class PluginUsageLogAdmin(admin.ModelAdmin):
    """
    Admin class for PluginUsageLog model.
    """
    list_display = ('id', 'get_plugin_name', 'get_event_type', 'timestamp')
    list_filter = ('timestamp',)
    search_fields = ('installation__plugin__name', 'event_type')
    readonly_fields = ('timestamp',)

    def get_plugin_name(self, obj):
        return obj.installation.plugin.name
    get_plugin_name.short_description = 'Plugin'
    get_plugin_name.admin_order_field = 'installation__plugin__name'

    def get_event_type(self, obj):
        return obj.event_type
    get_event_type.short_description = 'Event Type'
    get_event_type.admin_order_field = 'event_type'


@admin.register(FeatureUsageAnalytics)
class FeatureUsageAnalyticsAdmin(admin.ModelAdmin):
    """
    Admin class for FeatureUsageAnalytics model.
    """
    list_display = ('id', 'feature_name', 'user_id', 'get_usage_count', 'get_last_used')
    list_filter = ('feature_name',)
    search_fields = ('feature_name', 'user_id')

    def get_usage_count(self, obj):
        return obj.usage_count
    get_usage_count.short_description = 'Usage Count'
    get_usage_count.admin_order_field = 'usage_count'

    def get_last_used(self, obj):
        return obj.last_used
    get_last_used.short_description = 'Last Used'
    get_last_used.admin_order_field = 'last_used'


@admin.register(FeatureSurvey)
class FeatureSurveyAdmin(admin.ModelAdmin):
    """
    Admin class for FeatureSurvey model.
    """
    list_display = ('id', 'get_feature_name', 'get_status', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('feature_name',)
    readonly_fields = ('created_at',)

    def get_feature_name(self, obj):
        return obj.feature_name
    get_feature_name.short_description = 'Feature Name'
    get_feature_name.admin_order_field = 'feature_name'

    def get_status(self, obj):
        return obj.status
    get_status.short_description = 'Status'
    get_status.admin_order_field = 'status'


@admin.register(SurveyResponse)
class SurveyResponseAdmin(admin.ModelAdmin):
    """
    Admin class for SurveyResponse model.
    """
    list_display = ('id', 'get_survey_name', 'user_id', 'get_satisfaction_score', 'submitted_at')
    list_filter = ('submitted_at',)
    search_fields = ('survey__feature_name', 'user_id')
    readonly_fields = ('submitted_at',)

    def get_survey_name(self, obj):
        return obj.survey.feature_name
    get_survey_name.short_description = 'Survey'
    get_survey_name.admin_order_field = 'survey__feature_name'

    def get_satisfaction_score(self, obj):
        return obj.satisfaction_score
    get_satisfaction_score.short_description = 'Satisfaction Score'
    get_satisfaction_score.admin_order_field = 'satisfaction_score'


@admin.register(WearableDevice)
class WearableDeviceAdmin(admin.ModelAdmin):
    """
    Admin class for WearableDevice model.
    """
    list_display = ('id', 'user_id', 'device_type', 'connection_status', 'last_sync')
    list_filter = ('device_type', 'connection_status', 'last_sync')
    search_fields = ('user_id', 'device_type')
    readonly_fields = ('last_sync',)


@admin.register(BiofeedbackData)
class BiofeedbackDataAdmin(admin.ModelAdmin):
    """
    Admin class for BiofeedbackData model.
    """
    list_display = ('id', 'get_device_info', 'data_type', 'timestamp')
    list_filter = ('data_type', 'timestamp')
    search_fields = ('device__user_id', 'data_type')
    readonly_fields = ('timestamp',)

    def get_device_info(self, obj):
        return f"{obj.device.user_id} - {obj.device.device_type}"
    get_device_info.short_description = 'Device'
    get_device_info.admin_order_field = 'device__user_id'


@admin.register(BiofeedbackEvent)
class BiofeedbackEventAdmin(admin.ModelAdmin):
    """
    Admin class for BiofeedbackEvent model.
    """
    list_display = ('id', 'get_device_info', 'event_type', 'timestamp')
    list_filter = ('event_type', 'timestamp')
    search_fields = ('device__user_id', 'event_type')
    readonly_fields = ('timestamp',)

    def get_device_info(self, obj):
        return f"{obj.device.user_id} - {obj.device.device_type}"
    get_device_info.short_description = 'Device'
    get_device_info.admin_order_field = 'device__user_id'

from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import (
    SystemConfiguration,
    SystemHealthCheck,
    MaintenanceWindow,
    SystemMetric,
    BackgroundTask,
    APIKey,
)


@admin.register(SystemConfiguration)
class SystemConfigurationAdmin(admin.ModelAdmin):
    """
    Admin interface for managing system configurations.
    """
    list_display = ('id', 'key', 'is_active', 'updated_by', 'created_at', 'updated_at')
    list_filter = ('is_active', 'created_at', 'updated_at')
    search_fields = ('key', 'description')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ['key']


@admin.register(SystemHealthCheck)
class SystemHealthCheckAdmin(admin.ModelAdmin):
    """
    Admin interface for managing system health checks.
    """
    list_display = ('id', 'component', 'status', 'last_check', 'next_check')
    list_filter = ('status', 'last_check', 'next_check')
    search_fields = ('component',)
    readonly_fields = ('last_check',)
    ordering = ['component']


@admin.register(MaintenanceWindow)
class MaintenanceWindowAdmin(admin.ModelAdmin):
    """
    Admin interface for managing maintenance windows.
    """
    list_display = ('id', 'title', 'start_time', 'end_time', 'is_active', 'created_by', 'created_at')
    list_filter = ('is_active', 'start_time', 'end_time', 'created_at')
    search_fields = ('title', 'description', 'created_by__username')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ['-start_time']


@admin.register(SystemMetric)
class SystemMetricAdmin(admin.ModelAdmin):
    """
    Admin interface for managing system metrics.
    """
    list_display = ('id', 'metric_type', 'value', 'unit', 'timestamp')
    list_filter = ('metric_type', 'timestamp')
    search_fields = ('metric_type', 'unit')
    readonly_fields = ('timestamp',)
    ordering = ['-timestamp']


@admin.register(BackgroundTask)
class BackgroundTaskAdmin(admin.ModelAdmin):
    """
    Admin interface for managing background tasks.
    """
    list_display = ('id', 'name', 'task_id', 'status', 'created_at', 'started_at', 'completed_at', 'retries')
    list_filter = ('status', 'created_at', 'started_at', 'completed_at')
    search_fields = ('name', 'task_id', 'error')
    readonly_fields = ('created_at', 'started_at', 'completed_at')
    ordering = ['-created_at']


@admin.register(APIKey)
class APIKeyAdmin(admin.ModelAdmin):
    """
    Admin interface for managing API keys.
    """
    list_display = ('id', 'name', 'is_active', 'created_by', 'created_at', 'expires_at', 'last_used')
    list_filter = ('is_active', 'created_at', 'expires_at', 'last_used')
    search_fields = ('name', 'key', 'created_by__username')
    readonly_fields = ('created_at', 'last_used')
    ordering = ['-created_at']

    def get_readonly_fields(self, request, obj=None):
        """
        Make key field readonly if object already exists to prevent modification.
        """
        if obj:  # editing an existing object
            return self.readonly_fields + ('key',)
        return self.readonly_fields 
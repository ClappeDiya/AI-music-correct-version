from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import (
    PrivacyPolicy,
    UserConsent,
    DataRetentionPolicy,
    DataDeletionRequest,
    DataAccessLog,
    DataEncryptionKey,
    ComplianceReport,
)


@admin.register(PrivacyPolicy)
class PrivacyPolicyAdmin(admin.ModelAdmin):
    """
    Admin interface for managing privacy policies.
    """
    list_display = ('id', 'version', 'is_active', 'effective_date', 'created_at', 'updated_at')
    list_filter = ('is_active', 'effective_date', 'created_at')
    search_fields = ('version', 'content')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-effective_date',)


@admin.register(UserConsent)
class UserConsentAdmin(admin.ModelAdmin):
    """
    Admin interface for managing user consents.
    """
    list_display = ('id', 'user', 'policy', 'consented_at', 'is_active', 'revoked_at')
    list_filter = ('is_active', 'consented_at', 'revoked_at')
    search_fields = ('user__username', 'policy__version', 'ip_address')
    readonly_fields = ('consented_at',)
    ordering = ('-consented_at',)


@admin.register(DataRetentionPolicy)
class DataRetentionPolicyAdmin(admin.ModelAdmin):
    """
    Admin interface for managing data retention policies.
    """
    list_display = ('id', 'data_type', 'retention_period_days', 'is_active', 'created_at', 'updated_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('data_type', 'description')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('data_type',)


@admin.register(DataDeletionRequest)
class DataDeletionRequestAdmin(admin.ModelAdmin):
    """
    Admin interface for managing data deletion requests.
    """
    list_display = ('id', 'user', 'request_type', 'status', 'requested_at', 'completed_at')
    list_filter = ('status', 'requested_at', 'completed_at')
    search_fields = ('user__username', 'request_type', 'notes')
    readonly_fields = ('requested_at',)
    ordering = ('-requested_at',)


@admin.register(DataAccessLog)
class DataAccessLogAdmin(admin.ModelAdmin):
    """
    Admin interface for managing data access logs.
    """
    list_display = ('id', 'user', 'data_type', 'access_type', 'timestamp', 'ip_address', 'success')
    list_filter = ('access_type', 'success', 'timestamp')
    search_fields = ('user__username', 'data_type', 'ip_address')
    readonly_fields = ('timestamp',)
    ordering = ('-timestamp',)


@admin.register(DataEncryptionKey)
class DataEncryptionKeyAdmin(admin.ModelAdmin):
    """
    Admin interface for managing data encryption keys.
    """
    list_display = ('id', 'key_identifier', 'algorithm', 'is_active', 'created_at', 'rotated_at', 'expires_at')
    list_filter = ('is_active', 'algorithm', 'created_at', 'expires_at')
    search_fields = ('key_identifier', 'algorithm')
    readonly_fields = ('created_at', 'rotated_at')
    ordering = ('-created_at',)


@admin.register(ComplianceReport)
class ComplianceReportAdmin(admin.ModelAdmin):
    """
    Admin interface for managing compliance reports.
    """
    list_display = ('id', 'report_type', 'report_date', 'generated_by', 'is_compliant', 'created_at')
    list_filter = ('report_type', 'is_compliant', 'report_date', 'created_at')
    search_fields = ('report_type', 'content', 'generated_by__username')
    readonly_fields = ('created_at',)
    ordering = ('-report_date',) 
from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import (
    BiometricDevice,
    BiometricReading,
    BiometricProfile,
    BiometricAlert,
    BiometricCalibration,
    BiometricFeedback,
)


@admin.register(BiometricDevice)
class BiometricDeviceAdmin(admin.ModelAdmin):
    """
    Admin interface for managing biometric devices.
    """
    list_display = ('id', 'name', 'device_type', 'manufacturer', 'model_number', 'is_active', 'last_calibration')
    list_filter = ('device_type', 'manufacturer', 'is_active', 'last_calibration')
    search_fields = ('name', 'device_type', 'manufacturer', 'model_number')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ['name']


@admin.register(BiometricReading)
class BiometricReadingAdmin(admin.ModelAdmin):
    """
    Admin interface for managing biometric readings.
    """
    list_display = ('id', 'user', 'device', 'reading_type', 'confidence_score', 'timestamp')
    list_filter = ('reading_type', 'device', 'timestamp')
    search_fields = ('user__username', 'device__name', 'reading_type')
    readonly_fields = ('timestamp',)
    ordering = ['-timestamp']


@admin.register(BiometricProfile)
class BiometricProfileAdmin(admin.ModelAdmin):
    """
    Admin interface for managing biometric profiles.
    """
    list_display = ('id', 'user', 'is_active', 'last_updated')
    list_filter = ('is_active', 'last_updated')
    search_fields = ('user__username',)
    readonly_fields = ('last_updated',)
    ordering = ['user']


@admin.register(BiometricAlert)
class BiometricAlertAdmin(admin.ModelAdmin):
    """
    Admin interface for managing biometric alerts.
    """
    list_display = ('id', 'user', 'severity', 'acknowledged', 'timestamp', 'acknowledged_at')
    list_filter = ('severity', 'acknowledged', 'timestamp', 'acknowledged_at')
    search_fields = ('user__username', 'message')
    readonly_fields = ('timestamp', 'acknowledged_at')
    ordering = ['-timestamp']


@admin.register(BiometricCalibration)
class BiometricCalibrationAdmin(admin.ModelAdmin):
    """
    Admin interface for managing biometric calibrations.
    """
    list_display = ('id', 'device', 'calibrated_by', 'calibration_date', 'next_calibration', 'success')
    list_filter = ('success', 'calibration_date', 'next_calibration')
    search_fields = ('device__name', 'calibrated_by__username', 'notes')
    readonly_fields = ('calibration_date',)
    ordering = ['-calibration_date']


@admin.register(BiometricFeedback)
class BiometricFeedbackAdmin(admin.ModelAdmin):
    """
    Admin interface for managing biometric feedback.
    """
    list_display = ('id', 'user', 'reading', 'accuracy_rating', 'comfort_rating', 'timestamp')
    list_filter = ('accuracy_rating', 'comfort_rating', 'timestamp')
    search_fields = ('user__username', 'comments')
    readonly_fields = ('timestamp',)
    ordering = ['-timestamp'] 
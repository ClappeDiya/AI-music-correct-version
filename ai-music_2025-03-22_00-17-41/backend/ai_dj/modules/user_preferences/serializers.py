from rest_framework import serializers
from .models import (
    PreferenceExternalization,
    EventBasedPreference,
    BehaviorOverlay,
    UserCurrency
)


class PreferenceExternalizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = PreferenceExternalization
        fields = [
            'id', 'service_name', 'sync_enabled',
            'last_sync', 'sync_frequency', 'preferences_data'
        ]
        read_only_fields = ['last_sync']


class EventBasedPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventBasedPreference
        fields = [
            'id', 'event_type', 'start_time',
            'end_time', 'preferences', 'is_active',
            'created_at'
        ]
        read_only_fields = ['created_at']


class BehaviorOverlaySerializer(serializers.ModelSerializer):
    class Meta:
        model = BehaviorOverlay
        fields = [
            'id', 'trigger_type', 'conditions',
            'overlay_content', 'is_active', 'priority',
            'created_at'
        ]
        read_only_fields = ['created_at']


class UserCurrencySerializer(serializers.ModelSerializer):
    class Meta:
        model = UserCurrency
        fields = ['id', 'currency_code', 'updated_at']
        read_only_fields = ['updated_at']

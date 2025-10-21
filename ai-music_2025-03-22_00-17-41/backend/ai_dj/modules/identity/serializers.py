from rest_framework import serializers
from .models import IdentityBridge, IdentityVerification, LoginSession


class IdentityBridgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = IdentityBridge
        fields = [
            'id', 'service_name', 'external_id',
            'is_active', 'token_expires_at',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'created_at', 'updated_at'
        ]


class IdentityVerificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = IdentityVerification
        fields = [
            'id', 'is_verified', 'verification_method',
            'verified_at', 'verification_data'
        ]
        read_only_fields = [
            'is_verified', 'verified_at'
        ]


class LoginSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoginSession
        fields = [
            'id', 'session_id', 'device_info',
            'ip_address', 'started_at',
            'last_active', 'is_active'
        ]
        read_only_fields = [
            'started_at', 'last_active'
        ]

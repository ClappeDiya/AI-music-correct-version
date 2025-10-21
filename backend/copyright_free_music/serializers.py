from rest_framework import serializers
from .models import (
    LicenseTerm,
    PaymentProvider,
    Track,
    TrackLicense,
    TrackPurchase,
    TrackDownload,
    UsageAgreement,
    TrackAnalytic,
    RoyaltyTransaction,
    DynamicPricingRule,
    ExternalUsageLog,
    ConditionalLicenseEscalation,
    BrandedCatalog,
    BrandedCatalogTrack,
    RegionalLegalFramework,
    TrackLegalMapping,
)
from tenants.serializers import TenantAwareMixin
from user_management.serializers import UserSerializer


class LicenseTermSerializer(TenantAwareMixin, serializers.ModelSerializer):
    """
    Serializer for the LicenseTerm model.
    """
    class Meta:
        model = LicenseTerm
        fields = '__all__'
        read_only_fields = ['id', 'created_at']


class PaymentProviderSerializer(TenantAwareMixin, serializers.ModelSerializer):
    """
    Serializer for the PaymentProvider model.
    """
    class Meta:
        model = PaymentProvider
        fields = '__all__'
        read_only_fields = ['id', 'created_at']


class TrackSerializer(TenantAwareMixin, serializers.ModelSerializer):
    """
    Serializer for the Track model.
    Includes nested serializers for related models.
    """
    user = UserSerializer(read_only=True)
    license = LicenseTermSerializer(read_only=True)

    class Meta:
        model = Track
        fields = '__all__'
        read_only_fields = ['id', 'published_at']


class TrackLicenseSerializer(TenantAwareMixin, serializers.ModelSerializer):
    """
    Serializer for the TrackLicense model.
    """
    track = TrackSerializer(read_only=True)

    class Meta:
        model = TrackLicense
        fields = '__all__'
        read_only_fields = ['id', 'created_at']


class TrackPurchaseSerializer(TenantAwareMixin, serializers.ModelSerializer):
    """
    Serializer for the TrackPurchase model.
    """
    track = TrackSerializer(read_only=True)
    buyer = UserSerializer(read_only=True)
    payment_provider = PaymentProviderSerializer(read_only=True)

    class Meta:
        model = TrackPurchase
        fields = '__all__'
        read_only_fields = ['id', 'purchased_at']


class TrackDownloadSerializer(TenantAwareMixin, serializers.ModelSerializer):
    """
    Serializer for the TrackDownload model.
    """
    track = TrackSerializer(read_only=True)
    downloader = UserSerializer(read_only=True)

    class Meta:
        model = TrackDownload
        fields = '__all__'
        read_only_fields = ['id', 'downloaded_at']


class UsageAgreementSerializer(TenantAwareMixin, serializers.ModelSerializer):
    """
    Serializer for the UsageAgreement model.
    """
    track = TrackSerializer(read_only=True)
    user = UserSerializer(read_only=True)

    class Meta:
        model = UsageAgreement
        fields = '__all__'
        read_only_fields = ['id', 'agreed_at']


class TrackAnalyticSerializer(TenantAwareMixin, serializers.ModelSerializer):
    """
    Serializer for the TrackAnalytic model.
    """
    track = TrackSerializer(read_only=True)

    class Meta:
        model = TrackAnalytic
        fields = '__all__'
        read_only_fields = ['id', 'last_updated']


class RoyaltyTransactionSerializer(TenantAwareMixin, serializers.ModelSerializer):
    """
    Serializer for the RoyaltyTransaction model.
    """
    track = TrackSerializer(read_only=True)
    user = UserSerializer(read_only=True)

    class Meta:
        model = RoyaltyTransaction
        fields = '__all__'
        read_only_fields = ['id', 'processed_at']


class DynamicPricingRuleSerializer(TenantAwareMixin, serializers.ModelSerializer):
    """
    Serializer for the DynamicPricingRule model.
    """
    track = TrackSerializer(read_only=True)

    class Meta:
        model = DynamicPricingRule
        fields = '__all__'
        read_only_fields = ['id', 'updated_at']


class ExternalUsageLogSerializer(TenantAwareMixin, serializers.ModelSerializer):
    """
    Serializer for the ExternalUsageLog model.
    """
    track = TrackSerializer(read_only=True)

    class Meta:
        model = ExternalUsageLog
        fields = '__all__'
        read_only_fields = ['id', 'detected_at']


class ConditionalLicenseEscalationSerializer(TenantAwareMixin, serializers.ModelSerializer):
    """
    Serializer for the ConditionalLicenseEscalation model.
    """
    track = TrackSerializer(read_only=True)

    class Meta:
        model = ConditionalLicenseEscalation
        fields = '__all__'
        read_only_fields = ['id', 'created_at']


class BrandedCatalogSerializer(TenantAwareMixin, serializers.ModelSerializer):
    """
    Serializer for the BrandedCatalog model.
    """
    class Meta:
        model = BrandedCatalog
        fields = '__all__'
        read_only_fields = ['id', 'created_at']


class BrandedCatalogTrackSerializer(TenantAwareMixin, serializers.ModelSerializer):
    """
    Serializer for the BrandedCatalogTrack model.
    """
    catalog = BrandedCatalogSerializer(read_only=True)
    track = TrackSerializer(read_only=True)

    class Meta:
        model = BrandedCatalogTrack
        fields = '__all__'
        read_only_fields = ['id']


class RegionalLegalFrameworkSerializer(TenantAwareMixin, serializers.ModelSerializer):
    """
    Serializer for the RegionalLegalFramework model.
    """
    class Meta:
        model = RegionalLegalFramework
        fields = '__all__'
        read_only_fields = ['id', 'updated_at']


class TrackLegalMappingSerializer(TenantAwareMixin, serializers.ModelSerializer):
    """
    Serializer for the TrackLegalMapping model.
    """
    track = TrackSerializer(read_only=True)
    framework = RegionalLegalFrameworkSerializer(read_only=True)

    class Meta:
        model = TrackLegalMapping
        fields = '__all__'
        read_only_fields = ['id', 'last_synced']

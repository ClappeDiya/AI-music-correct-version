from django.contrib import admin
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
    TrackLegalMapping
)
from django.utils.translation import gettext_lazy as _


@admin.register(LicenseTerm)
class LicenseTermAdmin(admin.ModelAdmin):
    """
    Admin class for the LicenseTerm model.
    """
    list_display = ('id', 'license_name', 'created_at')
    search_fields = ('license_name', 'description')
    readonly_fields = ('created_at',)


@admin.register(PaymentProvider)
class PaymentProviderAdmin(admin.ModelAdmin):
    """
    Admin class for the PaymentProvider model.
    """
    list_display = ('id', 'provider_name', 'active', 'created_at')
    list_filter = ('active', 'created_at')
    search_fields = ('provider_name',)
    readonly_fields = ('created_at',)


@admin.register(Track)
class TrackAdmin(admin.ModelAdmin):
    """
    Admin class for the Track model.
    """
    list_display = ('id', 'user', 'title', 'license', 'published_at')
    list_filter = ('license', 'published_at')
    search_fields = ('title', 'user__username')
    readonly_fields = ('published_at',)


@admin.register(TrackLicense)
class TrackLicenseAdmin(admin.ModelAdmin):
    """
    Admin class for the TrackLicense model.
    """
    list_display = ('id', 'track', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('track__title',)
    readonly_fields = ('created_at',)


@admin.register(TrackPurchase)
class TrackPurchaseAdmin(admin.ModelAdmin):
    """
    Admin class for the TrackPurchase model.
    """
    list_display = ('id', 'track', 'buyer', 'payment_provider', 'amount', 'purchased_at')
    list_filter = ('payment_provider', 'purchased_at')
    search_fields = ('track__title', 'buyer__username')
    readonly_fields = ('purchased_at',)


@admin.register(TrackDownload)
class TrackDownloadAdmin(admin.ModelAdmin):
    """
    Admin class for the TrackDownload model.
    """
    list_display = ('id', 'track', 'downloader', 'downloaded_at')
    list_filter = ('downloaded_at',)
    search_fields = ('track__title', 'downloader__username')
    readonly_fields = ('downloaded_at',)


@admin.register(UsageAgreement)
class UsageAgreementAdmin(admin.ModelAdmin):
    """
    Admin class for the UsageAgreement model.
    """
    list_display = ('id', 'track', 'user', 'agreed_at')
    list_filter = ('agreed_at',)
    search_fields = ('track__title', 'user__username')
    readonly_fields = ('agreed_at',)


@admin.register(TrackAnalytic)
class TrackAnalyticAdmin(admin.ModelAdmin):
    """
    Admin class for the TrackAnalytic model.
    """
    list_display = ('id', 'track', 'last_updated')
    list_filter = ('last_updated',)
    search_fields = ('track__title',)
    readonly_fields = ('last_updated',)


@admin.register(RoyaltyTransaction)
class RoyaltyTransactionAdmin(admin.ModelAdmin):
    """
    Admin class for the RoyaltyTransaction model.
    """
    list_display = ('id', 'track', 'user', 'amount', 'processed_at')
    list_filter = ('processed_at',)
    search_fields = ('track__title', 'user__username')
    readonly_fields = ('processed_at',)


@admin.register(DynamicPricingRule)
class DynamicPricingRuleAdmin(admin.ModelAdmin):
    """
    Admin class for the DynamicPricingRule model.
    """
    list_display = ('id', 'track', 'updated_at')
    list_filter = ('updated_at',)
    search_fields = ('track__title',)
    readonly_fields = ('updated_at',)


@admin.register(ExternalUsageLog)
class ExternalUsageLogAdmin(admin.ModelAdmin):
    """
    Admin class for the ExternalUsageLog model.
    """
    list_display = ('id', 'track', 'detected_at')
    list_filter = ('detected_at',)
    search_fields = ('track__title',)
    readonly_fields = ('detected_at',)


@admin.register(ConditionalLicenseEscalation)
class ConditionalLicenseEscalationAdmin(admin.ModelAdmin):
    """
    Admin class for the ConditionalLicenseEscalation model.
    """
    list_display = ('id', 'track', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('track__title',)
    readonly_fields = ('created_at',)


@admin.register(BrandedCatalog)
class BrandedCatalogAdmin(admin.ModelAdmin):
    """
    Admin class for the BrandedCatalog model.
    """
    list_display = ('id', 'catalog_name', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('catalog_name',)
    readonly_fields = ('created_at',)


@admin.register(BrandedCatalogTrack)
class BrandedCatalogTrackAdmin(admin.ModelAdmin):
    """
    Admin class for the BrandedCatalogTrack model.
    """
    list_display = ('id', 'catalog', 'track', 'featured')
    list_filter = ('featured',)
    search_fields = ('catalog__catalog_name', 'track__title')


@admin.register(RegionalLegalFramework)
class RegionalLegalFrameworkAdmin(admin.ModelAdmin):
    """
    Admin class for the RegionalLegalFramework model.
    """
    list_display = ('id', 'region_code', 'updated_at')
    list_filter = ('updated_at',)
    search_fields = ('region_code',)
    readonly_fields = ('updated_at',)


@admin.register(TrackLegalMapping)
class TrackLegalMappingAdmin(admin.ModelAdmin):
    """
    Admin class for the TrackLegalMapping model.
    """
    list_display = ('id', 'track', 'framework', 'last_synced')
    list_filter = ('last_synced',)
    search_fields = ('track__title', 'framework__region_code')
    readonly_fields = ('last_synced',)

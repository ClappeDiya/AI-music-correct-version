# urls.py for {{   COPYRIGHT-FREE MUSIC SHARING MODULE }}
# This file defines the URL patterns for the copyright_free_music app,
# using a custom TenantAwareRouter to handle tenant-specific routing.

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Set the namespace for the app
COPYRIGHT_FREE_MUSIC_SHARING_MODULE = 'copyright_free_music'


class TenantAwareRouter(DefaultRouter):
    """
    Custom router that extends DefaultRouter to handle tenant-specific URL routing logic.
    """
    pass # Add any custom logic here if needed


# Instantiate the router
router = TenantAwareRouter()

# Register viewsets with the router
router.register(r'license-terms', views.LicenseTermViewSet, basename='license-term')
router.register(r'payment-providers', views.PaymentProviderViewSet, basename='payment-provider')
router.register(r'tracks', views.TrackViewSet, basename='track')
router.register(r'track-licenses', views.TrackLicenseViewSet, basename='track-license')
router.register(r'track-purchases', views.TrackPurchaseViewSet, basename='track-purchase')
router.register(r'track-downloads', views.TrackDownloadViewSet, basename='track-download')
router.register(r'usage-agreements', views.UsageAgreementViewSet, basename='usage-agreement')
router.register(r'track-analytics', views.TrackAnalyticViewSet, basename='track-analytic')
router.register(r'royalty-transactions', views.RoyaltyTransactionViewSet, basename='royalty-transaction')
router.register(r'dynamic-pricing-rules', views.DynamicPricingRuleViewSet, basename='dynamic-pricing-rule')
router.register(r'external-usage-logs', views.ExternalUsageLogViewSet, basename='external-usage-log')
router.register(r'conditional-license-escalations', views.ConditionalLicenseEscalationViewSet, basename='conditional-license-escalation')
router.register(r'branded-catalogs', views.BrandedCatalogViewSet, basename='branded-catalog')
router.register(r'branded-catalog-tracks', views.BrandedCatalogTrackViewSet, basename='branded-catalog-track')
router.register(r'regional-legal-frameworks', views.RegionalLegalFrameworkViewSet, basename='regional-legal-framework')
router.register(r'track-legal-mappings', views.TrackLegalMappingViewSet, basename='track-legal-mapping')


# Define URL patterns
urlpatterns = [
    path('', include(router.urls)),
    # Analytics endpoints
    path('analytics/', views.AnalyticsView.as_view(), name='analytics'),
    path('analytics/export/', views.AnalyticsExportView.as_view(), name='analytics-export'),
    # License Agreement URLs
    path('licenses/generate/', views.generate_license_agreement, name='generate_license_agreement'),
    path('licenses/sign/', views.sign_license_agreement, name='sign_license_agreement'),
    path('licenses/history/', views.get_license_history, name='get_license_history'),
    path('licenses/<str:agreement_id>/', views.get_agreement_details, name='get_agreement_details'),
    path('licenses/<str:agreement_id>/download/', views.download_agreement, name='download_agreement'),
    path('licenses/customize/', views.customize_license_agreement, name='customize_license_agreement'),
    path('licenses/templates/', views.get_customization_templates, name='get_customization_templates'),
    path('licenses/analytics/', views.get_license_analytics, name='get_license_analytics'),
    path('licenses/<str:agreement_id>/verify/', views.verify_signature, name='verify_signature'),
    path('licenses/<str:agreement_id>/verification-status/', views.get_verification_status, name='get_verification_status'),
    path('licenses/<str:agreement_id>/compliance/', views.get_compliance_report, name='get_compliance_report'),
    path('licenses/<str:agreement_id>/blockchain-proof/', views.generate_blockchain_proof, name='generate_blockchain_proof'),
    path('licenses/<str:agreement_id>/validate-blockchain-proof/', views.validate_blockchain_proof, name='validate_blockchain_proof'),
    # Dispute Resolution URLs
    path('disputes/', views.DisputeViewSet.as_view({
        'get': 'list',
        'post': 'create'
    }), name='dispute-list'),
    path('disputes/<str:pk>/', views.DisputeViewSet.as_view({
        'get': 'retrieve',
        'patch': 'partial_update',
        'delete': 'destroy'
    }), name='dispute-detail'),
    path('disputes/<str:dispute_id>/messages/', views.dispute_messages, name='dispute-messages'),
    path('disputes/<str:dispute_id>/evidence/', views.submit_evidence, name='submit-evidence'),
    path('disputes/<str:dispute_id>/appeal/', views.appeal_resolution, name='appeal-resolution'),
    path('disputes/notifications/', views.DisputeNotificationViewSet.as_view({
        'get': 'list'
    }), name='dispute-notifications'),
    path('disputes/notifications/<str:pk>/read/', views.mark_notification_read, name='mark-notification-read'),
    # Moderation URLs
    path('moderation/queue/', views.ModerationQueueView.as_view(), name='moderation-queue'),
    path('moderation/cases/<str:case_id>/assign/', views.assign_moderator, name='assign-moderator'),
    path('moderation/cases/<str:case_id>/actions/', views.take_moderation_action, name='take-moderation-action'),
    path('moderation/stats/', views.moderation_stats, name='moderation-stats'),
    path('moderation/flagged-tracks/', views.FlaggedTracksView.as_view(), name='flagged-tracks'),
    path('moderation/tracks/<str:track_id>/review/', views.review_track, name='review-track'),
]

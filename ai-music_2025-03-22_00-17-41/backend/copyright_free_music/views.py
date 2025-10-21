# views.py for {{   COPYRIGHT-FREE MUSIC SHARING MODULE }}
# This file contains the viewsets for the copyright_free_music app,
# providing API endpoints for managing music tracks, licenses, purchases, and related data.
# It uses TenantAwareMixin for multi-tenancy support and includes filtering, searching, and pagination.

from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters import rest_framework as filters
from tenants.mixins import TenantAwareMixin
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
from .serializers import (
    LicenseTermSerializer,
    PaymentProviderSerializer,
    TrackSerializer,
    TrackLicenseSerializer,
    TrackPurchaseSerializer,
    TrackDownloadSerializer,
    UsageAgreementSerializer,
    TrackAnalyticSerializer,
    RoyaltyTransactionSerializer,
    DynamicPricingRuleSerializer,
    ExternalUsageLogSerializer,
    ConditionalLicenseEscalationSerializer,
    BrandedCatalogSerializer,
    BrandedCatalogTrackSerializer,
    RegionalLegalFrameworkSerializer,
    TrackLegalMappingSerializer,
)
from rest_framework import permissions
from django.utils.translation import gettext_lazy as _
import logging

logger = logging.getLogger(__name__)


class FilterSearchMixin(filters.FilterSet):
    """
    Mixin for adding filtering and searching capabilities to viewsets.
    """
    search = filters.CharFilter(field_name='search', lookup_expr='icontains')


class BaseTenantAwareViewSet(TenantAwareMixin, FilterSearchMixin, viewsets.ModelViewSet):
    """
    Base viewset for all models in this app, providing multi-tenancy, filtering, searching, and pagination.
    """
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = (filters.DjangoFilterBackend,)
    ordering_fields = '__all__'
    ordering = ['id']


class LicenseTermViewSet(BaseTenantAwareViewSet):
    """
    ViewSet for the LicenseTerm model.
    """
    queryset = LicenseTerm.objects.all()
    serializer_class = LicenseTermSerializer
    filterset_fields = ['license_name']


class PaymentProviderViewSet(BaseTenantAwareViewSet):
    """
    ViewSet for the PaymentProvider model.
    """
    queryset = PaymentProvider.objects.all()
    serializer_class = PaymentProviderSerializer
    filterset_fields = ['provider_name', 'active']


class TrackViewSet(BaseTenantAwareViewSet):
    """
    ViewSet for the Track model.
    """
    queryset = Track.objects.all()
    serializer_class = TrackSerializer
    filterset_fields = ['title', 'user__id', 'license__id']


class TrackLicenseViewSet(BaseTenantAwareViewSet):
    """
    ViewSet for the TrackLicense model.
    """
    queryset = TrackLicense.objects.all()
    serializer_class = TrackLicenseSerializer
    filterset_fields = ['track__id']


class TrackPurchaseViewSet(BaseTenantAwareViewSet):
    """
    ViewSet for the TrackPurchase model.
    """
    queryset = TrackPurchase.objects.all()
    serializer_class = TrackPurchaseSerializer
    filterset_fields = ['track__id', 'buyer__id', 'payment_provider__id']


class TrackDownloadViewSet(BaseTenantAwareViewSet):
    """
    ViewSet for the TrackDownload model.
    """
    queryset = TrackDownload.objects.all()
    serializer_class = TrackDownloadSerializer
    filterset_fields = ['track__id', 'downloader__id']


class UsageAgreementViewSet(BaseTenantAwareViewSet):
    """
    ViewSet for the UsageAgreement model.
    """
    queryset = UsageAgreement.objects.all()
    serializer_class = UsageAgreementSerializer
    filterset_fields = ['track__id', 'user__id']


class TrackAnalyticViewSet(BaseTenantAwareViewSet):
    """
    ViewSet for the TrackAnalytic model.
    """
    queryset = TrackAnalytic.objects.all()
    serializer_class = TrackAnalyticSerializer
    filterset_fields = ['track__id']


class RoyaltyTransactionViewSet(BaseTenantAwareViewSet):
    """
    ViewSet for the RoyaltyTransaction model.
    """
    queryset = RoyaltyTransaction.objects.all()
    serializer_class = RoyaltyTransactionSerializer
    filterset_fields = ['track__id', 'user__id']


class DynamicPricingRuleViewSet(BaseTenantAwareViewSet):
    """
    ViewSet for the DynamicPricingRule model.
    """
    queryset = DynamicPricingRule.objects.all()
    serializer_class = DynamicPricingRuleSerializer
    filterset_fields = ['track__id']


class ExternalUsageLogViewSet(BaseTenantAwareViewSet):
    """
    ViewSet for the ExternalUsageLog model.
    """
    queryset = ExternalUsageLog.objects.all()
    serializer_class = ExternalUsageLogSerializer
    filterset_fields = ['track__id']


class ConditionalLicenseEscalationViewSet(BaseTenantAwareViewSet):
    """
    ViewSet for the ConditionalLicenseEscalation model.
    """
    queryset = ConditionalLicenseEscalation.objects.all()
    serializer_class = ConditionalLicenseEscalationSerializer
    filterset_fields = ['track__id']


class BrandedCatalogViewSet(BaseTenantAwareViewSet):
    """
    ViewSet for the BrandedCatalog model.
    """
    queryset = BrandedCatalog.objects.all()
    serializer_class = BrandedCatalogSerializer
    filterset_fields = ['catalog_name']


class BrandedCatalogTrackViewSet(BaseTenantAwareViewSet):
    """
    ViewSet for the BrandedCatalogTrack model.
    """
    queryset = BrandedCatalogTrack.objects.all()
    serializer_class = BrandedCatalogTrackSerializer
    filterset_fields = ['catalog__id', 'track__id']


class RegionalLegalFrameworkViewSet(BaseTenantAwareViewSet):
    """
    ViewSet for the RegionalLegalFramework model.
    """
    queryset = RegionalLegalFramework.objects.all()
    serializer_class = RegionalLegalFrameworkSerializer
    filterset_fields = ['region_code']


class TrackLegalMappingViewSet(BaseTenantAwareViewSet):
    """
    ViewSet for the TrackLegalMapping model.
    """
    queryset = TrackLegalMapping.objects.all()
    serializer_class = TrackLegalMappingSerializer
    filterset_fields = ['track__id', 'framework__id']

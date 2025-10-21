# urls.py for billing_management
# This file defines the URL patterns for the billing_management app, including API endpoints for managing billing-related data.

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Use DefaultRouter instead of TenantAwareRouter
router = DefaultRouter()

# Register viewsets with the router
router.register(r'payment-methods', views.PaymentMethodViewSet, basename='payment-method')
router.register(r'invoices', views.InvoiceViewSet, basename='invoice')
router.register(r'subscriptions', views.SubscriptionViewSet, basename='subscription')
router.register(r'charges', views.ChargeViewSet, basename='charge')
router.register(r'webhook-events', views.WebhookEventViewSet, basename='webhook-event')
router.register(r'refunds', views.RefundViewSet, basename='refund')
router.register(r'compliance-audits', views.ComplianceAuditViewSet, basename='compliance-audit')
router.register(r'dynamic-pricing-rules', views.DynamicPricingRuleViewSet, basename='dynamic-pricing-rule')
router.register(r'fraud-detection-logs', views.FraudDetectionLogViewSet, basename='fraud-detection-log')
router.register(r'payment-federation-links', views.PaymentFederationLinkViewSet, basename='payment-federation-link')
router.register(r'tokenized-entitlements', views.TokenizedEntitlementViewSet, basename='tokenized-entitlement')
router.register(r'revenue-forecasts', views.RevenueForecastViewSet, basename='revenue-forecast')
router.register(r'payment-insight-wizards', views.PaymentInsightWizardViewSet, basename='payment-insight-wizard')
router.register(r'multi-currency-installments', views.MultiCurrencyInstallmentViewSet, basename='multi-currency-installment')
router.register(r'sla-deposits', views.SLADepositViewSet, basename='sla-deposit')
router.register(r'currency-exchange-logs', views.CurrencyExchangeLogViewSet, basename='currency-exchange-log')
router.register(r'payment-aggregator-routings', views.PaymentAggregatorRoutingViewSet, basename='payment-aggregator-routing')
router.register(r'seasonal-pricing-rules', views.SeasonalPricingRuleViewSet, basename='seasonal-pricing-rule')
router.register(r'payment-device-configs', views.PaymentDeviceConfigViewSet, basename='payment-device-config')


# Define URL patterns
urlpatterns = [
    path('', include(router.urls)),
    # Add any additional URL patterns here if needed
]

# Set the app namespace
app_name = 'billing_management'

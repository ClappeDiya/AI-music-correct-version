# admin.py for billing_management
# This file defines how the models in the billing_management app are displayed and managed in the Django admin interface.

from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import (
    PaymentMethod,
    Invoice,
    Subscription,
    Charge,
    WebhookEvent,
    Refund,
    ComplianceAudit,
    DynamicPricingRule,
    FraudDetectionLog,
    PaymentFederationLink,
    TokenizedEntitlement,
    RevenueForecast,
    PaymentInsightWizard,
    MultiCurrencyInstallment,
    SLADeposit,
    CurrencyExchangeLog,
    PaymentAggregatorRouting,
    SeasonalPricingRule,
    PaymentDeviceConfig,
)

@admin.register(PaymentMethod)
class PaymentMethodAdmin(admin.ModelAdmin):
    """
    Admin class for the PaymentMethod model.
    """
    list_display = ('id', 'user_id', 'stripe_customer_id', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user_id', 'stripe_customer_id', 'stripe_payment_method_id')
    readonly_fields = ('created_at',)

@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    """
    Admin class for the Invoice model.
    """
    list_display = ('id', 'stripe_invoice_id', 'amount_cents', 'currency', 'status', 'created_at')
    list_filter = ('status', 'currency', 'created_at')
    search_fields = ('stripe_invoice_id',)
    readonly_fields = ('created_at',)

@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    """
    Admin class for the Subscription model.
    """
    list_display = ('id', 'stripe_subscription_id', 'plan_reference', 'current_period_start', 'current_period_end')
    list_filter = ('current_period_start', 'current_period_end')
    search_fields = ('stripe_subscription_id', 'plan_reference')

@admin.register(Charge)
class ChargeAdmin(admin.ModelAdmin):
    """
    Admin class for the Charge model.
    """
    list_display = ('id', 'stripe_charge_id', 'amount_cents', 'currency', 'created_at')
    list_filter = ('currency', 'created_at')
    search_fields = ('stripe_charge_id',)
    readonly_fields = ('created_at',)

@admin.register(WebhookEvent)
class WebhookEventAdmin(admin.ModelAdmin):
    """
    Admin class for the WebhookEvent model.
    """
    list_display = ('id', 'event_type', 'received_at', 'processed')
    list_filter = ('event_type', 'processed', 'received_at')
    search_fields = ('event_type',)
    readonly_fields = ('received_at',)

@admin.register(Refund)
class RefundAdmin(admin.ModelAdmin):
    """
    Admin class for the Refund model.
    """
    list_display = ('id', 'stripe_refund_id', 'charge_id', 'amount_cents', 'reason', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('stripe_refund_id', 'charge_id', 'reason')
    readonly_fields = ('created_at',)

@admin.register(ComplianceAudit)
class ComplianceAuditAdmin(admin.ModelAdmin):
    """
    Admin class for the ComplianceAudit model.
    """
    list_display = ('id', 'action', 'occurred_at')
    list_filter = ('action', 'occurred_at')
    search_fields = ('action',)
    readonly_fields = ('occurred_at',)

@admin.register(DynamicPricingRule)
class DynamicPricingRuleAdmin(admin.ModelAdmin):
    """
    Admin class for the DynamicPricingRule model.
    """
    list_display = ('id', 'name', 'rule_type', 'is_active', 'created_at', 'updated_at')
    list_filter = ('is_active', 'rule_type', 'created_at')
    search_fields = ('name', 'description')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(FraudDetectionLog)
class FraudDetectionLogAdmin(admin.ModelAdmin):
    """
    Admin class for the FraudDetectionLog model.
    """
    list_display = ('id', 'charge_id', 'fraud_score', 'logged_at')
    list_filter = ('logged_at',)
    search_fields = ('charge_id',)
    readonly_fields = ('logged_at',)

@admin.register(PaymentFederationLink)
class PaymentFederationLinkAdmin(admin.ModelAdmin):
    """
    Admin class for the PaymentFederationLink model.
    """
    list_display = ('id', 'external_service_name', 'updated_at')
    list_filter = ('updated_at',)
    search_fields = ('external_service_name',)
    readonly_fields = ('updated_at',)

@admin.register(TokenizedEntitlement)
class TokenizedEntitlementAdmin(admin.ModelAdmin):
    """
    Admin class for the TokenizedEntitlement model.
    """
    list_display = ('id', 'entitlement_token', 'issued_at')
    list_filter = ('issued_at',)
    search_fields = ('entitlement_token',)
    readonly_fields = ('issued_at',)

@admin.register(RevenueForecast)
class RevenueForecastAdmin(admin.ModelAdmin):
    """
    Admin class for the RevenueForecast model.
    """
    list_display = ('id', 'forecast_period', 'generated_at')
    list_filter = ('generated_at',)
    search_fields = ('forecast_period',)
    readonly_fields = ('generated_at',)

@admin.register(PaymentInsightWizard)
class PaymentInsightWizardAdmin(admin.ModelAdmin):
    """
    Admin class for the PaymentInsightWizard model.
    """
    list_display = ('id', 'updated_at')
    list_filter = ('updated_at',)
    readonly_fields = ('updated_at',)

@admin.register(MultiCurrencyInstallment)
class MultiCurrencyInstallmentAdmin(admin.ModelAdmin):
    """
    Admin class for the MultiCurrencyInstallment model.
    """
    list_display = ('id', 'user_id', 'base_amount_cents', 'currency', 'created_at')
    list_filter = ('currency', 'created_at')
    search_fields = ('user_id',)
    readonly_fields = ('created_at',)

@admin.register(SLADeposit)
class SLADepositAdmin(admin.ModelAdmin):
    """
    Admin class for the SLADeposit model.
    """
    list_display = ('id', 'deposit_amount_cents', 'escrow_status', 'updated_at')
    list_filter = ('escrow_status', 'updated_at')
    readonly_fields = ('updated_at',)

@admin.register(CurrencyExchangeLog)
class CurrencyExchangeLogAdmin(admin.ModelAdmin):
    """
    Admin class for the CurrencyExchangeLog model.
    """
    list_display = ('id', 'transaction_ref', 'from_currency', 'to_currency', 'rate', 'applied_at')
    list_filter = ('from_currency', 'to_currency', 'applied_at')
    search_fields = ('transaction_ref',)
    readonly_fields = ('applied_at',)

@admin.register(PaymentAggregatorRouting)
class PaymentAggregatorRoutingAdmin(admin.ModelAdmin):
    """
    Admin class for the PaymentAggregatorRouting model.
    """
    list_display = ('id', 'aggregator_name', 'last_assessed')
    list_filter = ('last_assessed',)
    search_fields = ('aggregator_name',)
    readonly_fields = ('last_assessed',)

@admin.register(SeasonalPricingRule)
class SeasonalPricingRuleAdmin(admin.ModelAdmin):
    """
    Admin class for the SeasonalPricingRule model.
    """
    list_display = ('id', 'updated_at')
    list_filter = ('updated_at',)
    readonly_fields = ('updated_at',)

@admin.register(PaymentDeviceConfig)
class PaymentDeviceConfigAdmin(admin.ModelAdmin):
    """
    Admin class for the PaymentDeviceConfig model.
    """
    list_display = ('id', 'user_id', 'device_type', 'configured_at')
    list_filter = ('device_type', 'configured_at')
    search_fields = ('user_id', 'device_type')
    readonly_fields = ('configured_at',)

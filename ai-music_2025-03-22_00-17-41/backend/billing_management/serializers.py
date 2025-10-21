from rest_framework import serializers
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
from multitenancy_management.serializers import TenantAwareMixin


class BaseUserAwareSerializer(serializers.ModelSerializer):
    """
    Base serializer that implements user-aware validation and security
    """
    def validate(self, data):
        """
        Implement user-level validation
        """
        request = self.context.get('request')
        if not request or not request.user:
            raise serializers.ValidationError("User context is required")
        return data


class PaymentMethodSerializer(BaseUserAwareSerializer):
    """
    Serializer for the PaymentMethod model.
    Includes tenant-aware behavior and explicit field definitions.
    """
    class Meta:
        model = PaymentMethod
        fields = [
            'id',
            'user_id',
            'stripe_customer_id',
            'stripe_payment_method_id',
            'method_metadata',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at', 'user_id']


class InvoiceSerializer(TenantAwareMixin, serializers.ModelSerializer):
    """
    Serializer for the Invoice model.
    Includes tenant-aware behavior and explicit field definitions.
    """
    class Meta:
        model = Invoice
        fields = [
            'id',
            'tenant_id',
            'stripe_invoice_id',
            'amount_cents',
            'currency',
            'status',
            'invoice_data',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class SubscriptionSerializer(TenantAwareMixin, serializers.ModelSerializer):
    """
    Serializer for the Subscription model.
    Includes tenant-aware behavior and explicit field definitions.
    """
    class Meta:
        model = Subscription
        fields = [
            'id',
            'tenant_id',
            'stripe_subscription_id',
            'plan_reference',
            'current_period_start',
            'current_period_end',
            'subscription_data',
        ]
        read_only_fields = ['id']


class ChargeSerializer(TenantAwareMixin, serializers.ModelSerializer):
    """
    Serializer for the Charge model.
    Includes tenant-aware behavior and explicit field definitions.
    """
    class Meta:
        model = Charge
        fields = [
            'id',
            'tenant_id',
            'stripe_charge_id',
            'amount_cents',
            'currency',
            'charge_data',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class WebhookEventSerializer(TenantAwareMixin, serializers.ModelSerializer):
    """
    Serializer for the WebhookEvent model.
    Includes tenant-aware behavior and explicit field definitions.
    """
    class Meta:
        model = WebhookEvent
        fields = [
            'id',
            'tenant_id',
            'event_type',
            'event_payload',
            'received_at',
            'processed',
        ]
        read_only_fields = ['id', 'received_at']


class RefundSerializer(TenantAwareMixin, serializers.ModelSerializer):
    """
    Serializer for the Refund model.
    Includes tenant-aware behavior and explicit field definitions.
    """
    class Meta:
        model = Refund
        fields = [
            'id',
            'tenant_id',
            'stripe_refund_id',
            'charge_id',
            'amount_cents',
            'reason',
            'refund_data',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class ComplianceAuditSerializer(TenantAwareMixin, serializers.ModelSerializer):
    """
    Serializer for the ComplianceAudit model.
    Includes tenant-aware behavior and explicit field definitions.
    """
    class Meta:
        model = ComplianceAudit
        fields = [
            'id',
            'tenant_id',
            'action',
            'details',
            'occurred_at',
        ]
        read_only_fields = ['id', 'occurred_at']


class DynamicPricingRuleSerializer(TenantAwareMixin, serializers.ModelSerializer):
    """
    Serializer for the DynamicPricingRule model.
    Includes tenant-aware behavior and explicit field definitions.
    """
    class Meta:
        model = DynamicPricingRule
        fields = '__all__'


class FraudDetectionLogSerializer(TenantAwareMixin, serializers.ModelSerializer):
    """
    Serializer for the FraudDetectionLog model.
    Includes tenant-aware behavior and explicit field definitions.
    """
    class Meta:
        model = FraudDetectionLog
        fields = [
            'id',
            'tenant_id',
            'charge_id',
            'fraud_score',
            'analysis_data',
            'logged_at',
        ]
        read_only_fields = ['id', 'logged_at']


class PaymentFederationLinkSerializer(TenantAwareMixin, serializers.ModelSerializer):
    """
    Serializer for the PaymentFederationLink model.
    Includes tenant-aware behavior and explicit field definitions.
    """
    class Meta:
        model = PaymentFederationLink
        fields = [
            'id',
            'tenant_id',
            'external_service_name',
            'federation_details',
            'updated_at',
        ]
        read_only_fields = ['id', 'updated_at']


class TokenizedEntitlementSerializer(TenantAwareMixin, serializers.ModelSerializer):
    """
    Serializer for the TokenizedEntitlement model.
    Includes tenant-aware behavior and explicit field definitions.
    """
    class Meta:
        model = TokenizedEntitlement
        fields = [
            'id',
            'tenant_id',
            'entitlement_token',
            'entitlement_details',
            'issued_at',
        ]
        read_only_fields = ['id', 'issued_at']


class RevenueForecastSerializer(TenantAwareMixin, serializers.ModelSerializer):
    """
    Serializer for the RevenueForecast model.
    Includes tenant-aware behavior and explicit field definitions.
    """
    class Meta:
        model = RevenueForecast
        fields = [
            'id',
            'tenant_id',
            'forecast_period',
            'forecast_data',
            'generated_at',
        ]
        read_only_fields = ['id', 'generated_at']

class PaymentInsightWizardSerializer(TenantAwareMixin, serializers.ModelSerializer):
    """
    Serializer for the PaymentInsightWizard model.
    Includes tenant-aware behavior and explicit field definitions.
    """
    class Meta:
        model = PaymentInsightWizard
        fields = [
            'id',
            'tenant_id',
            'wizard_config',
            'updated_at',
        ]
        read_only_fields = ['id', 'updated_at']


class MultiCurrencyInstallmentSerializer(TenantAwareMixin, serializers.ModelSerializer):
    """
    Serializer for the MultiCurrencyInstallment model.
    Includes tenant-aware behavior and explicit field definitions.
    """
    class Meta:
        model = MultiCurrencyInstallment
        fields = [
            'id',
            'tenant_id',
            'user_id',
            'base_amount_cents',
            'currency',
            'installment_schedule',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class SLADepositSerializer(TenantAwareMixin, serializers.ModelSerializer):
    """
    Serializer for the SLADeposit model.
    Includes tenant-aware behavior and explicit field definitions.
    """
    class Meta:
        model = SLADeposit
        fields = [
            'id',
            'tenant_id',
            'deposit_amount_cents',
            'conditions',
            'escrow_status',
            'updated_at',
        ]
        read_only_fields = ['id', 'updated_at']


class CurrencyExchangeLogSerializer(TenantAwareMixin, serializers.ModelSerializer):
    """
    Serializer for the CurrencyExchangeLog model.
    Includes tenant-aware behavior and explicit field definitions.
    """
    class Meta:
        model = CurrencyExchangeLog
        fields = [
            'id',
            'tenant_id',
            'transaction_ref',
            'from_currency',
            'to_currency',
            'rate',
            'applied_at',
        ]
        read_only_fields = ['id', 'applied_at']


class PaymentAggregatorRoutingSerializer(TenantAwareMixin, serializers.ModelSerializer):
    """
    Serializer for the PaymentAggregatorRouting model.
    Includes tenant-aware behavior and explicit field definitions.
    """
    class Meta:
        model = PaymentAggregatorRouting
        fields = [
            'id',
            'tenant_id',
            'aggregator_name',
            'performance_metrics',
            'last_assessed',
        ]
        read_only_fields = ['id', 'last_assessed']


class SeasonalPricingRuleSerializer(TenantAwareMixin, serializers.ModelSerializer):
    """
    Serializer for the SeasonalPricingRule model.
    Includes tenant-aware behavior and explicit field definitions.
    """
    class Meta:
        model = SeasonalPricingRule
        fields = [
            'id',
            'tenant_id',
            'trigger_conditions',
            'pricing_adjustments',
            'updated_at',
        ]
        read_only_fields = ['id', 'updated_at']


class PaymentDeviceConfigSerializer(TenantAwareMixin, serializers.ModelSerializer):
    """
    Serializer for the PaymentDeviceConfig model.
    Includes tenant-aware behavior and explicit field definitions.
    """
    class Meta:
        model = PaymentDeviceConfig
        fields = [
            'id',
            'tenant_id',
            'user_id',
            'device_type',
            'device_settings',
            'configured_at',
        ]
        read_only_fields = ['id', 'configured_at']

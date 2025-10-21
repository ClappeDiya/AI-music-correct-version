# views.py for billing_management
# This file contains the viewsets for the billing_management app, providing API endpoints for managing billing-related data.

from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework import status
from django_filters import rest_framework as filters
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
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
from .serializers import (
    PaymentMethodSerializer,
    InvoiceSerializer,
    SubscriptionSerializer,
    ChargeSerializer,
    WebhookEventSerializer,
    RefundSerializer,
    ComplianceAuditSerializer,
    DynamicPricingRuleSerializer,
    FraudDetectionLogSerializer,
    PaymentFederationLinkSerializer,
    TokenizedEntitlementSerializer,
    RevenueForecastSerializer,
    PaymentInsightWizardSerializer,
    MultiCurrencyInstallmentSerializer,
    SLADepositSerializer,
    CurrencyExchangeLogSerializer,
    PaymentAggregatorRoutingSerializer,
    SeasonalPricingRuleSerializer,
    PaymentDeviceConfigSerializer,
)
from rest_framework.decorators import action


class BaseUserAwareViewSet(viewsets.ModelViewSet):
    """
    Base viewset that provides user-aware behavior and standard CRUD operations.
    Implements user-level security and filtering.
    """
    permission_classes = [IsAuthenticated]
    filter_backends = (filters.DjangoFilterBackend,)

    def get_queryset(self):
        """
        Filter queryset based on user's role and permissions
        """
        queryset = super().get_queryset()
        user = self.request.user

        # If user is admin/staff, return all records
        if user.is_staff or user.is_superuser:
            return queryset

        # For regular users, filter by user_id if the model has that field
        if hasattr(self.queryset.model, 'user_id'):
            return queryset.filter(user_id=user.id)
            
        return queryset.none()  # Default to no access if no user relationship exists

    def perform_create(self, serializer):
        """
        Automatically set user_id on creation if the model supports it
        """
        if hasattr(serializer.Meta.model, 'user_id'):
            serializer.save(user_id=self.request.user.id)
        else:
            serializer.save()


class PaymentMethodViewSet(BaseUserAwareViewSet):
    """
    ViewSet for the PaymentMethod model.
    Provides API endpoints for managing payment methods.
    """
    queryset = PaymentMethod.objects.all()
    serializer_class = PaymentMethodSerializer
    filterset_fields = ['stripe_customer_id']
    search_fields = ['stripe_customer_id', 'stripe_payment_method_id']


class InvoiceViewSet(BaseUserAwareViewSet):
    """
    ViewSet for the Invoice model.
    Provides API endpoints for managing invoices.
    """
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    filterset_fields = ['status', 'currency']
    search_fields = ['stripe_invoice_id']


class SubscriptionViewSet(BaseUserAwareViewSet):
    """
    ViewSet for the Subscription model.
    Provides API endpoints for managing subscriptions.
    """
    queryset = Subscription.objects.all()
    serializer_class = SubscriptionSerializer
    filterset_fields = ['plan_reference']
    search_fields = ['stripe_subscription_id']


class ChargeViewSet(BaseUserAwareViewSet):
    """
    ViewSet for the Charge model.
    Provides API endpoints for managing charges.
    """
    queryset = Charge.objects.all()
    serializer_class = ChargeSerializer
    filterset_fields = ['currency']
    search_fields = ['stripe_charge_id']


class WebhookEventViewSet(BaseUserAwareViewSet):
    """
    ViewSet for the WebhookEvent model.
    Provides API endpoints for managing webhook events.
    """
    queryset = WebhookEvent.objects.all()
    serializer_class = WebhookEventSerializer
    filterset_fields = ['event_type', 'processed']
    search_fields = ['event_type']


class RefundViewSet(BaseUserAwareViewSet):
    """
    ViewSet for the Refund model.
    Provides API endpoints for managing refunds.
    """
    queryset = Refund.objects.all()
    serializer_class = RefundSerializer
    filterset_fields = ['charge_id']
    search_fields = ['stripe_refund_id', 'reason']


class ComplianceAuditViewSet(BaseUserAwareViewSet):
    """
    ViewSet for the ComplianceAudit model.
    Provides API endpoints for managing compliance audit logs.
    """
    queryset = ComplianceAudit.objects.all()
    serializer_class = ComplianceAuditSerializer
    filterset_fields = ['action']
    search_fields = ['action']


class DynamicPricingRuleViewSet(BaseUserAwareViewSet):
    """
    ViewSet for the DynamicPricingRule model.
    Provides API endpoints for managing dynamic pricing rules.
    """
    queryset = DynamicPricingRule.objects.all()
    serializer_class = DynamicPricingRuleSerializer
    filterset_fields = ['rule_data']
    search_fields = ['rule_data']

    def evaluate_conditions(self, conditions: dict, params: dict) -> bool:
        """
        Evaluate if the given parameters meet the rule conditions
        """
        try:
            for key, condition in conditions.items():
                if key not in params:
                    return False
                    
                param_value = params[key]
                operator = condition.get('operator', '==')
                target_value = condition.get('value')

                if operator == '==':
                    if param_value != target_value:
                        return False
                elif operator == '>':
                    if not param_value > target_value:
                        return False
                elif operator == '<':
                    if not param_value < target_value:
                        return False
                elif operator == '>=':
                    if not param_value >= target_value:
                        return False
                elif operator == '<=':
                    if not param_value <= target_value:
                        return False
                elif operator == 'in':
                    if param_value not in target_value:
                        return False
                        
            return True
            
        except (KeyError, TypeError):
            return False

    def apply_adjustments(self, adjustments: dict, original_price: float) -> float:
        """
        Apply price adjustments according to the rule
        """
        try:
            adjusted_price = original_price
            
            for adjustment in adjustments:
                type = adjustment.get('type')
                value = adjustment.get('value', 0)
                
                if type == 'percentage':
                    adjusted_price *= (1 + value/100)
                elif type == 'fixed':
                    adjusted_price += value
                elif type == 'set':
                    adjusted_price = value
                    
            return round(adjusted_price, 2)
            
        except (KeyError, TypeError):
            return original_price

    @action(detail=True, methods=['post'])
    def toggle(self, request, pk=None):
        instance = self.get_object()
        instance.active = request.data.get('active', not instance.active)
        instance.save()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
        
    @action(detail=True, methods=['post'])
    def simulate(self, request, pk=None):
        instance = self.get_object()
        params = request.data
        
        # Get original price from params
        original_price = params.get('price', 0)
        currency = params.get('currency', 'USD')
        
        # Apply pricing rules
        adjusted_price = original_price
        applied_rules = []
        
        if instance.active:
            # Apply conditions and adjustments from the rule
            if self.evaluate_conditions(instance.conditions, params):
                adjusted_price = self.apply_adjustments(
                    instance.adjustments, 
                    original_price
                )
                applied_rules.append(instance.name)
        
        return Response({
            'originalPrice': original_price,
            'adjustedPrice': adjusted_price,
            'appliedRules': applied_rules,
            'currency': currency
        })


class FraudDetectionLogViewSet(BaseUserAwareViewSet):
    """
    ViewSet for the FraudDetectionLog model.
    Provides API endpoints for managing fraud detection logs.
    """
    queryset = FraudDetectionLog.objects.all()
    serializer_class = FraudDetectionLogSerializer
    filterset_fields = ['charge_id']
    # No specific search fields for analysis_data, can be added if needed


class PaymentFederationLinkViewSet(BaseUserAwareViewSet):
    """
    ViewSet for the PaymentFederationLink model.
    Provides API endpoints for managing payment federation links.
    """
    queryset = PaymentFederationLink.objects.all()
    serializer_class = PaymentFederationLinkSerializer
    filterset_fields = ['external_service_name']
    search_fields = ['external_service_name']


class TokenizedEntitlementViewSet(BaseUserAwareViewSet):
    """
    ViewSet for the TokenizedEntitlement model.
    Provides API endpoints for managing tokenized entitlements.
    """
    queryset = TokenizedEntitlement.objects.all()
    serializer_class = TokenizedEntitlementSerializer
    search_fields = ['entitlement_token']


class RevenueForecastViewSet(BaseUserAwareViewSet):
    """
    ViewSet for the RevenueForecast model.
    Provides API endpoints for managing revenue forecasts.
    """
    queryset = RevenueForecast.objects.all()
    serializer_class = RevenueForecastSerializer
    filterset_fields = ['forecast_period']
    # No specific search fields for forecast_data, can be added if needed


class PaymentInsightWizardViewSet(BaseUserAwareViewSet):
    """
    ViewSet for the PaymentInsightWizard model.
    Provides API endpoints for managing payment insight wizard configurations.
    """
    queryset = PaymentInsightWizard.objects.all()
    serializer_class = PaymentInsightWizardSerializer
    # No specific filters or search fields for wizard_config, can be added if needed


class MultiCurrencyInstallmentViewSet(BaseUserAwareViewSet):
    """
    ViewSet for the MultiCurrencyInstallment model.
    Provides API endpoints for managing multi-currency installment plans.
    """
    queryset = MultiCurrencyInstallment.objects.all()
    serializer_class = MultiCurrencyInstallmentSerializer
    filterset_fields = ['currency', 'user_id']
    # No specific search fields for installment_schedule, can be added if needed


class SLADepositViewSet(BaseUserAwareViewSet):
    """
    ViewSet for the SLADeposit model.
    Provides API endpoints for managing SLA-based refundable deposits.
    """
    queryset = SLADeposit.objects.all()
    serializer_class = SLADepositSerializer
    filterset_fields = ['escrow_status']
    # No specific search fields for conditions, can be added if needed


class CurrencyExchangeLogViewSet(BaseUserAwareViewSet):
    """
    ViewSet for the CurrencyExchangeLog model.
    Provides API endpoints for managing currency exchange logs.
    """
    queryset = CurrencyExchangeLog.objects.all()
    serializer_class = CurrencyExchangeLogSerializer
    filterset_fields = ['from_currency', 'to_currency']
    search_fields = ['transaction_ref']


class PaymentAggregatorRoutingViewSet(BaseUserAwareViewSet):
    """
    ViewSet for the PaymentAggregatorRouting model.
    Provides API endpoints for managing payment aggregator routing configurations.
    """
    queryset = PaymentAggregatorRouting.objects.all()
    serializer_class = PaymentAggregatorRoutingSerializer
    filterset_fields = ['aggregator_name']
    search_fields = ['aggregator_name']


class SeasonalPricingRuleViewSet(BaseUserAwareViewSet):
    """
    ViewSet for the SeasonalPricingRule model.
    Provides API endpoints for managing seasonal pricing rules.
    """
    queryset = SeasonalPricingRule.objects.all()
    serializer_class = SeasonalPricingRuleSerializer
    # No specific filters or search fields for trigger_conditions or pricing_adjustments, can be added if needed


class PaymentDeviceConfigViewSet(BaseUserAwareViewSet):
    """
    ViewSet for the PaymentDeviceConfig model.
    Provides API endpoints for managing payment device configurations.
    """
    queryset = PaymentDeviceConfig.objects.all()
    serializer_class = PaymentDeviceConfigSerializer
    filterset_fields = ['device_type', 'user_id']
    # No specific search fields for device_settings, can be added if needed

from django.db import models
from django.utils.translation import gettext_lazy as _


class PaymentMethod(models.Model):
    """
    Represents a payment method associated with a user.
    """
    id = models.BigAutoField(primary_key=True)
    user_id = models.BigIntegerField(null=True, blank=True, verbose_name=_("User ID"), help_text=_("The ID of the user associated with this payment method."))
    stripe_customer_id = models.TextField(null=True, blank=True, verbose_name=_("Stripe Customer ID"), help_text=_("The Stripe customer ID associated with the user."))
    stripe_payment_method_id = models.TextField(null=True, blank=True, verbose_name=_("Stripe Payment Method ID"), help_text=_("The Stripe payment method ID."))
    method_metadata = models.JSONField(null=True, blank=True, verbose_name=_("Method Metadata"), help_text=_("Additional metadata about the payment method (e.g., card details)."))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("The date and time when the payment method was created."))

    class Meta:
        verbose_name = _("Payment Method")
        verbose_name_plural = _("Payment Methods")

    def __str__(self):
        return f"Payment Method for User: {self.user_id}"


class Invoice(models.Model):
    """
    Represents an invoice.
    """
    id = models.BigAutoField(primary_key=True)
    stripe_invoice_id = models.TextField(unique=True, verbose_name=_("Stripe Invoice ID"), help_text=_("The unique Stripe invoice ID."))
    amount_cents = models.IntegerField(verbose_name=_("Amount (cents)"), help_text=_("The amount of the invoice in cents."))
    currency = models.TextField(verbose_name=_("Currency"), help_text=_("The currency of the invoice."))
    status = models.TextField(verbose_name=_("Status"), help_text=_("The status of the invoice (e.g., paid, open, void)."))
    invoice_data = models.JSONField(null=True, blank=True, verbose_name=_("Invoice Data"), help_text=_("Full invoice details from Stripe."))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("The date and time when the invoice was created."))

    class Meta:
        verbose_name = _("Invoice")
        verbose_name_plural = _("Invoices")

    def __str__(self):
        return f"Invoice: {self.stripe_invoice_id}"


class Subscription(models.Model):
    """
    Represents a subscription.
    """
    id = models.BigAutoField(primary_key=True)
    stripe_subscription_id = models.TextField(unique=True, verbose_name=_("Stripe Subscription ID"), help_text=_("The unique Stripe subscription ID."))
    plan_reference = models.TextField(null=True, blank=True, verbose_name=_("Plan Reference"), help_text=_("Reference to a subscription plan."))
    current_period_start = models.DateTimeField(null=True, blank=True, verbose_name=_("Current Period Start"), help_text=_("The start date and time of the current subscription period."))
    current_period_end = models.DateTimeField(null=True, blank=True, verbose_name=_("Current Period End"), help_text=_("The end date and time of the current subscription period."))
    subscription_data = models.JSONField(null=True, blank=True, verbose_name=_("Subscription Data"), help_text=_("Full subscription details from Stripe."))

    class Meta:
        verbose_name = _("Subscription")
        verbose_name_plural = _("Subscriptions")

    def __str__(self):
        return f"Subscription: {self.stripe_subscription_id}"


class Charge(models.Model):
    """
    Represents a charge.
    """
    id = models.BigAutoField(primary_key=True)
    stripe_charge_id = models.TextField(unique=True, verbose_name=_("Stripe Charge ID"), help_text=_("The unique Stripe charge ID."))
    amount_cents = models.IntegerField(verbose_name=_("Amount (cents)"), help_text=_("The amount of the charge in cents."))
    currency = models.TextField(verbose_name=_("Currency"), help_text=_("The currency of the charge."))
    charge_data = models.JSONField(null=True, blank=True, verbose_name=_("Charge Data"), help_text=_("Charge details, receipt URL, payment method used."))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("The date and time when the charge was created."))

    class Meta:
        verbose_name = _("Charge")
        verbose_name_plural = _("Charges")

    def __str__(self):
        return f"Charge: {self.stripe_charge_id}"


class WebhookEvent(models.Model):
    """
    Represents a webhook event received from Stripe.
    """
    id = models.BigAutoField(primary_key=True)
    event_type = models.TextField(verbose_name=_("Event Type"), help_text=_("The type of the webhook event (e.g., invoice.payment_succeeded)."))
    event_payload = models.JSONField(verbose_name=_("Event Payload"), help_text=_("The raw payload from Stripe."))
    received_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Received At"), help_text=_("The date and time when the webhook event was received."))
    processed = models.BooleanField(default=False, verbose_name=_("Processed"), help_text=_("Indicates whether the webhook event has been processed."))

    class Meta:
        verbose_name = _("Webhook Event")
        verbose_name_plural = _("Webhook Events")

    def __str__(self):
        return f"Webhook Event: {self.event_type}"


class Refund(models.Model):
    """
    Represents a refund for a charge.
    """
    id = models.BigAutoField(primary_key=True)
    stripe_refund_id = models.TextField(unique=True, verbose_name=_("Stripe Refund ID"), help_text=_("The unique Stripe refund ID."))
    charge_id = models.BigIntegerField(verbose_name=_("Charge ID"), help_text=_("The ID of the charge associated with this refund."))
    amount_cents = models.IntegerField(verbose_name=_("Amount (cents)"), help_text=_("The amount of the refund in cents."))
    reason = models.TextField(null=True, blank=True, verbose_name=_("Reason"), help_text=_("The reason for the refund."))
    refund_data = models.JSONField(null=True, blank=True, verbose_name=_("Refund Data"), help_text=_("Full refund details from Stripe."))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("The date and time when the refund was created."))

    class Meta:
        verbose_name = _("Refund")
        verbose_name_plural = _("Refunds")

    def __str__(self):
        return f"Refund: {self.stripe_refund_id}"


class ComplianceAudit(models.Model):
    """
    Represents a compliance audit log.
    """
    id = models.BigAutoField(primary_key=True)
    action = models.TextField(verbose_name=_("Action"), help_text=_("The action performed (e.g., encryption_key_rotated)."))
    details = models.JSONField(null=True, blank=True, verbose_name=_("Details"), help_text=_("Additional details about the compliance action."))
    occurred_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Occurred At"), help_text=_("The date and time when the compliance action occurred."))

    class Meta:
        verbose_name = _("Compliance Audit")
        verbose_name_plural = _("Compliance Audits")

    def __str__(self):
        return f"Compliance Audit: {self.action}"


class DynamicPricingRule(models.Model):
    """
    Model for dynamic pricing rules.
    """
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=100, verbose_name=_("Rule Name"))
    description = models.TextField(blank=True, null=True, verbose_name=_("Description"))
    is_active = models.BooleanField(default=True, verbose_name=_("Is Active"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"))
    rule_type = models.CharField(max_length=50, verbose_name=_("Rule Type"))
    conditions = models.JSONField(default=dict, verbose_name=_("Conditions"))
    actions = models.JSONField(default=dict, verbose_name=_("Actions"))

    class Meta:
        verbose_name = _("Dynamic Pricing Rule")
        verbose_name_plural = _("Dynamic Pricing Rules")
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class FraudDetectionLog(models.Model):
    """
    Represents a fraud detection log.
    """
    id = models.BigAutoField(primary_key=True)
    charge_id = models.BigIntegerField(null=True, blank=True, verbose_name=_("Charge ID"), help_text=_("The ID of the charge associated with this fraud detection log."))
    fraud_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, verbose_name=_("Fraud Score"), help_text=_("The fraud score for the charge."))
    analysis_data = models.JSONField(null=True, blank=True, verbose_name=_("Analysis Data"), help_text=_("Additional analysis data for the fraud detection."))
    logged_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Logged At"), help_text=_("The date and time when the fraud detection log was created."))

    class Meta:
        verbose_name = _("Fraud Detection Log")
        verbose_name_plural = _("Fraud Detection Logs")

    def __str__(self):
        return f"Fraud Detection Log for Charge: {self.charge_id}"


class PaymentFederationLink(models.Model):
    """
    Represents a payment federation link.
    """
    id = models.BigAutoField(primary_key=True)
    external_service_name = models.TextField(verbose_name=_("External Service Name"), help_text=_("The name of the external service."))
    federation_details = models.JSONField(null=True, blank=True, verbose_name=_("Federation Details"), help_text=_("Additional details about the payment federation."))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"), help_text=_("The date and time when the payment federation link was last updated."))

    class Meta:
        verbose_name = _("Payment Federation Link")
        verbose_name_plural = _("Payment Federation Links")

    def __str__(self):
        return f"Payment Federation Link: {self.external_service_name}"


class TokenizedEntitlement(models.Model):
    """
    Represents a tokenized entitlement.
    """
    id = models.BigAutoField(primary_key=True)
    entitlement_token = models.TextField(unique=True, verbose_name=_("Entitlement Token"), help_text=_("A token representing a certain access right."))
    entitlement_details = models.JSONField(null=True, blank=True, verbose_name=_("Entitlement Details"), help_text=_("Additional details about the entitlement."))
    issued_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Issued At"), help_text=_("The date and time when the entitlement was issued."))

    class Meta:
        verbose_name = _("Tokenized Entitlement")
        verbose_name_plural = _("Tokenized Entitlements")

    def __str__(self):
        return f"Tokenized Entitlement: {self.entitlement_token}"


class RevenueForecast(models.Model):
    """
    Represents a revenue forecast.
    """
    id = models.BigAutoField(primary_key=True)
    forecast_period = models.TextField(verbose_name=_("Forecast Period"), help_text=_("The period for which the forecast is made (e.g., 2026-Q2)."))
    forecast_data = models.JSONField(null=True, blank=True, verbose_name=_("Forecast Data"), help_text=_("The forecast data (e.g., expected revenue, confidence interval)."))
    generated_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Generated At"), help_text=_("The date and time when the forecast was generated."))

    class Meta:
        verbose_name = _("Revenue Forecast")
        verbose_name_plural = _("Revenue Forecasts")

    def __str__(self):
        return f"Revenue Forecast for Period: {self.forecast_period}"


class PaymentInsightWizard(models.Model):
    """
    Represents a payment insight wizard configuration.
    """
    id = models.BigAutoField(primary_key=True)
    wizard_config = models.JSONField(null=True, blank=True, verbose_name=_("Wizard Configuration"), help_text=_("Configuration data for the payment insight wizard."))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"), help_text=_("The date and time when the wizard configuration was last updated."))

    class Meta:
        verbose_name = _("Payment Insight Wizard")
        verbose_name_plural = _("Payment Insight Wizards")

    def __str__(self):
        return f"Payment Insight Wizard"


class MultiCurrencyInstallment(models.Model):
    """
    Represents a multi-currency installment plan.
    """
    id = models.BigAutoField(primary_key=True)
    user_id = models.BigIntegerField(null=True, blank=True, verbose_name=_("User ID"), help_text=_("The ID of the user associated with this installment plan."))
    base_amount_cents = models.IntegerField(verbose_name=_("Base Amount (cents)"), help_text=_("The base amount of the installment plan in cents."))
    currency = models.TextField(verbose_name=_("Currency"), help_text=_("The currency of the installment plan."))
    installment_schedule = models.JSONField(null=True, blank=True, verbose_name=_("Installment Schedule"), help_text=_("The schedule of installments."))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("The date and time when the installment plan was created."))

    class Meta:
        verbose_name = _("Multi-Currency Installment")
        verbose_name_plural = _("Multi-Currency Installments")

    def __str__(self):
        return f"Multi-Currency Installment for User: {self.user_id}"


class SLADeposit(models.Model):
    """
    Represents an SLA-based refundable deposit.
    """
    id = models.BigAutoField(primary_key=True)
    deposit_amount_cents = models.IntegerField(verbose_name=_("Deposit Amount (cents)"), help_text=_("The amount of the deposit in cents."))
    conditions = models.JSONField(null=True, blank=True, verbose_name=_("Conditions"), help_text=_("The conditions for the deposit (e.g., required uptime)."))
    escrow_status = models.TextField(null=True, blank=True, verbose_name=_("Escrow Status"), help_text=_("The status of the deposit (e.g., held, released, refunded)."))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"), help_text=_("The date and time when the deposit was last updated."))

    class Meta:
        verbose_name = _("SLA Deposit")
        verbose_name_plural = _("SLA Deposits")

    def __str__(self):
        return f"SLA Deposit"


class CurrencyExchangeLog(models.Model):
    """
    Represents a currency exchange log.
    """
    id = models.BigAutoField(primary_key=True)
    transaction_ref = models.TextField(null=True, blank=True, verbose_name=_("Transaction Reference"), help_text=_("The reference for the transaction."))
    from_currency = models.TextField(verbose_name=_("From Currency"), help_text=_("The currency being exchanged from."))
    to_currency = models.TextField(verbose_name=_("To Currency"), help_text=_("The currency being exchanged to."))
    rate = models.DecimalField(max_digits=10, decimal_places=6, verbose_name=_("Exchange Rate"), help_text=_("The exchange rate used."))
    applied_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Applied At"), help_text=_("The date and time when the exchange was applied."))

    class Meta:
        verbose_name = _("Currency Exchange Log")
        verbose_name_plural = _("Currency Exchange Logs")

    def __str__(self):
        return f"Currency Exchange Log: {self.transaction_ref}"


class PaymentAggregatorRouting(models.Model):
    """
    Represents payment aggregator routing configuration.
    """
    id = models.BigAutoField(primary_key=True)
    aggregator_name = models.TextField(verbose_name=_("Aggregator Name"), help_text=_("The name of the payment aggregator."))
    performance_metrics = models.JSONField(null=True, blank=True, verbose_name=_("Performance Metrics"), help_text=_("Performance metrics for the payment aggregator."))
    last_assessed = models.DateTimeField(auto_now=True, verbose_name=_("Last Assessed"), help_text=_("The date and time when the payment aggregator was last assessed."))

    class Meta:
        verbose_name = _("Payment Aggregator Routing")
        verbose_name_plural = _("Payment Aggregator Routings")

    def __str__(self):
        return f"Payment Aggregator Routing: {self.aggregator_name}"


class SeasonalPricingRule(models.Model):
    """
    Represents a seasonal pricing rule.
    """
    id = models.BigAutoField(primary_key=True)
    trigger_conditions = models.JSONField(null=True, blank=True, verbose_name=_("Trigger Conditions"), help_text=_("The conditions that trigger the seasonal pricing rule."))
    pricing_adjustments = models.JSONField(null=True, blank=True, verbose_name=_("Pricing Adjustments"), help_text=_("The pricing adjustments for the seasonal pricing rule."))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"), help_text=_("The date and time when the seasonal pricing rule was last updated."))

    class Meta:
        verbose_name = _("Seasonal Pricing Rule")
        verbose_name_plural = _("Seasonal Pricing Rules")

    def __str__(self):
        return f"Seasonal Pricing Rule"


class PaymentDeviceConfig(models.Model):
    """
    Represents a payment device configuration.
    """
    id = models.BigAutoField(primary_key=True)
    user_id = models.BigIntegerField(null=True, blank=True, verbose_name=_("User ID"), help_text=_("The ID of the user associated with this payment device configuration."))
    device_type = models.TextField(verbose_name=_("Device Type"), help_text=_("The type of the payment device (e.g., wearable_watch)."))
    device_settings = models.JSONField(null=True, blank=True, verbose_name=_("Device Settings"), help_text=_("The settings for the payment device."))
    configured_at = models.DateTimeField(auto_now=True, verbose_name=_("Configured At"), help_text=_("The date and time when the payment device was configured."))

    class Meta:
        verbose_name = _("Payment Device Configuration")
        verbose_name_plural = _("Payment Device Configurations")

    def __str__(self):
        return f"Payment Device Configuration for User: {self.user_id}"

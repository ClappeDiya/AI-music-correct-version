import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { WebTracerProvider } from "@opentelemetry/sdk-trace-web";
import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { FetchInstrumentation } from "@opentelemetry/instrumentation-fetch";
import { ZoneContextManager } from "@opentelemetry/context-zone";
import { Span, SpanStatusCode } from "@opentelemetry/api";

// Billing metrics
interface BillingMetrics {
  successful_payments: number;
  failed_payments: number;
  total_revenue_cents: number;
  active_subscriptions: number;
  payment_success_rate: number;
  average_transaction_cents: number;
}

// Initialize OpenTelemetry
const provider = new WebTracerProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: "billing-system",
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV,
  }),
});

const exporter = new OTLPTraceExporter({
  url: process.env.NEXT_PUBLIC_OTEL_EXPORTER_URL,
});

provider.addSpanProcessor(new BatchSpanProcessor(exporter));
provider.register({
  contextManager: new ZoneContextManager(),
});

registerInstrumentations({
  instrumentations: [
    new FetchInstrumentation({
      ignoreUrls: [/localhost/],
      clearTimingResources: true,
    }),
  ],
});

const tracer = provider.getTracer("billing-tracer");

// Monitoring functions
export function trackPaymentAttempt(
  success: boolean,
  amount: number,
  error?: Error,
) {
  const span = tracer.startSpan("payment_attempt");
  try {
    span.setAttribute("payment.success", success);
    span.setAttribute("payment.amount_cents", amount);

    if (error) {
      span.setAttribute("payment.error", error.message);
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error.message,
      });
    }

    // Send to monitoring service
    fetch("/api/monitoring/metrics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        metric: "payment_attempt",
        success,
        amount,
        error: error?.message,
        timestamp: new Date().toISOString(),
      }),
    });
  } finally {
    span.end();
  }
}

export function trackSubscriptionChange(
  action: "create" | "update" | "cancel",
  planId: string,
) {
  const span = tracer.startSpan("subscription_change");
  try {
    span.setAttribute("subscription.action", action);
    span.setAttribute("subscription.plan_id", planId);

    fetch("/api/monitoring/metrics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        metric: "subscription_change",
        action,
        plan_id: planId,
        timestamp: new Date().toISOString(),
      }),
    });
  } finally {
    span.end();
  }
}

export function trackWebhookProcessing(
  eventType: string,
  success: boolean,
  duration: number,
) {
  const span = tracer.startSpan("webhook_processing");
  try {
    span.setAttribute("webhook.type", eventType);
    span.setAttribute("webhook.success", success);
    span.setAttribute("webhook.duration_ms", duration);

    fetch("/api/monitoring/metrics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        metric: "webhook_processing",
        event_type: eventType,
        success,
        duration,
        timestamp: new Date().toISOString(),
      }),
    });
  } finally {
    span.end();
  }
}

export async function getBillingMetrics(): Promise<BillingMetrics> {
  const span = tracer.startSpan("get_billing_metrics");
  try {
    const response = await fetch("/api/billing/analytics");
    const data = await response.json();

    const metrics: BillingMetrics = {
      successful_payments: data.successful_payments,
      failed_payments: data.failed_payments,
      total_revenue_cents: data.total_revenue_cents,
      active_subscriptions: data.active_subscriptions,
      payment_success_rate:
        data.successful_payments /
        (data.successful_payments + data.failed_payments),
      average_transaction_cents:
        data.total_revenue_cents / data.successful_payments,
    };

    // Record metrics
    Object.entries(metrics).forEach(([key, value]) => {
      span.setAttribute(`billing.${key}`, value);
    });

    return metrics;
  } catch (error) {
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: error instanceof Error ? error.message : "Unknown error",
    });
    throw error;
  } finally {
    span.end();
  }
}

// Alert thresholds
export const ALERT_THRESHOLDS = {
  PAYMENT_SUCCESS_RATE: 0.95, // Alert if success rate drops below 95%
  FAILED_PAYMENTS_THRESHOLD: 5, // Alert if more than 5 failures in 1 hour
  WEBHOOK_LATENCY_MS: 5000, // Alert if webhook processing takes more than 5 seconds
  REVENUE_DROP_PERCENT: 20, // Alert if revenue drops by 20% compared to previous period
};

// Monitor metrics and trigger alerts
export async function monitorMetrics() {
  const metrics = await getBillingMetrics();

  // Check payment success rate
  if (metrics.payment_success_rate < ALERT_THRESHOLDS.PAYMENT_SUCCESS_RATE) {
    triggerAlert("payment_success_rate_low", {
      current_rate: metrics.payment_success_rate,
      threshold: ALERT_THRESHOLDS.PAYMENT_SUCCESS_RATE,
    });
  }

  // Check average transaction amount for anomalies
  // Add more monitoring checks as needed
}

async function triggerAlert(type: string, data: any) {
  const span = tracer.startSpan("trigger_alert");
  try {
    span.setAttribute("alert.type", type);
    span.setAttribute("alert.data", JSON.stringify(data));

    await fetch("/api/monitoring/alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        data,
        timestamp: new Date().toISOString(),
      }),
    });
  } finally {
    span.end();
  }
}

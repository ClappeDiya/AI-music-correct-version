import { NextResponse } from "next/server";
import Stripe from "stripe";
import { type NextRequest } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature") ?? "";

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return new NextResponse("Invalid signature", { status: 400 });
    }

    // Store webhook event in database
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/billing-management/webhook-events/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Use API key for server-to-server communication
          Authorization: `Bearer ${process.env.API_KEY}`,
        },
        body: JSON.stringify({
          event_type: event.type,
          event_payload: event.data.object,
          tenant_id: await getTenantId(event), // Extract tenant ID from event
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to store webhook: ${response.status}`);
    }

    // Process different event types
    switch (event.type) {
      case "customer.subscription.updated":
        await handleSubscriptionUpdate(
          event.data.object as Stripe.Subscription,
        );
        break;
      case "invoice.payment_succeeded":
        await handlePaymentSuccess(event.data.object as Stripe.Invoice);
        break;
      case "invoice.payment_failed":
        await handlePaymentFailure(event.data.object as Stripe.Invoice);
        break;
      // Add more event handlers as needed
    }

    return new NextResponse(JSON.stringify({ received: true }));
  } catch (error) {
    console.error("Error processing webhook:", error);
    // Store failed webhook for retry
    await storeFailedWebhook(error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

// Helper function to extract tenant ID from Stripe event
async function getTenantId(event: Stripe.Event): Promise<string> {
  const object = event.data.object as any;
  // Try to get tenant ID from metadata
  if (object.metadata?.tenant_id) {
    return object.metadata.tenant_id;
  }
  // Fallback to customer metadata
  if (object.customer) {
    try {
      const customer = await stripe.customers.retrieve(
        typeof object.customer === "string"
          ? object.customer
          : object.customer.id,
      );
      if ("metadata" in customer && customer.metadata?.tenant_id) {
        return customer.metadata.tenant_id;
      }
    } catch (error) {
      console.error("Error fetching customer:", error);
    }
  }
  throw new Error("Could not determine tenant ID from event");
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/billing-management/subscriptions/${subscription.id}/`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.API_KEY}`,
        },
        body: JSON.stringify({
          subscription_data: subscription,
          status: subscription.status,
          current_period_start: new Date(
            subscription.current_period_start * 1000,
          ),
          current_period_end: new Date(subscription.current_period_end * 1000),
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to update subscription: ${response.status}`);
    }
  } catch (error) {
    console.error("Error handling subscription update:", error);
    throw error; // Let the main handler catch this
  }
}

async function handlePaymentSuccess(invoice: Stripe.Invoice) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/billing-management/invoices/${invoice.id}/`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.API_KEY}`,
        },
        body: JSON.stringify({
          status: "paid",
          invoice_data: invoice,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to update invoice: ${response.status}`);
    }
  } catch (error) {
    console.error("Error handling payment success:", error);
    throw error;
  }
}

async function handlePaymentFailure(invoice: Stripe.Invoice) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/billing-management/invoices/${invoice.id}/`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.API_KEY}`,
        },
        body: JSON.stringify({
          status: "failed",
          invoice_data: invoice,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to update invoice: ${response.status}`);
    }
  } catch (error) {
    console.error("Error handling payment failure:", error);
    throw error;
  }
}

async function storeFailedWebhook(error: any) {
  try {
    await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/billing-management/webhook-events/failed/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.API_KEY}`,
        },
        body: JSON.stringify({
          error_message: error.message,
          error_stack: error.stack,
          timestamp: new Date().toISOString(),
        }),
      },
    );
  } catch (storeError) {
    console.error("Failed to store failed webhook:", storeError);
  }
}

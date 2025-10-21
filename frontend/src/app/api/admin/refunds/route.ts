import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Verify admin role (you might want to add proper role checking)
    // if (!session.user.isAdmin) {
    //   return new NextResponse("Forbidden", { status: 403 })
    // }

    const body = await request.json();
    const { charge_id, amount_cents, reason } = body;

    // Create refund in Stripe
    const stripeRefund = await stripe.refunds.create({
      charge: charge_id,
      amount: amount_cents,
      reason: reason as Stripe.RefundCreateParams.Reason,
    });

    // Store refund in our database
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/billing-management/refunds/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          stripe_refund_id: stripeRefund.id,
          charge_id,
          amount_cents,
          reason,
          refund_data: stripeRefund,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to store refund: ${response.status}`);
    }

    // Get the charge to update its status
    const charge = await stripe.charges.retrieve(charge_id);

    // Update charge status in our database
    await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/billing-management/charges/${charge_id}/`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          charge_data: charge,
        }),
      },
    );

    // If this was a subscription charge, we might need to update subscription status
    if (charge.invoice) {
      const invoice = await stripe.invoices.retrieve(charge.invoice as string);
      if (invoice.subscription) {
        // Trigger webhook to update subscription status
        await fetch("/api/webhooks/stripe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Stripe-Signature": "internal",
          },
          body: JSON.stringify({
            type: "customer.subscription.updated",
            data: {
              object: await stripe.subscriptions.retrieve(
                invoice.subscription as string,
              ),
            },
          }),
        });
      }
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error processing refund:", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Internal server error",
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || "10";

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/billing-management/refunds/?limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch refunds: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching refunds:", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Internal server error",
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import Stripe from "stripe";

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

interface FormattedPaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}

export async function GET(req: NextRequest) {
  try {
    // Get the user's customer ID from your auth system
    const customerId = req.headers.get("x-customer-id");

    if (!customerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch payment methods from Stripe
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: "card",
    });

    // Get the customer to check their default payment method
    const customer = await stripe.customers.retrieve(customerId);
    const defaultPaymentMethodId =
      typeof customer === "object" && !("deleted" in customer)
        ? customer.invoice_settings?.default_payment_method
        : null;

    // Format the response
    const formattedPaymentMethods: FormattedPaymentMethod[] =
      paymentMethods.data.map((method) => ({
        id: method.id,
        brand: method.card?.brand || "unknown",
        last4: method.card?.last4 || "****",
        expiryMonth: method.card?.exp_month || 0,
        expiryYear: method.card?.exp_year || 0,
        isDefault: method.id === defaultPaymentMethodId,
      }));

    return NextResponse.json(formattedPaymentMethods);
  } catch (error: any) {
    console.error("Error fetching payment methods:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment methods" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { payment_method_id } = await req.json();
    const customerId = req.headers.get("x-customer-id");

    if (!customerId || !payment_method_id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Attach the payment method to the customer
    await stripe.paymentMethods.attach(payment_method_id, {
      customer: customerId,
    });

    // Set as default payment method if it's the customer's first one
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: "card",
    });

    if (paymentMethods.data.length === 1) {
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: payment_method_id,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error adding payment method:", error);
    return NextResponse.json(
      { error: error.message || "Failed to add payment method" },
      { status: 500 },
    );
  }
}

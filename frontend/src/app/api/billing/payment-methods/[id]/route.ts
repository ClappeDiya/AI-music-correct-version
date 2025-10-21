import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const paymentMethodId = params.id;
    const customerId = req.headers.get("x-customer-id");

    if (!customerId || !paymentMethodId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Check if this is the default payment method
    const customer = await stripe.customers.retrieve(customerId);
    if (
      typeof customer === "object" &&
      !("deleted" in customer) &&
      customer.invoice_settings?.default_payment_method === paymentMethodId
    ) {
      return NextResponse.json(
        { error: "Cannot delete default payment method" },
        { status: 400 },
      );
    }

    // Verify the payment method belongs to the customer
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
    if (paymentMethod.customer !== customerId) {
      return NextResponse.json(
        { error: "Payment method does not belong to customer" },
        { status: 403 },
      );
    }

    // Detach the payment method
    await stripe.paymentMethods.detach(paymentMethodId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting payment method:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete payment method" },
      { status: 500 },
    );
  }
}

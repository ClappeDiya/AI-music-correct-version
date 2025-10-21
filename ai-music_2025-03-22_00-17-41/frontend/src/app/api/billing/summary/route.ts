import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sanitizeError } from "@/lib/security";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Fetch current subscription and billing info
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/billing-management/summary/`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    // Mask sensitive data before returning
    if (data.default_payment_method) {
      data.default_payment_method = {
        ...data.default_payment_method,
        number: `•••• ${data.default_payment_method.last4}`,
        cvc: "•••",
      };
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching billing summary:", sanitizeError(error));
    return new NextResponse("Internal server error", { status: 500 });
  }
}

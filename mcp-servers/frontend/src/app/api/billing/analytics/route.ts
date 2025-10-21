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

    // Fetch analytics data
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/billing-management/analytics/`,
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

    // Calculate additional metrics
    const metrics = {
      ...data,
      payment_success_rate: calculateSuccessRate(data),
      active_subscriptions:
        data.subscriptions?.filter((sub: any) => sub.status === "active")
          .length || 0,
    };

    // Track analytics view
    await fetch("/api/admin/audit-logs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        action: "billing_analytics_viewed",
        user_id: session.user.id,
        details: {
          metrics: {
            total_spent_cents: metrics.total_spent_cents,
            payment_success_rate: metrics.payment_success_rate,
            active_subscriptions: metrics.active_subscriptions,
          },
        },
      }),
    });

    return NextResponse.json(metrics);
  } catch (error) {
    console.error("Error fetching billing analytics:", sanitizeError(error));
    return new NextResponse("Internal server error", { status: 500 });
  }
}

function calculateSuccessRate(data: any): number {
  if (!data.payments || data.payments.length === 0) {
    return 1; // Default to 100% if no payments
  }

  const successful = data.payments.filter(
    (payment: any) => payment.status === "succeeded",
  ).length;

  return successful / data.payments.length;
}

// Analytics types for type safety
interface Payment {
  id: string;
  status: "succeeded" | "failed" | "pending";
  amount_cents: number;
  created_at: string;
}

interface Subscription {
  id: string;
  status: "active" | "canceled" | "past_due";
  plan_name: string;
  current_period_end: string;
}

interface AnalyticsData {
  total_spent_cents: number;
  payments: Payment[];
  subscriptions: Subscription[];
  payment_success_rate: number;
  active_subscriptions: number;
}

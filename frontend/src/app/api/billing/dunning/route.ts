import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sanitizeError } from "@/lib/security";
import { logAuditEvent } from "@/lib/security";
import {
  DunningStatus,
  initiateDunning,
  processDunningRetry,
} from "@/lib/dunning";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const planId = searchParams.get("plan_id");

    if (!planId) {
      return new NextResponse("Missing plan_id parameter", { status: 400 });
    }

    // Fetch dunning status from database
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/billing-management/dunning/status/${planId}`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch dunning status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching dunning status:", sanitizeError(error));
    return new NextResponse("Internal server error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { plan_id, payment_intent_id, failure_reason } = body;

    // Log dunning initiation attempt
    await logAuditEvent("dunning_initiation_started", session.user.id, {
      plan_id,
      payment_intent_id,
    });

    // Initialize dunning process
    const dunningStatus = await initiateDunning(
      plan_id,
      session.user.id,
      payment_intent_id,
      failure_reason,
    );

    return NextResponse.json(dunningStatus);
  } catch (error) {
    console.error("Error initiating dunning:", sanitizeError(error));
    return new NextResponse("Internal server error", { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { plan_id } = body;

    // Fetch current dunning status
    const statusResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/billing-management/dunning/status/${plan_id}`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      },
    );

    if (!statusResponse.ok) {
      throw new Error(
        `Failed to fetch dunning status: ${statusResponse.status}`,
      );
    }

    const currentStatus: DunningStatus = await statusResponse.json();

    // Log retry attempt
    await logAuditEvent("dunning_retry_started", session.user.id, {
      plan_id,
      attempt_number: currentStatus.attempts.length + 1,
    });

    // Process dunning retry
    const updatedStatus = await processDunningRetry(currentStatus);

    return NextResponse.json(updatedStatus);
  } catch (error) {
    console.error("Error processing dunning retry:", sanitizeError(error));
    return new NextResponse("Internal server error", { status: 500 });
  }
}

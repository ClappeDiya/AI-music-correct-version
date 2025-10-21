import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sanitizeError } from "@/lib/security";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { eventType, itemId } = await request.json();

    // Validate event type
    const validEvents = ["play", "like", "follow"];
    if (!validEvents.includes(eventType)) {
      return new NextResponse("Invalid event type", { status: 400 });
    }

    // Send event to Django backend
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/data-analytics/events/`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event_type: eventType,
          item_id: itemId,
          user_id: session.user.id,
          timestamp: new Date().toISOString(),
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error tracking event:", sanitizeError(error));
    return new NextResponse("Internal server error", { status: 500 });
  }
}

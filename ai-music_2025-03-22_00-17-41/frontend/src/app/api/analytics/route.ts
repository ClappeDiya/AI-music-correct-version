import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fetchBackend } from "@/lib/api";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch analytics data with RLS enforcement
    const response = await fetchBackend(`/api/analytics/${session.user.id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-User-ID": session.user.id,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch analytics data");
    }

    const data = await response.json();

    // Update personalization models in real-time
    await fetchBackend(`/api/analytics/${session.user.id}/update-models`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-User-ID": session.user.id,
      },
      body: JSON.stringify({
        listening_habits: data.listening_habits,
        genre_preferences: data.genre_preferences,
        creative_outputs: data.creative_outputs,
      }),
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Analytics API error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch analytics data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

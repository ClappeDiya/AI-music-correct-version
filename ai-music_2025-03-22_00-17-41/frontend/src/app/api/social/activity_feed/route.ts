import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch(
      `${process.env.DJANGO_API_URL}/api/social/activity-feed/`,
      {
        headers: {
          Authorization: `Bearer ${request.headers.get("Authorization")}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch activity feed");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch activity feed" },
      { status: 500 },
    );
  }
}

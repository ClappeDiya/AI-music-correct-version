import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: { notificationId: string } },
) {
  try {
    const response = await fetch(
      `${process.env.DJANGO_API_URL}/api/notifications/${params.notificationId}/read/`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${request.headers.get("Authorization")}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to mark notification as read");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to mark notification as read" },
      { status: 500 },
    );
  }
}

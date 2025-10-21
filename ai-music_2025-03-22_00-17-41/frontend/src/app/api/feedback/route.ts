import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const response = await fetch(
      `${process.env.DJANGO_API_URL}/api/feedback/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${request.headers.get("Authorization")}`,
        },
        body: JSON.stringify(body),
      },
    );

    if (!response.ok) throw new Error("Failed to submit feedback");
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to submit feedback" },
      { status: 500 },
    );
  }
}

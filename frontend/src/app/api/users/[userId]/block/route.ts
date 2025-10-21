import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: { userId: string } },
) {
  try {
    const body = await request.json();
    const response = await fetch(
      `${process.env.DJANGO_API_URL}/api/users/${params.userId}/block/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${request.headers.get("Authorization")}`,
        },
        body: JSON.stringify(body),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to block user");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to block user" },
      { status: 500 },
    );
  }
}

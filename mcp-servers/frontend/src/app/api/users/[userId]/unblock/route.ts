import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: { userId: string } },
) {
  try {
    const response = await fetch(
      `${process.env.DJANGO_API_URL}/api/users/${params.userId}/unblock/`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${request.headers.get("Authorization")}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to unblock user");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to unblock user" },
      { status: 500 },
    );
  }
}

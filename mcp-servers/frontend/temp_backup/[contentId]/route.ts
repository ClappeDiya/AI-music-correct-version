import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { contentId: string } },
) {
  try {
    const response = await fetch(
      `${process.env.DJANGO_API_URL}/api/comments/${params.contentId}/`,
      {
        headers: {
          Authorization: `Bearer ${request.headers.get("Authorization")}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch comments");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { contentId: string } },
) {
  try {
    const body = await request.json();
    const response = await fetch(
      `${process.env.DJANGO_API_URL}/api/comments/${params.contentId}/`,
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
      throw new Error("Failed to create comment");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 },
    );
  }
}

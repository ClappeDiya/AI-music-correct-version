import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { groupId: string } },
) {
  try {
    const response = await fetch(
      `${process.env.DJANGO_API_URL}/api/groups/${params.groupId}/posts/`,
      {
        headers: {
          Authorization: `Bearer ${request.headers.get("Authorization")}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch posts");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { groupId: string } },
) {
  try {
    const body = await request.json();
    const response = await fetch(
      `${process.env.DJANGO_API_URL}/api/groups/${params.groupId}/posts/`,
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
      throw new Error("Failed to create post");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 },
    );
  }
}

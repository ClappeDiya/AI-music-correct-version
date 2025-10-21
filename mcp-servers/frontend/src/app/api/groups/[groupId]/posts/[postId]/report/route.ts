import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: { groupId: string; postId: string } },
) {
  try {
    const response = await fetch(
      `${process.env.DJANGO_API_URL}/api/groups/${params.groupId}/posts/${params.postId}/report/`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${request.headers.get("Authorization")}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to report post");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to report post" },
      { status: 500 },
    );
  }
}

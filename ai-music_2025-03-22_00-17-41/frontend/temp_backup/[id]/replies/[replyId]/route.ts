import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: { id: string; replyId: string } },
) {
  try {
    const response = await fetch(
      `${process.env.DJANGO_API_URL}/api/comments/${params.id}/${params.replyId}/reply/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.API_KEY}`,
        },
        body: request.body,
      },
    );
    return response;
  } catch (error) {
    console.error("Error posting reply:", error);
    return NextResponse.json(
      { error: "Failed to post reply" },
      { status: 500 },
    );
  }
}

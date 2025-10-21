import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const response = await fetch(
      `${process.env.DJANGO_API_URL}/api/comments/${params.id}/report/`,
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
    console.error("Error reporting comment:", error);
    return NextResponse.json(
      { error: "Failed to report comment" },
      { status: 500 },
    );
  }
}

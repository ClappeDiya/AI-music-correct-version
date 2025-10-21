import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: { requestId: string; action: "accept" | "reject" } },
) {
  try {
    const response = await fetch(
      `${process.env.DJANGO_API_URL}/api/follow-requests/${params.requestId}/${params.action}/`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${request.headers.get("Authorization")}`,
        },
      },
    );

    if (!response.ok)
      throw new Error(`Failed to ${params.action} follow request`);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to ${params.action} follow request` },
      { status: 500 },
    );
  }
}

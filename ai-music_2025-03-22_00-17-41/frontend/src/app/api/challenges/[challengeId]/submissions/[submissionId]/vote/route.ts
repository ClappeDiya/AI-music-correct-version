import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: { challengeId: string; submissionId: string } },
) {
  try {
    const response = await fetch(
      `${process.env.DJANGO_API_URL}/api/challenges/${params.challengeId}/submissions/${params.submissionId}/vote/`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${request.headers.get("Authorization")}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to vote for submission");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to vote for submission" },
      { status: 500 },
    );
  }
}

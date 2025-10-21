import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { challengeId: string } },
) {
  try {
    const response = await fetch(
      `${process.env.DJANGO_API_URL}/api/challenges/${params.challengeId}/submissions/`,
      {
        headers: {
          Authorization: `Bearer ${request.headers.get("Authorization")}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch submissions");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch submissions" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { challengeId: string } },
) {
  try {
    const formData = await request.formData();

    const response = await fetch(
      `${process.env.DJANGO_API_URL}/api/challenges/${params.challengeId}/submissions/`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${request.headers.get("Authorization")}`,
        },
        body: formData,
      },
    );

    if (!response.ok) {
      throw new Error("Failed to create submission");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create submission" },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch(
      `${process.env.DJANGO_API_URL}/api/challenges/`,
      {
        headers: {
          Authorization: `Bearer ${request.headers.get("Authorization")}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch challenges");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch challenges" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const response = await fetch(
      `${process.env.DJANGO_API_URL}/api/challenges/`,
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
      throw new Error("Failed to create challenge");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create challenge" },
      { status: 500 },
    );
  }
}

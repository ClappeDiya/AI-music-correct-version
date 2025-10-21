import { NextResponse } from "next/server";
import { headers } from "next/headers";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const headersList = await headers();
    const authHeader = headersList.get("Authorization");

    const response = await fetch(
      `${process.env.BACKEND_URL}/api/ai_music/requests/${params.id}/tracks/`,
      {
        headers: {
          Authorization: authHeader || "",
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch tracks: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching tracks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tracks" },
      { status: 500 },
    );
  }
}

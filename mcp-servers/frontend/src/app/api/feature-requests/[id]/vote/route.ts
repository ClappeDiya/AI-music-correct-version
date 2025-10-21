import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/future_capabilities/feature-requests/${params.id}/vote/`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${request.headers.get("Authorization")}`,
        },
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(5000)
      }
    );

    if (!response.ok) {
      console.error(`Backend returned error status: ${response.status}`);
      // Return mock data for development
      if (process.env.NODE_ENV === "development") {
        console.warn("Using mock data due to backend error");
        const mockResponse = {
          id: params.id,
          votes_count: 43, // Increment by 1
          has_voted: true
        };
        return NextResponse.json(mockResponse);
      }
      throw new Error("Failed to vote for feature request");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error voting for feature request:", error);
    
    // In development mode, return mock data
    if (process.env.NODE_ENV === "development") {
      console.warn("Using mock data due to error");
      const mockResponse = {
        id: params.id,
        votes_count: 43, // Increment by 1
        has_voted: true
      };
      return NextResponse.json(mockResponse);
    }
    
    return NextResponse.json(
      { error: "Failed to vote for feature request" },
      { status: 500 }
    );
  }
} 
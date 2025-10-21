import { NextResponse } from "next/server";

// Sample mock data for when backend is unavailable
const mockTopVotedRequests = [
  {
    id: "2",
    title: "MIDI Controller Integration",
    description: "Allow connecting external MIDI controllers for more intuitive input.",
    user: "user456",
    submitted_by_name: "Jordan Smith",
    category: "Input",
    status: "planned",
    priority: "high",
    created_at: "2023-06-10T08:15:00Z",
    updated_at: "2023-06-12T09:30:00Z",
    votes_count: 87,
    has_voted: true
  },
  {
    id: "3",
    title: "Vocal Isolation Feature",
    description: "Add ability to isolate vocals from mixed tracks for remixing purposes.",
    user: "user789",
    submitted_by_name: "Taylor Kim",
    category: "Audio Processing",
    status: "in_progress",
    priority: "high",
    created_at: "2023-05-20T14:20:00Z",
    updated_at: "2023-05-22T11:45:00Z",
    votes_count: 65,
    has_voted: false
  }
];

export async function GET(request: Request) {
  try {
    // Check if NEXT_PUBLIC_BACKEND_URL is defined
    if (!process.env.NEXT_PUBLIC_BACKEND_URL) {
      console.warn("NEXT_PUBLIC_BACKEND_URL is not defined, using mock data for top voted requests");
      return NextResponse.json(mockTopVotedRequests);
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/future_capabilities/feature-requests/top_voted/`,
      {
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
        return NextResponse.json(mockTopVotedRequests);
      }
      throw new Error("Failed to fetch top voted feature requests");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching top voted feature requests:", error);
    
    // In development mode, return mock data
    if (process.env.NODE_ENV === "development") {
      console.warn("Using mock data due to error");
      return NextResponse.json(mockTopVotedRequests);
    }
    
    return NextResponse.json(
      { error: "Failed to fetch top voted feature requests" },
      { status: 500 }
    );
  }
} 
import { NextResponse } from "next/server";

// Sample mock data for when backend is unavailable
const mockMyRequests = [
  {
    id: "4",
    title: "Collaborative Playlist Editing",
    description: "Allow multiple users to edit playlists in real-time.",
    user: "current-user",
    submitted_by_name: "Current User",
    category: "Collaboration",
    status: "pending",
    priority: "medium",
    created_at: "2023-06-05T09:45:00Z",
    updated_at: "2023-06-05T09:45:00Z",
    votes_count: 12,
    has_voted: true
  },
  {
    id: "5",
    title: "Advanced Loop Editing",
    description: "Add more precise controls for creating and adjusting loops.",
    user: "current-user",
    submitted_by_name: "Current User",
    category: "Editor",
    status: "pending",
    priority: "low",
    created_at: "2023-05-28T13:20:00Z",
    updated_at: "2023-05-28T13:20:00Z",
    votes_count: 5,
    has_voted: true
  }
];

export async function GET(request: Request) {
  try {
    // Check if NEXT_PUBLIC_BACKEND_URL is defined
    if (!process.env.NEXT_PUBLIC_BACKEND_URL) {
      console.warn("NEXT_PUBLIC_BACKEND_URL is not defined, using mock data for my requests");
      return NextResponse.json(mockMyRequests);
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/future_capabilities/feature-requests/my_requests/`,
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
        return NextResponse.json(mockMyRequests);
      }
      throw new Error("Failed to fetch your feature requests");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching my feature requests:", error);
    
    // In development mode, return mock data
    if (process.env.NODE_ENV === "development") {
      console.warn("Using mock data due to error");
      return NextResponse.json(mockMyRequests);
    }
    
    return NextResponse.json(
      { error: "Failed to fetch your feature requests" },
      { status: 500 }
    );
  }
} 
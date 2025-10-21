import { NextResponse } from "next/server";

// Sample mock data for when backend is unavailable
const mockFeatureRequests = [
  {
    id: "1",
    title: "Dark Mode for Music Editor",
    description: "Add a dark mode option for the music editor to reduce eye strain during night sessions.",
    user: "user123",
    submitted_by_name: "Alex Chen",
    category: "UI",
    status: "pending",
    priority: "medium",
    created_at: "2023-06-15T10:30:00Z",
    updated_at: "2023-06-15T10:30:00Z",
    votes_count: 42,
    has_voted: false
  },
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
  }
];

export async function GET(request: Request) {
  try {
    // Check if NEXT_PUBLIC_BACKEND_URL is defined
    if (!process.env.NEXT_PUBLIC_BACKEND_URL) {
      console.warn("NEXT_PUBLIC_BACKEND_URL is not defined, using mock data");
      return NextResponse.json(mockFeatureRequests);
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/future_capabilities/feature-requests/`,
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
        return NextResponse.json(mockFeatureRequests);
      }
      throw new Error("Failed to fetch feature requests");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching feature requests:", error);
    
    // In development mode, return mock data
    if (process.env.NODE_ENV === "development") {
      console.warn("Using mock data due to error");
      return NextResponse.json(mockFeatureRequests);
    }
    
    return NextResponse.json(
      { error: "Failed to fetch feature requests" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Check if backend URL is available
    if (!process.env.NEXT_PUBLIC_BACKEND_URL) {
      console.warn("NEXT_PUBLIC_BACKEND_URL is not defined, simulating successful creation");
      const body = await request.json();
      const mockResponse = {
        id: Math.random().toString(36).substring(2, 15),
        ...body,
        user: "current-user",
        submitted_by_name: "Current User",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        votes_count: 1,
        has_voted: true
      };
      return NextResponse.json(mockResponse);
    }
    
    const body = await request.json();
    
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/future_capabilities/feature-requests/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${request.headers.get("Authorization")}`,
        },
        body: JSON.stringify(body),
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(5000)
      }
    );

    if (!response.ok) {
      console.error(`Backend returned error status on POST: ${response.status}`);
      if (process.env.NODE_ENV === "development") {
        // Return mock response in development
        const mockResponse = {
          id: Math.random().toString(36).substring(2, 15),
          ...body,
          user: "current-user",
          submitted_by_name: "Current User",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          votes_count: 1,
          has_voted: true
        };
        return NextResponse.json(mockResponse);
      }
      throw new Error("Failed to create feature request");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating feature request:", error);
    
    // In development, simulate successful creation with mock data
    if (process.env.NODE_ENV === "development") {
      try {
        const body = await request.json();
        const mockResponse = {
          id: Math.random().toString(36).substring(2, 15),
          ...body,
          user: "current-user",
          submitted_by_name: "Current User",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          votes_count: 1,
          has_voted: true
        };
        return NextResponse.json(mockResponse);
      } catch (e) {
        console.error("Error creating mock response:", e);
      }
    }
    
    return NextResponse.json(
      { error: "Failed to create feature request" },
      { status: 500 }
    );
  }
} 
import { NextResponse } from "next/server";
import { RecommendationHistory } from "@/types/recommendation";

export async function GET() {
  // TODO: Connect to Django backend API
  // This is mock data for now
  const history: RecommendationHistory[] = [
    {
      user: {
        id: "1",
        username: "DJ_Prodigy",
        avatarUrl: "/avatars/dj-prodigy.jpg",
        genres: ["EDM", "House", "Techno"],
      },
      action: "follow",
      timestamp: "2025-01-18T08:30:00Z",
    },
    {
      user: {
        id: "2",
        username: "BeatMaster",
        avatarUrl: "/avatars/beatmaster.jpg",
        genres: ["Hip Hop", "R&B"],
      },
      action: "like",
      timestamp: "2025-01-17T14:45:00Z",
    },
  ];

  return NextResponse.json(history);
}

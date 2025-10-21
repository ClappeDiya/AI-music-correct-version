import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { api } from "@/lib/db";

export const revalidate = 3600; // Revalidate cache every hour

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get recommendations from Django backend
    const recommendations = await api.get<
      Array<{
        user_id: string;
        name: string;
        avatar_url: string;
        score: number;
      }>
    >(`/api/recommendations/suggestions?user_id=${session.user.id}`);

    return NextResponse.json(recommendations);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch recommendations" },
      { status: 500 },
    );
  }
}

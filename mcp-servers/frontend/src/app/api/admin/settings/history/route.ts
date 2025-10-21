import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const history = await prisma.profileHistory.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    const formattedHistory = history.map((entry) => ({
      id: entry.id,
      userId: entry.user.id,
      username: entry.user.username,
      version: entry.version,
      changedAt: entry.created_at,
      settings: entry.settings_snapshot,
      isEphemeral: entry.is_ephemeral,
      fusionId: entry.fusion_id,
    }));

    return NextResponse.json(formattedHistory);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 },
    );
  }
}

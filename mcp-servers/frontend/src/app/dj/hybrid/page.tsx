import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata = {
  title: "Hybrid DJ Experience | AI Music",
  description: "Blend human expertise with AI assistance for the perfect mix",
};

export default async function HybridDJPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login?callbackUrl=/dj/hybrid");
  }

  // Create a new DJ session or get the latest active one
  const activeSession = await db.aiDjSession.findFirst({
    where: {
      userId: session.user.id,
      status: "active",
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (activeSession) {
    redirect(`/dj/hybrid/${activeSession.id}`);
  }

  // Create new session if none exists
  const newSession = await db.aiDjSession.create({
    data: {
      userId: session.user.id,
      status: "active",
      settings: {
        mode: "hybrid",
      },
    },
  });

  redirect(`/dj/hybrid/${newSession.id}`);
}

"use server";

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { UserTheme } from "@prisma/client";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userTheme = await db.userTheme.findUnique({
    where: { userId: session.user.id },
  });

  return NextResponse.json({
    theme: userTheme?.theme || "system",
  });
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { theme } = await request.json();

  if (!["light", "dark", "high-contrast", "system"].includes(theme)) {
    return NextResponse.json({ error: "Invalid theme" }, { status: 400 });
  }

  await db.userTheme.upsert({
    where: { userId: session.user.id },
    update: { theme },
    create: {
      userId: session.user.id,
      theme,
    },
  });

  return NextResponse.json({ success: true });
}

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const overlays = await db.behaviorTriggeredOverlay.findMany();
    return NextResponse.json(overlays);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch overlays" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId, trigger, overlayConfig } = await request.json();

    const newOverlay = await db.behaviorTriggeredOverlay.create({
      data: {
        userId,
        trigger,
        overlayConfig,
      },
    });

    return NextResponse.json(newOverlay);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create overlay" },
      { status: 500 },
    );
  }
}

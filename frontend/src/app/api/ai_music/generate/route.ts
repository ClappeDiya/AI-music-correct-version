import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import type { GenerationRequest } from '@/types/ai_music";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { prompt, style, mood, duration, complexity } = body;

    // Create the request object
    const request: Partial<GenerationRequest> = {
      userId: session.user.id,
      prompt,
      style,
      mood,
      duration,
      format: "mp3",
      status: "pending",
    };

    // Send request to Django backend
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/ai_music/generate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify(request),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to generate music");
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      data: {
        request: data.request,
      },
    });
  } catch (error) {
    console.error("[AI_MUSIC_GENERATE]", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "GENERATION_FAILED",
          message: error instanceof Error ? error.message : "Failed to generate music",
        },
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import type { GenerationResult } from '@/types/ai_music";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = params;

    // Fetch status from Django backend
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/ai_music/requests/${id}/status`,
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch generation status");
    }

    const data = await response.json();

    // Transform response to match frontend types
    const result: GenerationResult = {
      success: true,
      request: {
        id: data.request.id,
        userId: data.request.user.id,
        providerId: data.request.provider.id,
        prompt: data.request.prompt_text,
        style: data.request.parameters?.style,
        mood: data.request.parameters?.mood,
        instruments: data.request.parameters?.instruments,
        duration: data.request.parameters?.duration,
        format: data.request.parameters?.format || "mp3",
        status: data.request.status,
        createdAt: data.request.created_at,
        updatedAt: data.request.updated_at,
        completedAt: data.request.completed_at,
        error: data.request.error,
      },
    };

    // Add track data if available
    if (data.track) {
      result.track = {
        id: data.track.id,
        requestId: data.track.request,
        url: data.track.audio_file_url,
        duration: data.track.duration,
        format: data.track.format,
        waveform: data.track.waveform_data,
        metadata: {
          tempo: data.track.notation_data?.tempo,
          key: data.track.notation_data?.key,
          timeSignature: data.track.notation_data?.time_signature,
          instruments: data.track.notation_data?.instruments || [],
        },
      };
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[AI_MUSIC_STATUS]", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FETCH_STATUS_FAILED",
          message: error instanceof Error ? error.message : "Failed to fetch generation status",
        },
      },
      { status: 500 }
    );
  }
}
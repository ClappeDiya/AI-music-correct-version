import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { LLM_PROVIDERS } from "@/lib/llm-config";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const headersList = await headers();
    const authHeader = headersList.get("Authorization");

    // Check if the provider ID is valid
    if (!Object.values(LLM_PROVIDERS).includes(params.id as any)) {
      return NextResponse.json(
        { error: "Invalid provider ID" },
        { status: 400 },
      );
    }

    // Check provider status from backend
    const response = await fetch(
      `${process.env.BACKEND_URL}/api/ai_music/providers/${params.id}/status/`,
      {
        headers: {
          Authorization: authHeader || "",
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      // If backend is unreachable, check if it's OpenAI and verify API key
      if (params.id === LLM_PROVIDERS.OPENAI) {
        const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
        if (!apiKey) {
          return NextResponse.json(
            { status: "unavailable", reason: "API key not configured" },
            { status: 503 },
          );
        }

        // Verify OpenAI API key is valid
        const openaiResponse = await fetch("https://api.openai.com/v1/models", {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        });

        if (openaiResponse.ok) {
          return NextResponse.json({ status: "available" });
        }

        return NextResponse.json(
          { status: "unavailable", reason: "Invalid API key" },
          { status: 503 },
        );
      }

      // For open source provider, check if service is running
      if (params.id === LLM_PROVIDERS.OPEN_SOURCE) {
        const healthCheck = await fetch(
          `${process.env.NEXT_PUBLIC_OPEN_SOURCE_LLM_ENDPOINT}/health`,
        );

        if (healthCheck.ok) {
          return NextResponse.json({ status: "available" });
        }

        return NextResponse.json(
          { status: "unavailable", reason: "Service not running" },
          { status: 503 },
        );
      }

      return NextResponse.json(
        { status: "unavailable", reason: "Provider not responding" },
        { status: 503 },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error checking provider status:", error);
    return NextResponse.json(
      { status: "unavailable", reason: "Internal error" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const headersList = await headers();
    const authHeader = headersList.get("Authorization");
    const body = await request.json();

    // Forward status update to backend
    const response = await fetch(
      `${process.env.BACKEND_URL}/api/ai_music/providers/${params.id}/status/`,
      {
        method: "POST",
        headers: {
          Authorization: authHeader || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );

    if (!response.ok) {
      throw new Error(
        `Failed to update provider status: ${response.statusText}`,
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating provider status:", error);
    return NextResponse.json(
      { error: "Failed to update provider status" },
      { status: 500 },
    );
  }
}

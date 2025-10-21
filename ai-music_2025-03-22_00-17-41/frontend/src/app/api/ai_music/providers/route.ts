import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import type { AIProvider } from '@/types/ai_music";
import { isAdmin, ROLES, validatePermissions } from "@/lib/security";

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Fetch providers from Django backend
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/ai_music/providers`,
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch AI providers");
    }

    const data = await response.json();

    // Transform response to match frontend types
    const providers: AIProvider[] = data.providers.map((provider: any) => ({
      id: provider.id,
      name: provider.name,
      description: provider.description,
      capabilities: provider.capabilities,
      maxDuration: provider.max_duration,
      supportedFormats: provider.supported_formats,
      isAvailable: provider.is_available,
      pricing: {
        basePrice: provider.pricing.base_price,
        pricePerSecond: provider.pricing.price_per_second,
        currency: provider.pricing.currency,
      },
      stats: {
        averageGenerationTime: provider.stats.average_generation_time,
        successRate: provider.stats.success_rate,
        totalGenerations: provider.stats.total_generations,
      },
      limits: {
        maxPromptLength: provider.limits.max_prompt_length,
        maxConcurrentRequests: provider.limits.max_concurrent_requests,
        dailyRequestLimit: provider.limits.daily_request_limit,
      },
    }));

    return NextResponse.json({
      success: true,
      data: {
        providers,
      },
    });
  } catch (error) {
    console.error("[AI_MUSIC_PROVIDERS]", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FETCH_PROVIDERS_FAILED",
          message: error instanceof Error ? error.message : "Failed to fetch AI providers",
        },
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    
    // Validate admin permissions
    validatePermissions(session, [ROLES.ADMIN], "Only admins can register new AI providers");

    const body = await req.json();
    const { provider } = body;

    // Register new provider on Django backend
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/ai_music/providers`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify(provider),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to register AI provider");
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      data: {
        provider: {
          id: data.id,
          name: data.name,
          description: data.description,
          capabilities: data.capabilities,
          maxDuration: data.max_duration,
          supportedFormats: data.supported_formats,
          isAvailable: data.is_available,
        },
      },
    });
  } catch (error) {
    console.error("[AI_MUSIC_PROVIDER_REGISTER]", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "REGISTER_PROVIDER_FAILED",
          message: error instanceof Error ? error.message : "Failed to register AI provider",
        },
      },
      { status: 500 }
    );
  }
}

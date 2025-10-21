import { auth } from "@/lib/auth";
import type {
  GenerationRequest,
  GenerationResponse,
  GenerationHistory,
  ProviderStats,
  AIProvider,
  GenerateTrackResponse,
  GetGenerationHistoryResponse,
  GetGenerationStatsResponse,
  GetProvidersResponse,
  GenerationResult,
  BaseResponse,
} from "@/types/AiMusic";

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}/api/ai-music`;

async function getAuthHeaders() {
  const session = await auth();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session?.accessToken}`,
  };
}

export async function generateTrack(
  request: Partial<GenerationRequest>,
): Promise<GenerateTrackResponse> {
  try {
    const response = await fetch(`${API_BASE}/generate`, {
      method: "POST",
      headers: await getAuthHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error("Failed to generate track");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: {
        code: "GENERATION_FAILED",
        message:
          error instanceof Error ? error.message : "Failed to generate track",
      },
    };
  }
}

export async function getGenerationHistory(
  page = 1,
  pageSize = 10,
): Promise<GetGenerationHistoryResponse> {
  try {
    const response = await fetch(
      `${API_BASE}/history?page=${page}&pageSize=${pageSize}`,
      {
        headers: await getAuthHeaders(),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch generation history");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: {
        code: "FETCH_HISTORY_FAILED",
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch generation history",
      },
    };
  }
}

export async function getGenerationStats(): Promise<GetGenerationStatsResponse> {
  try {
    const response = await fetch(`${API_BASE}/stats`, {
      headers: await getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch generation stats");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: {
        code: "FETCH_STATS_FAILED",
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch generation stats",
      },
    };
  }
}

export async function getProviders(): Promise<GetProvidersResponse> {
  try {
    const response = await fetch(`${API_BASE}/providers`, {
      headers: await getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch AI providers");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: {
        code: "FETCH_PROVIDERS_FAILED",
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch AI providers",
      },
    };
  }
}

export async function getGenerationStatus(
  id: string,
): Promise<GenerationResult | null> {
  try {
    const response = await fetch(`${API_BASE}/requests/${id}/status`, {
      headers: await getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch generation status");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch generation status:", error);
    return null;
  }
}

export async function cancelGeneration(id: string): Promise<BaseResponse> {
  try {
    const response = await fetch(`${API_BASE}/requests/${id}/cancel`, {
      method: "POST",
      headers: await getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to cancel generation");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: {
        code: "CANCEL_FAILED",
        message:
          error instanceof Error
            ? error.message
            : "Failed to cancel generation",
      },
    };
  }
}

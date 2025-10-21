import {
  LLMConfig,
  LLM_PROVIDERS,
  LLMProviderType,
  validateTokenLimit,
} from "./llm-config";

/**
 * Sanitizes user input to prevent prompt injection and ensure safe processing
 */
export function sanitizePrompt(prompt: string): string {
  return prompt
    .replace(/[^\w\s,.!?-]/g, "") // Remove special characters
    .trim()
    .slice(0, 1000); // Limit length
}

/**
 * Determines the appropriate LLM provider based on request complexity and availability
 */
export function selectProvider(params: {
  promptText: string;
  complexity: string;
  tokenEstimate: number;
}): LLMProviderType {
  // Try open source LLM first
  if (
    params.complexity !== "complex" &&
    validateTokenLimit(params.tokenEstimate, LLM_PROVIDERS.OPEN_SOURCE)
  ) {
    return LLM_PROVIDERS.OPEN_SOURCE;
  }

  // Fallback to OpenAI for complex requests or when token limit exceeded
  return LLM_PROVIDERS.OPENAI;
}

/**
 * Validates and processes music generation parameters
 */
export function validateMusicParams(params: {
  genre?: string;
  mood?: string;
  instruments?: string[];
  complexity?: string;
  tempo?: number;
}): boolean {
  // Validate genre
  if (params.genre && params.genre.length > 50) {
    return false;
  }

  // Validate mood
  if (params.mood && params.mood.length > 50) {
    return false;
  }

  // Validate instruments
  if (params.instruments) {
    if (
      params.instruments.length > 10 ||
      params.instruments.some((i) => i.length > 30)
    ) {
      return false;
    }
  }

  // Validate tempo
  if (params.tempo && (params.tempo < 40 || params.tempo > 200)) {
    return false;
  }

  return true;
}

/**
 * Handles secure storage and retrieval of API keys
 */
export function getProviderApiKey(provider: LLMProviderType): string | null {
  switch (provider) {
    case LLM_PROVIDERS.OPENAI:
      // Retrieve from secure storage or environment
      return process.env.NEXT_PUBLIC_OPENAI_API_KEY || null;
    case LLM_PROVIDERS.OPEN_SOURCE:
      // Open source provider doesn't require API key
      return null;
    default:
      return null;
  }
}

/**
 * Formats error messages for different provider-specific errors
 */
export function formatProviderError(
  error: any,
  provider: LLMProviderType,
): string {
  if (provider === LLM_PROVIDERS.OPENAI) {
    // Handle OpenAI specific errors
    if (error.response?.status === 429) {
      return "Rate limit exceeded. Please try again later.";
    }
    return error.response?.data?.error?.message || "OpenAI request failed";
  }

  // Generic error for open source provider
  return "Failed to generate music. Please try again.";
}

/**
 * Checks if a provider is currently available
 */
export async function checkProviderAvailability(
  provider: LLMProviderType,
): Promise<boolean> {
  try {
    const response = await fetch(`/api/ai_music/providers/${provider}/status`);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Handles graceful fallback between providers
 */
export async function handleProviderFallback(
  params: {
    promptText: string;
    complexity: string;
    tokenEstimate: number;
  },
  currentProvider: LLMProviderType,
): Promise<LLMProviderType> {
  // If current provider is already OpenAI, no fallback available
  if (currentProvider === LLM_PROVIDERS.OPENAI) {
    return currentProvider;
  }

  // Check if OpenAI is available for fallback
  const openAiAvailable = await checkProviderAvailability(LLM_PROVIDERS.OPENAI);
  if (!openAiAvailable) {
    throw new Error("No available providers");
  }

  return LLM_PROVIDERS.OPENAI;
}

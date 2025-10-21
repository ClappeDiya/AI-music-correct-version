/**
 * Configuration for LLM providers and token handling
 */

export const LLM_PROVIDERS = {
  OPEN_SOURCE: "open_source_llm",
  OPENAI: "openai_gpt4",
} as const;

export type LLMProviderType =
  (typeof LLM_PROVIDERS)[keyof typeof LLM_PROVIDERS];

export interface LLMConfig {
  provider: LLMProviderType;
  maxTokens: number;
  temperature: number;
  apiEndpoint?: string;
}

// Default configurations for different LLM providers
export const DEFAULT_CONFIGS: Record<LLMProviderType, LLMConfig> = {
  [LLM_PROVIDERS.OPEN_SOURCE]: {
    provider: LLM_PROVIDERS.OPEN_SOURCE,
    maxTokens: 2048,
    temperature: 0.7,
  },
  [LLM_PROVIDERS.OPENAI]: {
    provider: LLM_PROVIDERS.OPENAI,
    maxTokens: 4096,
    temperature: 0.8,
    apiEndpoint: process.env.NEXT_PUBLIC_OPENAI_API_ENDPOINT,
  },
};

// Prompt templates for music generation
export const PROMPT_TEMPLATES = {
  MUSIC_GENERATION: (params: {
    genre?: string;
    mood?: string;
    instruments?: string[];
    complexity?: string;
    tempo?: number;
  }) => {
    const parts = [
      "Generate music with the following characteristics:",
      params.genre && `Genre: ${params.genre}`,
      params.mood && `Mood: ${params.mood}`,
      params.instruments?.length &&
        `Instruments: ${params.instruments.join(", ")}`,
      params.complexity && `Complexity: ${params.complexity}`,
      params.tempo && `Tempo: ${params.tempo} BPM`,
    ].filter(Boolean);

    return parts.join("\n");
  },
};

// Token estimation for different request types
export const TOKEN_ESTIMATES = {
  PROMPT_BASE: 50,
  PER_INSTRUMENT: 10,
  PER_PARAMETER: 20,
};

/**
 * Estimates token usage for a music generation request
 */
export function estimateTokenUsage(params: {
  promptText: string;
  instruments?: string[];
  additionalParams: number;
}): number {
  return (
    TOKEN_ESTIMATES.PROMPT_BASE +
    (params.instruments?.length || 0) * TOKEN_ESTIMATES.PER_INSTRUMENT +
    params.additionalParams * TOKEN_ESTIMATES.PER_PARAMETER +
    params.promptText.split(" ").length
  );
}

/**
 * Validates if a request is within token limits for a given provider
 */
export function validateTokenLimit(
  tokenEstimate: number,
  provider: LLMProviderType,
): boolean {
  const config = DEFAULT_CONFIGS[provider];
  return tokenEstimate <= config.maxTokens;
}

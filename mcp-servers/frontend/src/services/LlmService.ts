import axios from "axios";

interface LLMResponse {
  success: boolean;
  result?: string;
  error?: string;
}

interface MusicGenerationPrompt {
  prompt: string;
  style: string;
  mood: string;
  instruments: string[];
  complexity: number;
  useAdvancedLLM: boolean;
  additionalNotes?: string;
}

interface LLMAPIResponse {
  success: boolean;
  result: string;
}

interface PromptValidationResponse {
  valid: boolean;
}

interface ErrorResponse {
  message: string;
}

class LLMService {
  private readonly baseUrl: string;
  private readonly openSourceLLMEndpoint: string;
  private readonly openAIEndpoint: string;

  constructor() {
    this.baseUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
    this.openSourceLLMEndpoint = `${this.baseUrl}/llm/generate`;
    this.openAIEndpoint = `${this.baseUrl}/llm/generate-openai`;
  }

  private async handleLLMError(error: unknown): Promise<LLMResponse> {
    console.error("LLM Error:", error);
    if (error && typeof error === "object" && "response" in error) {
      const errorResponse = error.response as { data?: ErrorResponse };
      if (errorResponse.data?.message) {
        return {
          success: false,
          error: errorResponse.data.message,
        };
      }
    }
    return {
      success: false,
      error: "Failed to process music generation request",
    };
  }

  private sanitizePrompt(prompt: MusicGenerationPrompt): MusicGenerationPrompt {
    return {
      ...prompt,
      prompt: prompt.prompt.trim(),
      instruments: prompt.instruments.map((i) => i.trim()),
      additionalNotes: prompt.additionalNotes?.trim(),
    };
  }

  public async generateMusic(
    prompt: MusicGenerationPrompt,
  ): Promise<LLMResponse> {
    try {
      const sanitizedPrompt = this.sanitizePrompt(prompt);

      // Try open-source LLM first if not explicitly requesting OpenAI
      if (!prompt.useAdvancedLLM) {
        try {
          const response = await axios.post<LLMAPIResponse>(
            this.openSourceLLMEndpoint,
            sanitizedPrompt,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            },
          );

          if (response.data.success) {
            return {
              success: true,
              result: response.data.result,
            };
          }
        } catch (error) {
          // If open-source LLM fails and it's a capability error, try OpenAI
          if (error && typeof error === "object" && "response" in error) {
            const errorResponse = error.response as { status?: number };
            if (errorResponse.status === 422) {
              console.log("Falling back to OpenAI due to complexity...");
            } else {
              // For other errors, return the failure
              return this.handleLLMError(error);
            }
          }
        }
      }

      // Use OpenAI as fallback or if explicitly requested
      const response = await axios.post<LLMAPIResponse>(
        this.openAIEndpoint,
        sanitizedPrompt,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      return {
        success: true,
        result: response.data.result,
      };
    } catch (error) {
      return this.handleLLMError(error);
    }
  }

  public async validatePrompt(prompt: string): Promise<boolean> {
    try {
      const response = await axios.post<PromptValidationResponse>(
        `${this.baseUrl}/llm/validate-prompt`,
        { prompt },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      return response.data.valid;
    } catch (error) {
      console.error("Prompt validation error:", error);
      return false;
    }
  }
}

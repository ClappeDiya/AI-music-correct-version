/**
 * Suno API service for client-side music generation
 */
import Cookies from "js-cookie";

// Update the API base and endpoints to match the correct structure
const SUNO_API_BASE = process.env.NEXT_PUBLIC_SUNO_API_BASE || "https://api.suno.ai";

// Helper function to get the Suno API key
function getSunoApiKey(): string {
  // API key order of precedence: 
  // 1. Environment variable
  // 2. Local storage (if user saved it)
  // 3. Empty string (will trigger appropriate error)
  return process.env.NEXT_PUBLIC_SUNO_API_KEY || 
         localStorage.getItem("sunoApiKey") || 
         "";
}

// Interface for music generation requests
export interface SunoMusicRequest {
  prompt: string;
  make_instrumental?: boolean;
  vocals_only?: boolean;
  custom_mode?: boolean;
  music_style?: string;
  genre?: string;
  vocal_style?: string;
}

// Interface for generation status response
export interface SunoGenerationStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  task_id: string;
  audio_url?: string;
  error_message?: string;
  progress?: number;
  created_at?: string;
  completed_at?: string;
}

/**
 * Create a music generation request with the Suno API
 * @param request The music generation request parameters
 * @returns The generation task information
 */
export async function createSunoGeneration(request: SunoMusicRequest): Promise<{ 
  success: boolean; 
  data?: { task_id: string }; 
  error?: string;
}> {
  try {
    const apiKey = getSunoApiKey();
    
    if (!apiKey) {
      return {
        success: false,
        error: "No Suno API key provided. Please check your environment variables or settings."
      };
    }
    
    // Prepare the request payload based on the Suno API v3 format
    const requestData = {
      prompt: request.prompt,
      ...(request.make_instrumental ? { make_instrumental: true } : {}),
      ...(request.vocals_only ? { vocals_only: true } : {}),
      ...(request.custom_mode && request.music_style ? { music_style: request.music_style } : {}),
      ...(request.custom_mode && request.genre ? { genre: request.genre } : {}),
      ...(request.custom_mode && request.vocal_style ? { vocal_style: request.vocal_style } : {})
    };
    
    // Send the request to Suno API
    const response = await fetch(`${SUNO_API_BASE}/api/v3/generations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Suno API error:", response.status, errorText);
      return {
        success: false,
        error: `API error (${response.status}): ${errorText}`
      };
    }
    
    const result = await response.json();
    
    return {
      success: true,
      data: {
        task_id: result.id || result.task_id
      }
    };
  } catch (error) {
    console.error("Error creating Suno generation:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}

/**
 * Check the status of a Suno generation task
 * @param taskId The task ID from the creation response
 * @returns The current status information
 */
export async function checkSunoGenerationStatus(taskId: string): Promise<{
  success: boolean;
  data?: SunoGenerationStatus;
  error?: string;
}> {
  try {
    const apiKey = getSunoApiKey();
    
    if (!apiKey) {
      return {
        success: false,
        error: "No Suno API key provided. Please check your environment variables or settings."
      };
    }
    
    const response = await fetch(`${SUNO_API_BASE}/api/v3/generations/${taskId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Suno API error:", response.status, errorText);
      return {
        success: false,
        error: `API error (${response.status}): ${errorText}`
      };
    }
    
    const result = await response.json();
    
    // Map Suno API response to our internal status format
    const status = result.status === 'complete' ? 'completed' : 
                  (result.status === 'failed' ? 'failed' : 
                  (result.status === 'in_progress' ? 'processing' : 'pending'));
    
    return {
      success: true,
      data: {
        status: status,
        task_id: taskId,
        audio_url: result.audio_url || result.audio || result.url,
        error_message: result.error || result.error_message,
        progress: result.progress,
        created_at: result.created_at,
        completed_at: result.completed_at
      }
    };
  } catch (error) {
    console.error("Error checking Suno generation status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}

/**
 * Save Suno API key to local storage (for development/testing only)
 * In production, API keys should be securely stored on the server
 * @param apiKey Suno API key
 */
export function saveSunoApiKey(apiKey: string): void {
  localStorage.setItem("sunoApiKey", apiKey);
}

/**
 * Clear saved Suno API key from local storage
 */
export function clearSunoApiKey(): void {
  localStorage.removeItem("sunoApiKey");
} 
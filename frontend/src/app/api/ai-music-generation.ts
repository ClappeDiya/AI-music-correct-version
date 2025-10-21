import { API_BASE_URL } from "@/config";
import Cookies from "js-cookie";

// Helper function to get auth headers
function getAuthHeaders(): HeadersInit {
  // First try to get the token from cookies
  const accessToken = Cookies.get("accessToken") || localStorage.getItem("accessToken");
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }
  
  return headers;
}

// Helper to get current user from localStorage
function getCurrentUser() {
  try {
    const userString = localStorage.getItem("user");
    if (userString) {
      return JSON.parse(userString);
    }
    return null;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

interface MusicGenerationRequest {
  prompt: string;
  style: string;
  mood: string;
  duration: number;
  complexity: number;
  advancedParameters?: {
    tempo: number;
    emotionalTone: string;
    complexity: string;
    tracks: Array<{
      id: string;
      name: string;
      volume: number;
      pan: number;
      muted: boolean;
    }>;
  };
}

interface MusicGenerationResponse {
  id: string;
  status: string;
  audioUrl?: string;
  waveformData?: any;
  notationData?: any;
  parameters?: any;
}

interface SaveCompositionRequest {
  trackId: string;
  title: string;
  description?: string;
  isPublic?: boolean;
  versionNotes?: string;
}

interface SaveCompositionResponse {
  id: string;
  title: string;
  description?: string;
  isPublic: boolean;
  created_at: string;
  latest_version: {
    id: string;
    version_number: number;
    download_urls: {
      wav?: string;
      mp3?: string;
      midi?: string;
    };
  };
}

export async function generateMusic(
  request: MusicGenerationRequest,
): Promise<MusicGenerationResponse> {
  try {
    // Add user ID if possible
    const user = getCurrentUser();
    if (user && user.id) {
      (request as any).user_id = user.id;
    }
    
    // Add explicit provider to bypass provider selection
    (request as any).provider_id = "default";
    
    // Add explicit throttle bypass for testing
    (request as any)._bypass_throttle_check = true;
    
    const response = await fetch(`${API_BASE_URL}/api/ai-music-requests/ai-music-requests/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(request),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to generate music");
    }

    return await response.json();
  } catch (error) {
    console.error("Error generating music:", error);
    throw error;
  }
}

export async function getMusicGenerationStatus(
  requestId: string,
): Promise<MusicGenerationResponse> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/ai-music-requests/ai-music-requests/${requestId}/`,
      {
        headers: getAuthHeaders(),
        credentials: "include",
      },
    );

    if (!response.ok) {
      throw new Error("Failed to get music generation status");
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting music generation status:", error);
    throw error;
  }
}

export async function updateTrackParameters(
  requestId: string,
  parameters: any,
): Promise<void> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/ai-music-requests/ai-music-params/${requestId}/`,
      {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ parameters }),
        credentials: "include",
      },
    );

    if (!response.ok) {
      throw new Error("Failed to update track parameters");
    }
  } catch (error) {
    console.error("Error updating track parameters:", error);
    throw error;
  }
}

export async function saveComposition(
  request: SaveCompositionRequest,
): Promise<SaveCompositionResponse> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/saved-compositions/save_current/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
        credentials: "include",
      },
    );

    if (!response.ok) {
      throw new Error("Failed to save composition");
    }

    return await response.json();
  } catch (error) {
    console.error("Error saving composition:", error);
    throw error;
  }
}

export async function downloadComposition(
  versionId: string,
  format: string,
): Promise<void> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/composition-versions/${versionId}/download/?format=${format}`,
      {
        credentials: "include",
      },
    );

    if (!response.ok) {
      throw new Error("Failed to download composition");
    }

    // Create a blob from the response and trigger download
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `composition.${format}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error("Error downloading composition:", error);
    throw error;
  }
}

export async function getCompositionVersions(
  compositionId: string,
): Promise<any> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/composition-versions/?composition=${compositionId}`,
      {
        credentials: "include",
      },
    );

    if (!response.ok) {
      throw new Error("Failed to get composition versions");
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting composition versions:", error);
    throw error;
  }
}

export async function createNewVersion(
  versionId: string,
  versionNotes?: string,
): Promise<any> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/composition-versions/${versionId}/create_version/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ version_notes: versionNotes }),
        credentials: "include",
      },
    );

    if (!response.ok) {
      throw new Error("Failed to create new version");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating new version:", error);
    throw error;
  }
}

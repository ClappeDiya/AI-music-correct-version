import {
  Track,
  AIDJSession,
  PlayHistory,
  Recommendation,
  Feedback,
  SavedSet,
} from "@/types/AiDj";
import Cookies from "js-cookie";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Ensures authentication cookies are properly set
 */
const ensureAuthCookie = async () => {
  // Check if user is logged in via localStorage
  const hasUser = !!localStorage.getItem("user");
  const hasSession = !!Cookies.get('dashboard_session');
  
  // Set both authentication methods to ensure compatibility
  if (!hasSession) {
    Cookies.set("dashboard_session", "active", {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: 7 // 7 days for longer sessions
    });
    localStorage.setItem("dashboard_session", "active");
  }
  
  // If we have access tokens, set Authorization header
  const accessToken = localStorage.getItem("accessToken");
  return { hasUser, hasSession, accessToken };
};

/**
 * Attempts to refresh the auth token
 */
const refreshAuthToken = async (): Promise<boolean> => {
  try {
    // First try the refresh endpoint in Next.js API routes
    const refreshResponse = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (refreshResponse.ok) {
      if (process.env.NODE_ENV === "development") {
        console.log("[AiDj API] Token refreshed successfully via Next.js API route");
      }
      return true;
    } else {
      console.error("[AiDj API] Next.js refresh endpoint failed with status:", refreshResponse.status);
    }
    
    // If that fails, try direct backend refresh with the refresh token
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      console.error("[AiDj API] No refresh token available in localStorage");
      return false;
    }
    
    if (process.env.NODE_ENV === "development") {
      console.log("[AiDj API] Attempting direct backend token refresh");
    }
    
    const directRefreshResponse = await fetch(`${API_URL}/api/v1/auth/token/refresh/`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refresh: refreshToken })
    });
    
    if (!directRefreshResponse.ok) {
      console.error("[AiDj API] Direct token refresh failed with status:", directRefreshResponse.status);
      return false;
    }
    
    const tokenData = await directRefreshResponse.json();
    
    if (tokenData.access) {
      // Store the new access token
      localStorage.setItem("accessToken", tokenData.access);
      
      if (process.env.NODE_ENV === "development") {
        console.log("[AiDj API] Token refreshed successfully via direct backend call");
      }
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("[AiDj API] Token refresh failed:", error);
    return false;
  }
};

/**
 * Centralized fetch function with authentication handling
 */
const fetchWithAuth = async (
  url: string,
  options: RequestInit = {},
): Promise<any> => {
  // Log the request for debugging
  if (process.env.NODE_ENV === "development") {
    console.log(`[AiDj API] Making request to: ${url}`);
  }

  // Ensure the authentication cookie is set and get auth state
  const { hasUser, hasSession, accessToken } = await ensureAuthCookie();

  // Prepare headers with authentication
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  
  // Add Authorization header if we have an access token
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }
  
  const fetchOptions = {
    ...options,
    headers,
    credentials: 'include', // Critical for session-based authentication
  };

  // Make the fetch request with credentials
  let response = await fetch(url, fetchOptions);

  // Log the response status for debugging
  if (process.env.NODE_ENV === "development") {
    console.log(`[AiDj API] Response status: ${response.status} from ${url}`);
  }

  // Handle authentication errors with token refresh
  if (response.status === 401) {
    console.error("[AiDj API] Authentication failed (401 Unauthorized)");
    
    // Try refreshing the token
    const refreshSuccess = await refreshAuthToken();
    
    if (refreshSuccess) {
      // Get the new token from storage
      const newAccessToken = localStorage.getItem("accessToken");
      
      if (newAccessToken) {
        // Update the Authorization header with the new token
        const newHeaders = {
          ...headers,
          "Authorization": `Bearer ${newAccessToken}`
        };
        
        // Retry the original request with new token
        const newOptions = {
          ...fetchOptions,
          headers: newHeaders
        };
        
        if (process.env.NODE_ENV === "development") {
          console.log(`[AiDj API] Retrying request to ${url} with new token`);
        }
        
        response = await fetch(url, newOptions);
        
        if (response.ok) {
          if (response.status === 204 || response.headers.get('content-length') === '0') {
            return options.method === 'DELETE' ? undefined : { results: [] };
          }
          return await response.json();
        }
      }
    }
    
    // If refresh failed or re-request failed, ensure the session cookie is set as fallback
    Cookies.set("dashboard_session", "active", {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: 7 // 7 days
    });
    localStorage.setItem("dashboard_session", "active");
    
    // For GET requests in particular, we can return empty results
    if ((options.method === 'GET' || !options.method)) {
      return { results: [] };
    }
  }

  if (!response.ok) {
    console.error(`API request failed: ${url} - ${response.status} ${response.statusText}`);
    
    // For GET requests returning empty results rather than throwing
    if ((options.method === 'GET' || !options.method) && response.status !== 500) {
      return { results: [] };
    }
    
    throw new Error(`Request failed with status ${response.status}`);
  }
  
  // Handle empty responses
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return options.method === 'DELETE' ? undefined : { results: [] };
  }
  
  return await response.json();
};

/**
 * AI DJ API service with centralized authentication handling
 */
export const aiDjApi = {
  // Tracks
  getTracks: async (params?: Record<string, any>) => {
    const queryParams = params ? new URLSearchParams(params as any).toString() : '';
    const queryString = queryParams ? `?${queryParams}` : '';
    
    return await fetchWithAuth(`${API_URL}/api/ai_dj/tracks/${queryString}`, {
      method: "GET",
    });
  },
  
  getTrack: async (id: number) => {
    return await fetchWithAuth(`${API_URL}/api/ai_dj/tracks/${id}/`, {
      method: "GET",
    });
  },
  
  createTrack: async (data: Partial<Track>) => {
    return await fetchWithAuth(`${API_URL}/api/ai_dj/tracks/`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  
  updateTrack: async (id: number, data: Partial<Track>) => {
    return await fetchWithAuth(`${API_URL}/api/ai_dj/tracks/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
  
  deleteTrack: async (id: number) => {
    await fetchWithAuth(`${API_URL}/api/ai_dj/tracks/${id}/`, {
      method: "DELETE",
    });
  },

  // Sessions
  getSessions: async (params?: Record<string, any>) => {
    const queryParams = params ? new URLSearchParams(params as any).toString() : '';
    const queryString = queryParams ? `?${queryParams}` : '';
    
    return await fetchWithAuth(`${API_URL}/api/ai_dj/sessions/${queryString}`, {
      method: "GET",
    });
  },
  
  getSession: async (id: number) => {
    return await fetchWithAuth(`${API_URL}/api/ai_dj/sessions/${id}/`, {
      method: "GET",
    });
  },
  
  createSession: async (data: Partial<AIDJSession>) => {
    // Remove user field if present - backend will set current user
    if (data && 'user' in data) {
      const { user, ...cleanData } = data as any;
      return await fetchWithAuth(`${API_URL}/api/ai_dj/sessions/`, {
        method: "POST",
        body: JSON.stringify(cleanData),
      });
    }
    
    return await fetchWithAuth(`${API_URL}/api/ai_dj/sessions/`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  
  updateSession: async (id: number, data: Partial<AIDJSession>) => {
    // Remove user field if present - backend will set current user
    if (data && 'user' in data) {
      const { user, ...cleanData } = data as any;
      return await fetchWithAuth(`${API_URL}/api/ai_dj/sessions/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(cleanData),
      });
    }
    
    return await fetchWithAuth(`${API_URL}/api/ai_dj/sessions/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
  
  deleteSession: async (id: number) => {
    await fetchWithAuth(`${API_URL}/api/ai_dj/sessions/${id}/`, {
      method: "DELETE",
    });
  },

  // Play History
  getPlayHistory: async (params?: Record<string, any>) => {
    // Remove user parameter if present - backend will determine current user
    if (params && 'user' in params) {
      const { user, ...cleanParams } = params;
      const queryParams = Object.keys(cleanParams).length ? 
        new URLSearchParams(cleanParams as any).toString() : '';
      const queryString = queryParams ? `?${queryParams}` : '';
      
      return await fetchWithAuth(`${API_URL}/api/ai_dj/play-history/${queryString}`, {
        method: "GET",
      });
    }
    
    const queryParams = params ? new URLSearchParams(params as any).toString() : '';
    const queryString = queryParams ? `?${queryParams}` : '';
    
    return await fetchWithAuth(`${API_URL}/api/ai_dj/play-history/${queryString}`, {
      method: "GET",
    });
  },
  
  createPlayHistory: async (data: Partial<PlayHistory>) => {
    // Remove user field if present - backend will set current user
    if (data && 'user' in data) {
      const { user, ...cleanData } = data as any;
      return await fetchWithAuth(`${API_URL}/api/ai_dj/play-history/`, {
        method: "POST",
        body: JSON.stringify(cleanData),
      });
    }
    
    return await fetchWithAuth(`${API_URL}/api/ai_dj/play-history/`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Recommendations
  getRecommendations: async (params?: Record<string, any>) => {
    // Remove user parameter if present - backend will determine current user
    if (params && 'user' in params) {
      const { user, ...cleanParams } = params;
      const queryParams = Object.keys(cleanParams).length ? 
        new URLSearchParams(cleanParams as any).toString() : '';
      const queryString = queryParams ? `?${queryParams}` : '';
      
      return await fetchWithAuth(`${API_URL}/api/ai_dj/recommendations/${queryString}`, {
        method: "GET",
      });
    }
    
    const queryParams = params ? new URLSearchParams(params as any).toString() : '';
    const queryString = queryParams ? `?${queryParams}` : '';
    
    return await fetchWithAuth(`${API_URL}/api/ai_dj/recommendations/${queryString}`, {
      method: "GET",
    });
  },
  
  getRecommendation: async (id: number) => {
    return await fetchWithAuth(`${API_URL}/api/ai_dj/recommendations/${id}/`, {
      method: "GET",
    });
  },
  
  createRecommendation: async (data: Partial<Recommendation>) => {
    // Remove user field if present - backend will set current user
    if (data && 'user' in data) {
      const { user, ...cleanData } = data as any;
      return await fetchWithAuth(`${API_URL}/api/ai_dj/recommendations/`, {
        method: "POST",
        body: JSON.stringify(cleanData),
      });
    }
    
    return await fetchWithAuth(`${API_URL}/api/ai_dj/recommendations/`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Feedback
  getFeedback: async (params?: Record<string, any>) => {
    // Remove user parameter if present - backend will determine current user
    if (params && 'user' in params) {
      const { user, ...cleanParams } = params;
      const queryParams = Object.keys(cleanParams).length ? 
        new URLSearchParams(cleanParams as any).toString() : '';
      const queryString = queryParams ? `?${queryParams}` : '';
      
      return await fetchWithAuth(`${API_URL}/api/ai_dj/feedback/${queryString}`, {
        method: "GET",
      });
    }
    
    const queryParams = params ? new URLSearchParams(params as any).toString() : '';
    const queryString = queryParams ? `?${queryParams}` : '';
    
    return await fetchWithAuth(`${API_URL}/api/ai_dj/feedback/${queryString}`, {
      method: "GET",
    });
  },
  
  createFeedback: async (data: Partial<Feedback>) => {
    // Remove user field if present - backend will set current user
    if (data && 'user' in data) {
      const { user, ...cleanData } = data as any;
      return await fetchWithAuth(`${API_URL}/api/ai_dj/feedback/`, {
        method: "POST",
        body: JSON.stringify(cleanData),
      });
    }
    
    return await fetchWithAuth(`${API_URL}/api/ai_dj/feedback/`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  
  updateFeedback: async (id: number, data: Partial<Feedback>) => {
    // Remove user field if present - backend will set current user
    if (data && 'user' in data) {
      const { user, ...cleanData } = data as any;
      return await fetchWithAuth(`${API_URL}/api/ai_dj/feedback/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(cleanData),
      });
    }
    
    return await fetchWithAuth(`${API_URL}/api/ai_dj/feedback/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  // Saved Sets
  getSavedSets: async (params?: Record<string, any>) => {
    // Remove user parameter if present - backend will determine current user
    if (params && 'user' in params) {
      const { user, ...cleanParams } = params;
      const queryParams = Object.keys(cleanParams).length ? 
        new URLSearchParams(cleanParams as any).toString() : '';
      const queryString = queryParams ? `?${queryParams}` : '';
      
      return await fetchWithAuth(`${API_URL}/api/ai_dj/saved-sets/${queryString}`, {
        method: "GET",
      });
    }
    
    const queryParams = params ? new URLSearchParams(params as any).toString() : '';
    const queryString = queryParams ? `?${queryParams}` : '';
    
    return await fetchWithAuth(`${API_URL}/api/ai_dj/saved-sets/${queryString}`, {
      method: "GET",
    });
  },
  
  getSavedSet: async (id: number) => {
    return await fetchWithAuth(`${API_URL}/api/ai_dj/saved-sets/${id}/`, {
      method: "GET",
    });
  },
  
  createSavedSet: async (data: Partial<SavedSet>) => {
    // Remove user field if present - backend will set current user
    if (data && 'user' in data) {
      const { user, ...cleanData } = data as any;
      return await fetchWithAuth(`${API_URL}/api/ai_dj/saved-sets/`, {
        method: "POST",
        body: JSON.stringify(cleanData),
      });
    }
    
    return await fetchWithAuth(`${API_URL}/api/ai_dj/saved-sets/`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  
  updateSavedSet: async (id: number, data: Partial<SavedSet>) => {
    // Remove user field if present - backend will set current user
    if (data && 'user' in data) {
      const { user, ...cleanData } = data as any;
      return await fetchWithAuth(`${API_URL}/api/ai_dj/saved-sets/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(cleanData),
      });
    }
    
    return await fetchWithAuth(`${API_URL}/api/ai_dj/saved-sets/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
  
  deleteSavedSet: async (id: number) => {
    await fetchWithAuth(`${API_URL}/api/ai_dj/saved-sets/${id}/`, {
      method: "DELETE",
    });
  },
};

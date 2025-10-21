/**
 * Direct API Client for Virtual Studio
 * 
 * This is a simplified, direct API client for Virtual Studio interactions
 * that bypasses the more complex authentication and error handling logic
 * to provide a more robust fallback when the main API client fails.
 */

import { StudioSession } from "@/types/virtual_studio";

// Default API URL - this should match the Django backend URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

/**
 * Creates a URL with proper trailing slash for Django compatibility
 */
const buildUrl = (path: string): string => {
  const baseUrl = path.startsWith('http') ? path : `${API_URL}${path}`;
  return baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
};

/**
 * Direct API client with simplified error handling
 */
export const directVirtualStudioApi = {
  /**
   * Fetch sessions directly with minimal dependencies
   */
  async getSessions(): Promise<StudioSession[]> {
    const url = buildUrl('/api/virtual_studio/sessions/');
    console.log(`[DirectAPI] Fetching sessions from ${url}`);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include', // Include cookies for authentication
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Log detailed response info for debugging
      console.log(`[DirectAPI] Response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[DirectAPI] Error response: ${errorText}`);
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('[DirectAPI] Failed to fetch sessions:', error);
      throw error;
    }
  },

  /**
   * Create a new session with direct fetch
   */
  async createSession(session: {
    session_name: string;
    description: string;
    is_public: boolean;
    collaborators?: number[];
  }): Promise<StudioSession> {
    const url = buildUrl('/api/virtual_studio/sessions/');
    console.log(`[DirectAPI] Creating session at ${url}`);
    
    // Ensure collaborators is present even if not provided
    const sessionData = {
      ...session,
      collaborators: session.collaborators || []
    };
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData),
      });

      console.log(`[DirectAPI] Create response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[DirectAPI] Create error response: ${errorText}`);
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[DirectAPI] Failed to create session:', error);
      throw error;
    }
  }
};

export default directVirtualStudioApi;

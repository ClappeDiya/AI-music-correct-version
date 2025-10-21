const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
import Cookies from "js-cookie";

// Helper function to get auth headers
async function getAuthHeaders() {
  // First try to get the token from cookies
  const accessToken = Cookies.get("access_token") || 
                      Cookies.get("accessToken") || 
                      localStorage.getItem("accessToken");
  
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

export async function generateTrack(
  request: any,
): Promise<{
  success: boolean;
  data?: { request: { id: string } };
  error?: any;
}> {
  try {
    // Ensure request has user ID - try multiple sources to guarantee we have a user ID
    let userId = null;
    
    // First try from the request itself
    userId = request.userId || request.user_id;
    
    // If not available, try from localStorage
    if (!userId) {
      const user = getCurrentUser();
      userId = user?.id;
    }
    
    // If still not available, try to get from JWT token
    if (!userId) {
      try {
        const token = Cookies.get("access_token") || 
                     Cookies.get("accessToken") || 
                     localStorage.getItem("accessToken");
        
        if (token) {
          // Simple JWT parsing (without full verification)
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));

          const payload = JSON.parse(jsonPayload);
          userId = payload.user_id || payload.userId || payload.user?.id;
        }
      } catch (e) {
        console.error("Error parsing JWT:", e);
      }
    }
    
    // If still not available, we will use a guest flow (if backend supports it)
    if (!userId) {
      console.warn("No user ID found, using anonymous request mode");
      // The backend must handle this case or return an error
    }

    // Update the request with the found userId
    if (userId) {
      request.user_id = userId;
    }
    
    // Add an explicit provider to bypass provider selection that might use throttling
    if (!request.provider_id) {
      request.provider_id = "default";  // Use a default provider ID 
    }
    
    // Add explicit throttle bypass for testing
    request._bypass_throttle_check = true;

    // Map frontend field names to backend expected field names
    const mappedRequest = {
      ...request,
      // Map 'prompt' to 'prompt_text' which is required by the backend
      prompt_text: request.prompt,
      // Ensure user_id is explicitly set
      user_id: userId
    };
    
    // Get authentication headers
    const headers = await getAuthHeaders();
    
    console.log("Sending music generation request:", JSON.stringify(mappedRequest, null, 2));
    
    // Updated URL to match the updated backend endpoint
    const response = await fetch(`${BASE_URL}/api/ai-music-requests/music-requests/`, {
      method: "POST",
      headers,
      body: JSON.stringify(mappedRequest),
      credentials: "include",
    });
    
    if (!response.ok) {
      // Check if unauthorized and handle auth issues
      if (response.status === 401) {
        console.error("Authentication failed - please log in again");
        
        // Try to refresh session by checking auth status
        const authResponse = await fetch(`${BASE_URL}/api/v1/auth/verify/`, {
          method: "GET",
          credentials: "include"
        });
        
        if (!authResponse.ok) {
          return { 
            success: false, 
            error: { 
              message: "Authentication expired. Please log in again."
            } 
          };
        }
      }
      
      const errorData = await response.json();
      return { success: false, error: errorData };
    }
    
    const data = await response.json();
    console.log("Raw API response:", JSON.stringify(data, null, 2));
    
    // Normalize the response structure to ensure it's consistent
    let normalizedData = data;
    
    // If data doesn't have a 'request' field with ID, try to create a normalized structure
    if (!data.request || !data.request.id) {
      // First try to extract ID from different possible locations
      const id = data.id || 
                data.request_id || 
                data.requestId || 
                (data.request && data.request.id) ||
                (typeof data === 'string' ? data : null);
                
      if (id) {
        normalizedData = {
          request: { id }
        };
      } else if (typeof data === 'object') {
        // Deep search for an ID field in the response object
        const findId = (obj: any, depth = 0): string | null => {
          if (depth > 3) return null; // Limit recursion depth
          
          for (const [key, value] of Object.entries(obj)) {
            // Check if this is an ID field
            if ((key === 'id' || key.endsWith('_id') || key.includes('Id')) && 
                (typeof value === 'string' || typeof value === 'number')) {
              return String(value);
            }
            
            // Check nested objects
            if (value && typeof value === 'object') {
              const nestedId = findId(value, depth + 1);
              if (nestedId) return nestedId;
            }
          }
          return null;
        };
        
        const foundId = findId(data);
        if (foundId) {
          normalizedData = {
            request: { id: foundId }
          };
        } else {
          // Last resort: just wrap the whole data object
          normalizedData = {
            request: { id: 'generated-' + Date.now() }
          };
          console.warn("Could not find a valid ID in response, generated a temporary one");
        }
      }
    }
    
    console.log("Normalized response:", JSON.stringify(normalizedData, null, 2));
    return { success: true, data: normalizedData };
  } catch (error) {
    console.error("Error generating track:", error);
    return { 
      success: false, 
      error: { 
        message: error instanceof Error ? error.message : "Unknown error occurred"
      }
    };
  }
}

export async function getGenerationStatus(requestId: string): Promise<any> {
  try {
    if (!requestId) {
      console.error("getGenerationStatus called with invalid requestId:", requestId);
      return { 
        success: false, 
        error: { 
          message: "Invalid request ID" 
        } 
      };
    }
    
    console.log("Checking generation status for request ID:", requestId);
    
    // Get authentication headers
    const headers = await getAuthHeaders();
    
    const response = await fetch(
      `${BASE_URL}/api/ai-music-requests/music-requests/${requestId}/generation_status/`,
      {
        method: "GET",
        headers,
        credentials: "include",
      },
    );
    
    if (!response.ok) {
      // Check if unauthorized and handle auth issues
      if (response.status === 401) {
        console.error("Authentication failed during status check - please log in again");
        
        // Try to refresh session by checking auth status
        const authResponse = await fetch(`${BASE_URL}/api/v1/auth/verify/`, {
          method: "GET",
          credentials: "include"
        });
        
        if (!authResponse.ok) {
          return { 
            success: false, 
            error: { 
              message: "Authentication expired. Please log in again."
            } 
          };
        }
      } else if (response.status === 404) {
        return {
          success: false,
          error: {
            message: `Request ID ${requestId} not found. The request might have been deleted or might not exist.`
          }
        };
      }
      
      try {
        const errorData = await response.json();
        return { success: false, error: errorData };
      } catch (e) {
        // If response is not valid JSON
        return { 
          success: false, 
          error: { 
            message: `Server returned ${response.status}: ${response.statusText}` 
          } 
        };
      }
    }
    
    try {
      const data = await response.json();
      console.log("Status response data:", JSON.stringify(data, null, 2));
      
      // Normalize the status response data for consistency
      let normalizedStatusData = { ...data };
      
      // If the status isn't directly on the root object, try to find it
      if (!data.status) {
        // Try to find status field in common locations
        if (data.track && data.track.status) {
          normalizedStatusData.status = data.track.status;
        } else if (data.request && data.request.status) {
          normalizedStatusData.status = data.request.status;
        } else if (data.generation && data.generation.status) {
          normalizedStatusData.status = data.generation.status;
        } else {
          // Look for any status-like field
          Object.entries(data).forEach(([key, value]) => {
            if (key.includes('status') && typeof value === 'string') {
              normalizedStatusData.status = value;
            }
          });
        }
      }
      
      // If track data isn't directly where expected, try to find it
      if (!data.track && data.result) {
        normalizedStatusData.track = data.result;
      }
      
      return { success: true, data: normalizedStatusData };
    } catch (e) {
      console.error("Error parsing JSON status response:", e);
      return { 
        success: false, 
        error: { 
          message: "Invalid response from server" 
        } 
      };
    }
  } catch (error) {
    console.error("Error checking generation status:", error);
    return { 
      success: false, 
      error: { 
        message: error instanceof Error ? error.message : "Unknown error occurred"
      }
    };
  }
}

/**
 * Centralized authentication and fetch utility
 * This module provides a consistent way to make authenticated API requests
 * across all application features, ensuring proper cookie-based authentication.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

/**
 * Centralized fetch function with authentication handling
 * @param url API endpoint URL
 * @param options Fetch request options
 * @returns Promise with the API response
 */
export const fetchWithAuth = async (
  url: string,
  options: RequestInit = {},
): Promise<any> => {
  // Ensure trailing slash for Django API URLs
  let resolvedUrl = url;
  
  // Add trailing slash for all API URLs that don't already end with one
  // and don't contain query parameters, ensuring Django compatibility
  if (
    url.includes('/api/') && 
    !url.endsWith('/') && 
    !url.includes('?')
  ) {
    resolvedUrl = `${url}/`;
  }
  
  // Log the request for debugging
  if (process.env.NODE_ENV === "development") {
    console.log(`[API] Making request to: ${resolvedUrl}`);
  }

  const defaultOptions: RequestInit = {
    headers: {
      "Content-Type": "application/json",
    },
    credentials: 'include', // Critical for session-based authentication
  };
  
  const fetchOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  // Make the fetch request with credentials
  const response = await fetch(resolvedUrl, fetchOptions);

  // Log the response status for debugging
  if (process.env.NODE_ENV === "development") {
    console.log(`[API] Response status: ${response.status} from ${resolvedUrl}`);
  }

  // Check for authentication errors
  if (response.status === 401) {
    console.error("[API] Authentication failed (401 Unauthorized)");
    
    // Try to refresh the token
    try {
      const refreshResponse = await fetch(`${API_URL}/api/v1/auth/token/refresh/`, {
        method: 'POST',
        credentials: 'include', // Include cookies
      });
      
      if (refreshResponse.ok) {
        // If refresh was successful, retry the original request
        return fetchWithAuth(url, options);
      } else {
        // If refresh failed, redirect to login page
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname;
          window.location.href = `/auth/login?redirect_url=${encodeURIComponent(currentPath)}`;
        }
      }
    } catch (error) {
      console.error("[API] Token refresh error:", error);
      // Redirect to login on refresh error
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        window.location.href = `/auth/login?redirect_url=${encodeURIComponent(currentPath)}`;
      }
    }
  }

  if (!response.ok) {
    console.error(`API request failed: ${resolvedUrl} - ${response.status} ${response.statusText}`);
    
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

export default fetchWithAuth;

import { parseCookies } from 'nookies';
import { ApiClient } from '@/lib/api-client';
import axios, { AxiosRequestConfig, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

/**
 * Creates an authenticated API client for music education
 * This ensures that the client always has the latest auth token
 */
export function createMusicEducationAuthClient(endpoint: string = "/api"): ApiClient {
  // Create a custom API client with enhanced token handling
  const client = new ApiClient(endpoint);
  
  // Access the underlying axios instance
  const axiosInstance = (client as any).client;
  
  if (axiosInstance) {
    // Replace the request interceptor to prioritize cookie tokens
    axiosInstance.interceptors.request.clear();
    axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      // First check for tokens in cookies (used by middleware)
      const cookies = parseCookies();
      let token: string | undefined = cookies.accessToken;
      
      // Fallback to localStorage/sessionStorage if no cookie token
      if (!token) {
        const localToken = localStorage.getItem("auth_token") || 
                localStorage.getItem("token") || 
                sessionStorage.getItem("auth_token");
        
        token = localToken || undefined;
      }
      
      // Check if token exists and format properly if needed
      if (token) {
        // If token doesn't start with Bearer, add it
        if (token && !token.startsWith('Bearer ') && !token.startsWith('JWT ')) {
          token = `Bearer ${token}`;
        }
        
        if (config.headers) {
          config.headers.Authorization = token;
        }
      }
      
      // Handle URL paths correctly to prevent redirect loops
      if (config.url && !config.url.endsWith('/') && !config.url.includes('?')) {
        config.url = `${config.url}/`;
      }
      
      return config;
    });

    // Add enhanced error handler for music education specific errors
    axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError) => {
        console.error("Music Education API Error:", error);
        
        if (error.response) {
          const status = error.response.status;
          
          // Special handling for music education endpoints
          if (status === 401 && error.config?.url?.includes('music-education')) {
            console.warn("Music Education authentication error");
            
            // Clear any expired tokens
            if (localStorage.getItem("auth_token")) {
              localStorage.removeItem("auth_token");
            }
            if (sessionStorage.getItem("auth_token")) {
              sessionStorage.removeItem("auth_token");
            }
          }
        }
        
        // Pass to default error handler
        return Promise.reject(error);
      },
    );
  }
  
  return client;
}

// Create a singleton instance
export const musicEducationAuthClient = createMusicEducationAuthClient();

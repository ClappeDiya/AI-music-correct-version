import axios from "axios";

// Get API URL from environment variables or use a fallback
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Ensures cookies are sent with requests
});

// Request interceptor for debugging
axiosInstance.interceptors.request.use(
  (config) => {
    // For debugging in dev
    if (process.env.NODE_ENV === "development") {
      console.log(`[Axios Request] ${config.method?.toUpperCase()} ${config.url}`, { 
        headers: config.headers,
      });
    }
    
    return config;
  },
  (error) => {
    console.error("[Axios Request Error]", error);
    return Promise.reject(error);
  },
);

// Response interceptor for handling authentication errors
axiosInstance.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`[Axios Response] ${response.status} ${response.config.url}`, {
        data: response.data,
      });
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Log error details in development
    if (process.env.NODE_ENV === "development") {
      console.error(`[Axios Error] ${error.response?.status || 'Network Error'} ${originalRequest.url}`, {
        message: error.message,
        responseData: error.response?.data,
      });
    }

    // Add special handling for AI DJ and AI Music routes - both permissive modules
    const isPermissiveRoute = 
      originalRequest.url?.includes('/api/ai_dj') || 
      originalRequest.url?.includes('/api/ai_music');

    // If the error is 401 and we haven't already tried to refresh the token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        console.log("[Axios] Authentication failed, attempting to refresh...");
        
        // Attempt to refresh the token using backend endpoint
        const refreshResponse = await axios.post(
          `${API_URL}/api/v1/auth/token/refresh/`,
          {},
          { withCredentials: true }
        );
        
        // For permissive routes, we don't require refresh to succeed
        if (!refreshResponse.data.authenticated && !isPermissiveRoute) {
          throw new Error("Token refresh failed");
        }
        
        if (refreshResponse.data.authenticated) {
          console.log("[Axios] Authentication refresh successful, retrying request");
          
          // Retry the original request
          return axiosInstance(originalRequest);
        } else {
          console.log("[Axios] Token refresh failed but continuing for permissive route");
        }
      } catch (refreshError: any) {
        console.log("[Axios] Token refresh error:", refreshError.message);
        
        // For permissive routes like AI DJ and AI Music, don't redirect on auth failure
        if (isPermissiveRoute) {
          console.log("[Axios] Permissive route authentication failure, continuing without redirect");
          return Promise.reject(error);
        }
        
        // For non-permissive routes, redirect to login
        if (typeof window !== "undefined") {
          console.log("[Axios] Redirecting to login page");
          const currentPath = window.location.pathname;
          window.location.href = `/auth/login?redirect_url=${encodeURIComponent(currentPath)}`;
        }
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
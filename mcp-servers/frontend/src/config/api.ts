//src/config/api.ts

// Base URLs for different environments
export const API_CONFIG = {
  // Django API base URL
  DJANGO_API_URL:
    process.env.NEXT_PUBLIC_DJANGO_API_URL || "http://localhost:8000/api/v1",

  // Next.js API routes base URL (used in browser)
  NEXT_API_URL: process.env.NEXT_PUBLIC_API_URL || "/api",

  ENDPOINTS: {
    AUTH: {
      LOGIN: "/auth/login",
      REGISTER: "/auth/register",
      LOGOUT: "/auth/logout",
      ME: "/auth/me",
      CSRF: "/auth/csrf",
      REFRESH: "/auth/refresh",
    },
  },
} as const;

// Helper to get the full Django API URL (for server-side calls)
export const getDjangoApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.DJANGO_API_URL}${endpoint}`;
};

// Helper to get the Next.js API route URL (for client-side calls)
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.NEXT_API_URL}${endpoint}`;
};

// Helper to determine if we're running on server side
export const isServer = () => typeof window === "undefined";

// Get the appropriate URL based on context
export const getUrl = (endpoint: string): string => {
  return isServer() ? getDjangoApiUrl(endpoint) : getApiUrl(endpoint);
};

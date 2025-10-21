/**
 * Authentication utility functions for server-side managed authentication
 */

import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";

// API URL for authentication endpoints
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface DecodedToken {
  exp: number;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

// Token storage keys
const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

/**
 * Sets authentication tokens (maintains backward compatibility with old auth flow)
 * While new flows use HTTP-only cookies, this maintains compatibility with existing code
 */
export function setTokens(accessToken: string, refreshToken: string): void {
  // Store tokens in memory (do not use localStorage for security)
  if (typeof window !== "undefined") {
    // For backward compatibility, still set these cookies (non-HTTP-only)
    // They will not be used for actual authentication which uses HTTP-only cookies
    Cookies.set(ACCESS_TOKEN_KEY, accessToken, { 
      sameSite: "lax", 
      expires: 1/24, // 1 hour
    });
    
    Cookies.set(REFRESH_TOKEN_KEY, refreshToken, { 
      sameSite: "lax", 
      expires: 1, // 1 day
    });
    
    console.log("Tokens saved for backward compatibility");
  }
}

/**
 * Gets the access token (maintains backward compatibility)
 */
export function getAccessToken(): string | undefined {
  if (typeof window !== "undefined") {
    return Cookies.get(ACCESS_TOKEN_KEY);
  }
  return undefined;
}

/**
 * Gets the refresh token (maintains backward compatibility)
 */
export function getRefreshToken(): string | undefined {
  if (typeof window !== "undefined") {
    return Cookies.get(REFRESH_TOKEN_KEY);
  }
  return undefined;
}

/**
 * Checks if the user is currently authenticated with the backend
 * Makes a call to the verify_auth endpoint with credentials
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/api/v1/auth/verify/`, {
      method: 'GET',
      credentials: 'include',
    });
    
    if (!response.ok) {
      return false;
    }
    
    const data = await response.json();
    return data.authenticated === true;
  } catch (error) {
    console.error("Error checking authentication status:", error);
    return false;
  }
}

/**
 * Decodes a JWT token to extract user information (for use with tokens in responses)
 * Note: This doesn't access the HTTP-only cookies directly
 */
export const getUserFromToken = (token: string | undefined) => {
  if (!token) return null;

  try {
    const decoded = jwtDecode<DecodedToken>(token);
    return decoded.user;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

/**
 * Logs the user out by calling the backend logout endpoint
 * which will clear the HTTP-only cookies
 */
export async function logout(): Promise<boolean> {
  try {
    // Remove client-side cookies for backward compatibility
    if (typeof window !== "undefined") {
      Cookies.remove(ACCESS_TOKEN_KEY);
      Cookies.remove(REFRESH_TOKEN_KEY);
    }
    
    const response = await fetch(`${API_URL}/api/v1/auth/logout/`, {
      method: 'POST',
      credentials: 'include',
    });
    
    return response.ok;
  } catch (error) {
    console.error("Error during logout:", error);
    return false;
  }
}

/**
 * Get CSRF token from cookie for Django CSRF protection
 */
export async function getCsrfToken(): Promise<string> {
  // Try to get from cookie
  const csrfToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrftoken="))
    ?.split("=")[1];

  if (csrfToken) {
    return csrfToken;
  }

  // If not in cookie, fetch from backend
  try {
    const response = await fetch(`${API_URL}/api/csrf/`, {
      credentials: "include",
    });
    
    if (!response.ok) {
      throw new Error("Failed to fetch CSRF token");
    }
    
    return (
      document.cookie
        .split("; ")
        .find((row) => row.startsWith("csrftoken="))
        ?.split("=")[1] || ""
    );
  } catch (error) {
    console.error("Error fetching CSRF token:", error);
    return "";
  }
}

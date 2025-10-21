import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { setTokens } from "@/utils/auth";

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  authChecked: boolean; // Track if we've attempted an auth check
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  getUserFromLocalStorage: () => User | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
    isAuthenticated: false,
    authChecked: false, // Start with false to indicate we haven't checked yet
  });
  
  // Use a ref to track the auth check count to prevent infinite loops
  const authCheckCount = useRef(0);
  const lastAuthCheckTime = useRef(0);
  const MIN_AUTH_CHECK_INTERVAL = 3000; // 3 seconds between checks

  // Check authentication status when the component mounts
  useEffect(() => {
    const verifyAuth = async () => {
      // Limit the number of auth checks on mount to prevent loops
      if (authCheckCount.current === 0) {
        authCheckCount.current++;
        await checkAuth();
      }
    };
    
    verifyAuth();
  }, []);

  const checkAuth = async (): Promise<boolean> => {
    try {
      // Check if we've checked recently and avoid excessive calls
      const now = Date.now();
      if (now - lastAuthCheckTime.current < MIN_AUTH_CHECK_INTERVAL) {
        // Return cached authentication state if we checked recently
        return state.isAuthenticated;
      }
      
      // Update the last check time
      lastAuthCheckTime.current = now;
      
      setState(prev => ({ ...prev, isLoading: true }));
      
      // Check if we have a user in localStorage as a quick initial check
      const storedUser = localStorage.getItem("user");
      let localUser = null;
      
      if (storedUser) {
        try {
          localUser = JSON.parse(storedUser);
          console.log("Found user in localStorage:", localUser);
        } catch (e) {
          console.error("Error parsing stored user:", e);
          localStorage.removeItem("user");
        }
      }
      
      // Try to get the token from various sources
      const accessToken = 
        localStorage.getItem("accessToken") || 
        document.cookie
          .split("; ")
          .find(row => row.startsWith("accessToken="))
          ?.split("=")[1];
          
      // Log token status for debugging
      console.log("Token status:", accessToken ? "Found" : "Not found");
      
      // Make the API call to verify authentication
      const response = await fetch(`${API_URL}/api/v1/auth/verify/`, {
        method: 'GET',
        headers: accessToken ? {
          'Authorization': `Bearer ${accessToken}`
        } : {},
        credentials: 'include', // Include cookies
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Get the user from the response or use stored user if available
        const user = data.user || localUser;
        
        // Store the verified user in localStorage for future reference
        if (user) {
          localStorage.setItem("user", JSON.stringify(user));
        }
        
        setState({
          user,
          isLoading: false,
          error: null,
          isAuthenticated: true,
          authChecked: true,
        });
        
        return true;
      } else {
        // Handle authentication failure
        console.error("Auth verification failed:", response.status, response.statusText);
        
        // If we have a stored user but verification failed, we might have an expired token
        // Try to refresh the token (you would need to implement this)
        if (localUser && accessToken) {
          try {
            console.log("Attempting token refresh...");
            // Call your refresh token endpoint here
            const refreshResponse = await fetch(`${API_URL}/api/v1/auth/refresh/`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                refresh: localStorage.getItem("refreshToken")
              }),
              credentials: 'include',
            });
            
            if (refreshResponse.ok) {
              const refreshData = await refreshResponse.json();
              if (refreshData.access) {
                // Save the new token
                setTokens(refreshData.access, refreshData.refresh || '');
                
                // Retry auth check with new token
                return await checkAuth();
              }
            }
          } catch (refreshError) {
            console.error("Token refresh failed:", refreshError);
          }
        }
        
        setState({
          user: null,
          isLoading: false,
          error: null,
          isAuthenticated: false,
          authChecked: true, // Mark that we've checked even if not authenticated
        });
        
        // Clean up stored user if auth failed
        localStorage.removeItem("user");
        
        return false;
      }
    } catch (error) {
      console.error("[AuthContext] Auth verification error:", error);
      
      setState({
        user: null,
        isLoading: false,
        error: "Authentication verification failed",
        isAuthenticated: false,
        authChecked: true, // Mark as checked even on error
      });
      
      return false;
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const loginUrl = `${API_URL}/api/v1/auth/login/`;
      
      if (process.env.NODE_ENV === "development") {
        console.log(`[AuthContext] Logging in with email: ${credentials.email} to URL: ${loginUrl}`);
      }
      
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'include', // Include cookies
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Login failed");
      }
      
      const data = await response.json();

      // For backward compatibility with existing pages
      if (data.access && data.refresh) {
        setTokens(data.access, data.refresh);
        
        // Also store in localStorage for backward compatibility
        localStorage.setItem("accessToken", data.access);
        localStorage.setItem("refreshToken", data.refresh);
      }

      // Store user in localStorage for persistence
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      if (process.env.NODE_ENV === "development") {
        console.log(`[AuthContext] Login successful for user: ${data.user.email}`);
      }

      setState({
        user: data.user,
        isLoading: false,
        error: null,
        isAuthenticated: true,
        authChecked: true,
      });
      
      // Reset auth check count to allow future checks
      authCheckCount.current = 0;
    } catch (error: any) {
      console.error("[AuthContext] Login error:", error.message);
      setState((prev) => ({
        ...prev,
        error: error.message || "Invalid email or password",
        isLoading: false,
        isAuthenticated: false,
        authChecked: true,
      }));
      throw error;
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const registerUrl = `${API_URL}/api/v1/auth/register/`;
      
      if (process.env.NODE_ENV === "development") {
        console.log(`[AuthContext] Registering with email: ${credentials.email} to URL: ${registerUrl}`);
      }
      
      const response = await fetch(registerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
          first_name: credentials.firstName,
          last_name: credentials.lastName
        }),
        credentials: 'include', // Include cookies
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Registration failed");
      }
      
      const data = await response.json();

      // For backward compatibility with existing pages
      if (data.access && data.refresh) {
        setTokens(data.access, data.refresh);
        
        // Also store in localStorage for backward compatibility
        localStorage.setItem("accessToken", data.access);
        localStorage.setItem("refreshToken", data.refresh);
      }

      // Store user in localStorage for persistence
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      if (process.env.NODE_ENV === "development") {
        console.log(`[AuthContext] Registration successful for user: ${data.user.email}`);
      }

      setState({
        user: data.user,
        isLoading: false,
        error: null,
        isAuthenticated: true,
        authChecked: true,
      });
      
      // Reset auth check count to allow future checks
      authCheckCount.current = 0;
    } catch (error: any) {
      console.error("[AuthContext] Registration error:", error.message);
      setState((prev) => ({
        ...prev,
        error: error.message || "Registration failed",
        isLoading: false,
        isAuthenticated: false,
        authChecked: true,
      }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (process.env.NODE_ENV === "development") {
        console.log("[AuthContext] Logging out user");
      }
      
      await fetch(`${API_URL}/api/v1/auth/logout/`, {
        method: 'POST',
        credentials: 'include', // Include cookies
      });
      
      // Clear all auth-related items from localStorage
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("dashboard_session");
      
      setState({
        user: null,
        isLoading: false,
        error: null,
        isAuthenticated: false,
        authChecked: true,
      });
      
      // Reset auth check count to allow future checks
      authCheckCount.current = 0;
      
      router.push("/auth/login");
    } catch (error) {
      console.error("[AuthContext] Logout error:", error);
      // Still clear state on frontend even if server logout fails
      
      // Clear all auth-related items from localStorage
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("dashboard_session");
      
      setState({
        user: null,
        isLoading: false,
        error: null,
        isAuthenticated: false,
        authChecked: true,
      });
      
      // Reset auth check count to allow future checks
      authCheckCount.current = 0;
      
      router.push("/auth/login");
    }
  };

  // Helper function to get user from localStorage
  const getUserFromLocalStorage = (): User | null => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        return JSON.parse(storedUser);
      }
      return null;
    } catch (e) {
      console.error("Error parsing stored user:", e);
      return null;
    }
  };

  const value = {
    user: state.user,
    isLoading: state.isLoading,
    error: state.error,
    isAuthenticated: state.isAuthenticated,
    authChecked: state.authChecked,
    login,
    register,
    logout,
    checkAuth,
    getUserFromLocalStorage,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

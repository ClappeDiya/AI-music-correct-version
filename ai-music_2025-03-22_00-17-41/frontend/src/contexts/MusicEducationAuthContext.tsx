"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { parseCookies, setCookie } from 'nookies';

interface MusicEducationAuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  userId: number | null;
  error: string | null;
}

interface MusicEducationAuthContextType extends MusicEducationAuthState {
  checkAuthentication: () => Promise<boolean>;
  ensureAuthenticated: () => Promise<boolean>;
  syncAuthWithCookies: () => void;
}

const MusicEducationAuthContext = createContext<MusicEducationAuthContextType | null>(null);

export const MusicEducationAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<MusicEducationAuthState>({
    isAuthenticated: false,
    isLoading: true,
    token: null,
    userId: null,
    error: null,
  });
  
  const router = useRouter();

  // Sync client-side state with cookies for SSR compatibility
  const syncAuthWithCookies = useCallback(() => {
    const cookies = parseCookies();
    const accessToken = cookies.accessToken;
    
    if (accessToken) {
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: true,
        token: accessToken,
        isLoading: false,
      }));
      
      // Also store in localStorage for backward compatibility
      localStorage.setItem('auth_token', accessToken);
      return true;
    }
    
    // Try localStorage as fallback
    const localToken = localStorage.getItem('auth_token');
    if (localToken) {
      // Sync localStorage token to cookies for middleware compatibility
      setCookie(null, 'accessToken', localToken, {
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
      });
      
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: true,
        token: localToken,
        isLoading: false,
      }));
      return true;
    }
    
    setAuthState(prev => ({
      ...prev,
      isAuthenticated: false,
      token: null,
      isLoading: false,
    }));
    return false;
  }, []);

  // Verify token with backend
  const checkAuthentication = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // First sync with cookies to ensure we have the latest token state
      syncAuthWithCookies();
      
      // Get token from state or cookies
      const cookies = parseCookies();
      const token = authState.token || cookies.accessToken || localStorage.getItem('auth_token');
      
      if (!token) {
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          token: null,
          userId: null,
          error: null,
        });
        return false;
      }
      
      // Verify token with backend - added proper headers and improved error handling
      const headers = new Headers();
      headers.append('Authorization', token.startsWith('Bearer ') ? token : `Bearer ${token}`);
      headers.append('Content-Type', 'application/json');
      
      const response = await fetch('/api/v1/auth/verify/', {
        method: 'GET',
        headers: headers,
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Update cookies to ensure they're consistent
        setCookie(null, 'accessToken', token, {
          maxAge: 30 * 24 * 60 * 60, // 30 days
          path: '/',
        });
        
        // Also update localStorage for backward compatibility
        localStorage.setItem('auth_token', token);
        
        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          token,
          userId: data.user_id || null,
          error: null,
        });
        return true;
      } else {
        // Token might still be valid but server error occurred
        // Don't immediately clear tokens for non-401 responses
        if (response.status === 401) {
          // Only clear on explicit unauthorized
          localStorage.removeItem('auth_token');
          
          // Remove cookie
          setCookie(null, 'accessToken', '', {
            maxAge: -1,
            path: '/',
          });
          
          setAuthState({
            isAuthenticated: false,
            isLoading: false,
            token: null,
            userId: null,
            error: "Authentication failed",
          });
        } else {
          console.warn(`Auth verification failed with status: ${response.status}`);
          // For other errors, don't invalidate the token - may be server issue
          setAuthState(prev => ({
            ...prev,
            isLoading: false,
            error: `Server error: ${response.status}`,
            // Keep isAuthenticated as is
          }));
        }
        return false;
      }
    } catch (error) {
      console.error('Authentication check failed:', error);
      // Only change authentication state on network errors if we must
      // This prevents logout on temporary network issues
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: "Network error during authentication",
        // Don't change isAuthenticated on network errors
      }));
      return authState.isAuthenticated; // Return current auth state on network error
    }
  }, [authState.token, authState.isAuthenticated, syncAuthWithCookies]);

  // Ensure user is authenticated or redirect to login
  const ensureAuthenticated = useCallback(async () => {
    // First try to sync with cookies without backend check
    const hasCookieAuth = syncAuthWithCookies();
    
    // If cookie auth succeeded, we can return early
    if (hasCookieAuth) {
      return true;
    }
    
    // If not, perform a full backend check
    const isAuth = await checkAuthentication();
    if (!isAuth) {
      // Redirect to login
      router.push('/auth/login?redirect=/music_education');
    }
    return isAuth;
  }, [checkAuthentication, router, syncAuthWithCookies]);

  // Check authentication on component mount
  useEffect(() => {
    // First try quick sync with cookies
    syncAuthWithCookies();
    
    // Then verify with backend
    checkAuthentication();
  }, [checkAuthentication, syncAuthWithCookies]);

  const contextValue: MusicEducationAuthContextType = {
    ...authState,
    checkAuthentication,
    ensureAuthenticated,
    syncAuthWithCookies,
  };

  return (
    <MusicEducationAuthContext.Provider value={contextValue}>
      {children}
    </MusicEducationAuthContext.Provider>
  );
};

export function useMusicEducationAuth() {
  const context = useContext(MusicEducationAuthContext);
  if (!context) {
    throw new Error("useMusicEducationAuth must be used within MusicEducationAuthProvider");
  }
  return context;
}

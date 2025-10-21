import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { parseCookies, destroyCookie } from 'nookies';

// User interface
interface User {
  id: number;
  name: string;
  email: string;
  avatarUrl?: string;
  role?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  userId: number | null;
  user: User | null;
  isAdmin: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    token: null,
    userId: null,
    user: null,
    isAdmin: false,
  });
  
  const router = useRouter();

  // Fetch user data
  const fetchUserData = useCallback(async (token: string) => {
    try {
      const response = await fetch('/api/v1/users/me/', {
        method: 'GET',
        headers: {
          'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const userData = await response.json();
        return {
          id: userData.id,
          name: userData.name || `${userData.first_name || ''} ${userData.last_name || ''}`.trim(),
          email: userData.email,
          avatarUrl: userData.avatar_url,
          role: userData.role,
        };
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      return null;
    }
  }, []);

  // Check if user is authenticated
  const checkAuthentication = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      // Check for token in localStorage/sessionStorage
      let token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      
      // If not found in storage, check cookies (used by middleware)
      if (!token) {
        const cookies = parseCookies();
        token = cookies.accessToken;
      }
      
      if (!token) {
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          token: null,
          userId: null,
          user: null,
          isAdmin: false,
        });
        return false;
      }
      
      // Verify token with backend
      const response = await fetch('/api/v1/auth/verify/', {
        method: 'GET',
        headers: {
          'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const userData = await fetchUserData(token);
        const isAdmin = userData?.role === 'admin' || userData?.role === 'superuser';
        
        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          token,
          userId: data.user_id || null,
          user: userData,
          isAdmin,
        });
        return true;
      } else {
        // Token invalid, clear it
        localStorage.removeItem('auth_token');
        sessionStorage.removeItem('auth_token');
        
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          token: null,
          userId: null,
          user: null,
          isAdmin: false,
        });
        return false;
      }
    } catch (error) {
      console.error('Authentication check failed:', error);
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        token: null,
        userId: null,
        user: null,
        isAdmin: false,
      });
      return false;
    }
  }, [fetchUserData]);

  // Ensure user is authenticated or redirect to login
  const ensureAuthenticated = useCallback(async () => {
    const isAuth = await checkAuthentication();
    if (!isAuth) {
      // Redirect to login when not authenticated
      router.push('/auth/login');
    }
    return isAuth;
  }, [checkAuthentication, router]);

  // Logout function
  const logout = useCallback(() => {
    // Clear token from storage
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_token');
    
    // Clear cookies
    destroyCookie(null, 'accessToken');
    destroyCookie(null, 'refreshToken');
    destroyCookie(null, 'dashboard_session');
    
    // Reset auth state
    setAuthState({
      isAuthenticated: false,
      isLoading: false,
      token: null,
      userId: null,
      user: null,
      isAdmin: false,
    });
    
    // Optionally make a logout API call
    fetch('/api/v1/auth/logout/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }).catch(error => {
      console.error('Logout API call failed:', error);
    });
  }, []);

  // Check authentication on component mount
  useEffect(() => {
    checkAuthentication();
  }, [checkAuthentication]);

  return {
    ...authState,
    checkAuthentication,
    ensureAuthenticated,
    logout,
    user: authState.user, // Adding explicit user property
    isAdmin: authState.isAdmin, // Adding explicit isAdmin property
  };
}

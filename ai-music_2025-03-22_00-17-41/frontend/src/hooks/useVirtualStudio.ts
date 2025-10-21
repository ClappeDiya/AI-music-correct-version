/**
 * Virtual Studio Hook
 * 
 * This custom hook provides access to Virtual Studio features with centralized authentication.
 * It automatically checks for authentication status and provides the API interface.
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { virtualStudioApi } from '@/services/virtual_studio/api';
import Cookies from 'js-cookie';

export function useVirtualStudio() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Check authentication status when the hook is initialized
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // We'll do a simple check to see if we have a session cookie
        const hasSession = !!Cookies.get('dashboard_session');
        
        if (!hasSession) {
          // If no session, set not authenticated but don't redirect here
          // This lets the page component decide how to handle it
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }
        
        // If we have a session, we're good to use the API
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error checking authentication:', error);
        // In case of an error, we'll assume we're authenticated to prevent unnecessary redirects
        // The actual API calls will handle auth errors if they occur
        setIsAuthenticated(true);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [router]);
  
  return {
    api: virtualStudioApi,
    isLoading,
    isAuthenticated
  };
}

export default useVirtualStudio;

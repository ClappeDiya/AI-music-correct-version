import { useEffect, useState } from 'react';
import { useMusicEducationAuth } from '@/contexts/MusicEducationAuthContext';
import { musicEducationApi } from '@/services/music_education/api';

/**
 * Hook for managing API operations with authentication for Music Education
 * Ensures API calls are only made when authentication is confirmed
 */
export function useMusicEducationApi<T, P = any>(
  apiMethod: (...args: any[]) => Promise<T>,
  params?: P,
  immediate: boolean = true
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  
  const { isAuthenticated, syncAuthWithCookies } = useMusicEducationAuth();
  
  // Function to execute the API call
  const execute = async (...args: any[]): Promise<T | null> => {
    // Always sync auth state before making API calls
    syncAuthWithCookies();
    
    if (!isAuthenticated) {
      console.warn('Attempted API call without authentication');
      setIsError(true);
      setError(new Error('Authentication required'));
      return null;
    }
    
    setIsLoading(true);
    setIsError(false);
    setError(null);
    
    try {
      // Use provided args if available, otherwise use params
      const callArgs = args.length > 0 ? args : params ? [params] : [];
      const result = await apiMethod(...callArgs);
      setData(result);
      return result;
    } catch (err) {
      console.error('API call failed:', err);
      setIsError(true);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Run immediately if enabled and authenticated
  useEffect(() => {
    if (immediate && isAuthenticated) {
      execute();
    }
  }, [immediate, isAuthenticated]);
  
  return {
    data,
    isLoading,
    isError,
    error,
    execute,
    refresh: execute,
  };
}

// Specialized hooks for common operations
export function useEducatorsList(immediate = true) {
  return useMusicEducationApi(musicEducationApi.getEducators, undefined, immediate);
}

export function useCoursesList(immediate = true) {
  return useMusicEducationApi(musicEducationApi.getCourses, undefined, immediate);
}

export function useLearningPathsList(immediate = true) {
  return useMusicEducationApi(musicEducationApi.getLearningPaths, undefined, immediate);
}

export function useMentoringSessionsList(immediate = true) {
  return useMusicEducationApi(musicEducationApi.getMentoringSessions, undefined, immediate);
}

export function useAchievementsList(immediate = true) {
  return useMusicEducationApi(musicEducationApi.getAchievements, undefined, immediate);
}

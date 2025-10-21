'use client';

import { useState, useEffect } from 'react';

/**
 * Hook to safely handle hydration in components
 * Returns true when the component has been hydrated on the client
 * Use this in components that need to render differently on server vs client
 */
export function useHydration() {
  const [hydrated, setHydrated] = useState(false);
  
  useEffect(() => {
    // Update state to indicate we're now client-side and hydrated
    setHydrated(true);
  }, []);
  
  return hydrated;
}

/**
 * Hook to get a safe client-side only value that won't cause hydration mismatches
 * @param serverValue Value to use during server rendering
 * @param clientValueFn Function that returns the client-side value
 */
export function useClientValue<T>(serverValue: T, clientValueFn: () => T): T {
  const isHydrated = useHydration();
  
  // During server render or initial client render (before hydration)
  // return the safe server value
  if (!isHydrated) {
    return serverValue;
  }
  
  // After hydration, return the client value
  return clientValueFn();
} 
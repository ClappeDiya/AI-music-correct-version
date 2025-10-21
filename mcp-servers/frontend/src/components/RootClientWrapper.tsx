"use client";

import React, { useState, useEffect } from 'react';
import { ProjectProvider } from "@/contexts/ProjectContext";
import { removeBrowserExtensionAttributes } from '@/utils/hydrationFixes';

interface RootClientWrapperProps {
  children: React.ReactNode;
}

/**
 * Client component wrapper to include client-side providers
 * This structure allows us to use client components in the server component layout
 * 
 * Hydration handling has been added to fix issues caused by browser extensions
 * that add attributes like cz-shortcut-listen which break hydration
 */
export default function RootClientWrapper({ children }: RootClientWrapperProps) {
  // Use a ref to track whether we're mounted to avoid state updates during render
  const [mounted, setMounted] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Handle initial client-side hydration
  useEffect(() => {
    // Mark as mounted to render children
    setMounted(true);
    
    // Schedule DOM cleanup for browser extension attributes
    requestAnimationFrame(() => {
      removeBrowserExtensionAttributes();
      
      // Mark as fully hydrated after a short delay
      setTimeout(() => {
        setHydrated(true);
      }, 100);
    });
    
    // Return cleanup function to stop any observers when component unmounts
    return () => {
      if (typeof window !== 'undefined' && window.__hydrationFix?.observer) {
        window.__hydrationFix.observer.disconnect();
      }
    };
  }, []);
  
  // Setup global types for our hydration fix
  React.useEffect(() => {
    if (typeof window !== 'undefined' && !window.__hydrationFix) {
      window.__hydrationFix = {};
    }
  }, []);

  // Return a hidden div on the initial server-side render
  // This prevents hydration mismatches when browser extensions modify the DOM
  if (!mounted) {
    return <div style={{ visibility: 'hidden' }} suppressHydrationWarning>{children}</div>;
  }

  return (
    <ProjectProvider>
      <div 
        className={hydrated ? 'contents' : 'invisible'}
        suppressHydrationWarning
      >
        {children}
      </div>
    </ProjectProvider>
  );
} 
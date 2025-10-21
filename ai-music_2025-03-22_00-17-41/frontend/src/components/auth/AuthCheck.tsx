"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

// This component handles client-side authentication checks
export function AuthCheck() {
  const router = useRouter();
  const { checkAuth, isAuthenticated, isLoading } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const lastCheckRef = useRef<number>(0);
  const MIN_CHECK_INTERVAL = 5000; // Minimum 5 seconds between checks
  
  useEffect(() => {
    const verifyAuthentication = async () => {
      // Check if minimum time has passed since last verification
      const now = Date.now();
      if (now - lastCheckRef.current < MIN_CHECK_INTERVAL) {
        // Skip this check if we checked recently
        setIsChecking(false);
        return;
      }
      
      try {
        console.log("[AuthCheck] Verifying authentication with backend");
        
        // Update last check time
        lastCheckRef.current = now;
        
        // Use the AuthContext's checkAuth function to verify with backend
        const isAuthValid = await checkAuth();
        
        console.log("[AuthCheck] Authentication check result:", isAuthValid);
        
        if (!isAuthValid) {
          console.log("[AuthCheck] Not authenticated, redirecting to login");
          router.push("/auth/login");
        }
        
        setIsChecking(false);
      } catch (error) {
        console.error("[AuthCheck] Error during auth verification:", error);
        setIsChecking(false);
      }
    };
    
    // Only check if not already checking authentication in the context
    if (!isLoading) {
      verifyAuthentication();
    } else {
      // If already loading in the context, wait for it to complete
      if (!isAuthenticated && !isLoading) {
        router.push("/auth/login");
      }
      setIsChecking(false);
    }
  }, [router, checkAuth, isAuthenticated, isLoading]);
  
  // This component doesn't render anything visible
  return null;
}

export default AuthCheck;
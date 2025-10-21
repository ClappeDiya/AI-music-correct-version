"use client";

import { useEffect, useState } from "react";
import { useMusicEducationAuth } from "@/contexts/MusicEducationAuthContext";
import { MusicEducationDashboard } from "@/components/music_education/Dashboard";
import { Loader } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

/**
 * Client component for the Music Education dashboard
 * Handles authentication state and conditional rendering
 */
export default function MusicEducationClient() {
  const { 
    isAuthenticated, 
    isLoading, 
    ensureAuthenticated, 
    syncAuthWithCookies 
  } = useMusicEducationAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // First do a quick sync with cookies (no API call)
    syncAuthWithCookies();
    
    const checkAuth = async () => {
      try {
        // This will verify with the backend
        const isAuth = await ensureAuthenticated();
        // Only redirect if explicit authentication failure
        if (!isAuth) {
          setAuthError("Authentication required to access music education features");
        }
      } catch (error) {
        console.error("Error verifying authentication:", error);
        setAuthError("Error checking authentication status");
      } finally {
        setIsChecking(false);
      }
    };
    
    checkAuth();
  }, [ensureAuthenticated, syncAuthWithCookies]);

  // Handle manual login redirect
  const handleLogin = () => {
    router.push('/auth/login?redirect=/music_education');
  };

  // Show loading state
  if (isLoading || isChecking) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="flex flex-col items-center gap-2">
          <Loader className="h-8 w-8 animate-spin text-primary" />
          <p>Loading music education dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state if we have a specific auth error
  if (authError || !isAuthenticated) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold mb-4">Authentication Required</h2>
        <p className="mb-6">{authError || "Please log in to access the Music Education platform."}</p>
        <Button onClick={handleLogin}>Log In</Button>
      </div>
    );
  }

  // Show dashboard when authenticated
  return (
    <div className="container mx-auto py-6">
      <MusicEducationDashboard />
    </div>
  );
}

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function SyncUserPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading, checkAuth } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const redirectUrl = searchParams?.get("redirect_url") || "/dashboard";

  useEffect(() => {
    // Wait for auth to be loaded
    if (isLoading) return;

    // If not signed in, redirect to login
    if (!isAuthenticated) {
      console.log("User not signed in, redirecting to login...");
      router.push("/auth/login");
      return;
    }

    const syncUser = async () => {
      try {
        console.log("Starting user sync process...");
        
        // Get the access token from cookies (handled by AuthContext)
        console.log("Using access token from authentication context...");

        // Sync with backend
        const response = await fetch("/api/auth/verify-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Include cookies for auth
        });

        console.log("Backend response status:", response.status);
        const responseData = await response.json();
        console.log("Backend response data:", responseData);

        if (!response.ok) {
          throw new Error(responseData.error || "Failed to sync user");
        }

        console.log("Sync successful, redirecting to:", redirectUrl);
        router.push(redirectUrl);
      } catch (error) {
        console.error("Detailed sync error:", error);
        setError(
          error instanceof Error ? error.message : "An unknown error occurred",
        );
        // Only redirect to login if it's an authentication error
        if (error instanceof Error && error.message.includes("Unauthorized")) {
          router.push("/auth/login");
        }
      }
    };

    syncUser();
  }, [isLoading, isAuthenticated, checkAuth, router, redirectUrl]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <div className="text-red-500">Error: {error}</div>
        <button
          onClick={() => router.push("/auth/login")}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
        >
          Return to Login
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <p>Syncing your account, please wait...</p>
      <p className="text-sm text-gray-500">This may take a few seconds...</p>
    </div>
  );
}

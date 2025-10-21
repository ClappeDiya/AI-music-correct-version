"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function BillingPage() {
  const router = useRouter();
  const { checkAuth } = useAuth();
  
  useEffect(() => {
    const initializePage = async () => {
      try {
        // Verify authentication before redirecting
        await checkAuth();
        
        // Redirect to the main settings page with billing tab selected
        router.replace("/settings?tab=billing");
      } catch (error) {
        // If authentication fails, redirect to login
        router.replace("/auth/login?redirect_url=/settings?tab=billing");
      }
    };
    
    initializePage();
  }, [router, checkAuth]);
  
  return (
    <div className="flex h-[50vh] w-full items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Redirecting to billing settings...</p>
      </div>
    </div>
  );
} 
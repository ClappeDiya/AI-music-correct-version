"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the main settings page with profile tab selected
    router.push("/settings?tab=profile");
  }, [router]);
  
  return (
    <div className="flex h-[50vh] w-full items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Redirecting to profile settings...</p>
      </div>
    </div>
  );
} 
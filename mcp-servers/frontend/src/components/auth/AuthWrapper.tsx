"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function AuthWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Only redirect if authentication check has completed (not loading)
    // and the user is authenticated
    if (!isLoading && isAuthenticated) {
      console.log("[AuthWrapper] User is authenticated, redirecting to dashboard");
      router.push("/project/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  return <>{children}</>;
}

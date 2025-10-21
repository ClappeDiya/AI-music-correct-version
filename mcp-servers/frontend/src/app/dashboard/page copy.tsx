"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardContent from "@/components/DashboardContent";
import { Session } from "next-auth";

type Role = "user" | "admin";

interface CustomUser {
  id: string;
  email: string;
  name: string;
  roles: Role[];
}

interface CustomSession {
  user: CustomUser;
  expires: string;
  error?: string;
  authenticated?: boolean;
  accessToken?: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    let mounted = true;
    let retryTimeout: NodeJS.Timeout;

    const validateSession = async (retries = 3, delay = 1000) => {
      try {
        for (let attempt = 0; attempt < retries; attempt++) {
          try {
            console.log(
              `Validating session... (attempt ${attempt + 1}/${retries})`,
            );
            const response = await fetch("http://localhost:8000/auth/me/", {
              credentials: "include",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
              },
            });

            if (!response.ok) {
              const errorData = await response.text();
              console.error("Session validation failed:", {
                status: response.status,
                statusText: response.statusText,
                error: errorData,
              });
              throw new Error(`Session validation failed: ${response.status}`);
            }

            const userData = await response.json();
            console.log("Session validation successful:", userData);

            if (!userData.user?.email || !userData.authenticated) {
              throw new Error("Invalid session data");
            }

            if (mounted) {
              setSession(userData);
              setIsLoading(false);
            }
            return;
          } catch (error) {
            if (attempt === retries - 1) throw error;
            // Wait before retrying
            await new Promise((resolve) => {
              retryTimeout = setTimeout(
                resolve,
                delay * Math.pow(1.5, attempt),
              );
            });
          }
        }
      } catch (error) {
        console.error(
          "Session Error:",
          error instanceof Error ? error.message : "Unknown error",
        );
        if (mounted) {
          setIsLoading(false);
          router.replace("/auth/login");
        }
      }
    };

    validateSession();

    // Cleanup function
    return () => {
      mounted = false;
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [router]);

  if (isLoading)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        Validating session...
      </div>
    );

  if (!session?.user?.email) {
    router.replace("/auth/login");
    return null;
  }

  return <DashboardContent session={session as CustomSession} />;
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/components/ui/useToast";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  // Remove any callbackUrl query parameter from the URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has("callbackUrl")) {
      params.delete("callbackUrl");
      const newQuery = params.toString();
      const newUrl =
        window.location.pathname + (newQuery ? "?" + newQuery : "");
      router.replace(newUrl);
    }
  }, [router]);

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    const error = searchParams?.get("error");
    if (error) {
      try {
        const errorData = JSON.parse(decodeURIComponent(error));
        setErrors({ general: errorData.message });
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: errorData.message,
        });
      } catch (e) {
        setErrors({ general: "An error occurred during login" });
        toast({
          variant: "destructive",
          title: "Login Error",
          description: "An error occurred during login",
        });
      }
    }
  }, [searchParams, toast]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    setErrors({});

    try {
      console.log("Submitting login form...", formData.email);
      const result = await signIn("credentials", {
        redirect: false,
        callbackUrl: "/dashboard",
        email: formData.email,
        password: formData.password,
      });

      console.log("Login response:", result);

      if (!result) {
        throw new Error("No response from authentication server");
      }

      if (result.error) {
        console.error("Login error:", result.error);
        setErrors({ general: result.error });
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: result.error,
        });
        setIsLoading(false);
        return;
      }

      toast({
        title: "Success",
        description: "Login successful! Redirecting...",
      });

      // Poll for the session cookie to be established
      const waitForSession = async (retries = 20, delay = 500) => {
        for (let i = 0; i < retries; i++) {
          await new Promise((res) => setTimeout(res, delay));
          try {
            const resSession = await fetch("/api/auth/session");
            const sessionData = await resSession.json();
            console.log("Polling session data:", sessionData);
            if (sessionData && sessionData.user) {
              return true;
            }
          } catch (err) {
            console.error("Error fetching session data:", err);
          }
        }
        return false;
      };

      const hasSession = await waitForSession();
      if (hasSession) {
        window.location.href = "/dashboard";
      } else {
        toast({
          variant: "destructive",
          title: "Session Error",
          description: "Session could not be established. Please try again.",
        });
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      setErrors({ general: errorMessage });
      toast({
        variant: "destructive",
        title: "Login Error",
        description: errorMessage,
      });
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md p-6 space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Sign In</h1>
          <p className="text-muted-foreground">Welcome back to AI Music</p>
        </div>

        {errors.general && (
          <Alert variant="destructive" role="alert" aria-live="polite">
            <AlertDescription>{errors.general}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-sm text-destructive mt-1">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, password: e.target.value }))
              }
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
              aria-required="true"
              className={errors.password ? "border-destructive" : ""}
              disabled={isLoading}
            />
            {errors.password && (
              <p
                id="password-error"
                className="text-sm text-destructive"
                role="alert"
              >
                {errors.password}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
            aria-disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <div className="text-center text-sm">
          Don't have an account?{" "}
          <Button
            variant="link"
            className="p-0 h-auto font-semibold"
            onClick={() => router.push("/auth/register")}
            disabled={isLoading}
          >
            Create one
          </Button>
        </div>
      </Card>
    </div>
  );
}

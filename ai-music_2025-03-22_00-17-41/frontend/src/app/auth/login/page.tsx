"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Alert } from "@/components/ui/Alert";
import { useToast } from "@/components/ui/useToast";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams?.get("redirect_url") || "/project/dashboard";
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setError(null);
    setDebugInfo(null);

    try {
      // Get the API URL from environment or use default
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const loginUrl = `${apiUrl}/api/v1/auth/login/`;
      
      setDebugInfo(`Making direct API call to: ${loginUrl}`);
      
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include', // Include cookies for session authentication
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Invalid email or password');
      }
      
      const responseData = await response.json();
      
      setDebugInfo(`Login successful via direct API.
      User: ${JSON.stringify(responseData.user)}`);
      
      // Store user info in localStorage for persistence
      if (responseData.user) {
        localStorage.setItem("user", JSON.stringify(responseData.user));
      }
      
      // For backward compatibility, store tokens if provided in the response
      if (responseData.access && responseData.refresh) {
        localStorage.setItem("accessToken", responseData.access);
        localStorage.setItem("refreshToken", responseData.refresh);
      }
      
      toast({
        title: "Login successful", 
        description: "Welcome back!",
      });
      
      // Hard redirect to dashboard with forced page refresh
      setTimeout(() => {
        console.log("Login successful, redirecting to dashboard...");
        window.location.href = redirectUrl;
      }, 500);
      
    } catch (err: any) {
      console.error("Login failed:", err);
      const errorDetails = err.message || "Invalid email or password";
      setError(errorDetails);
      setDebugInfo(`Error during login: ${err.message}
      Status: ${err.response?.status}
      Data: ${JSON.stringify(err.response?.data || {})}`);
      
      toast({
        variant: "destructive",
        title: "Login failed",
        description: errorDetails,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <Link
              href="/auth/register"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              create a new account
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <Alert variant="destructive" className="mb-4">
              {error}
            </Alert>
          )}
          
          {debugInfo && (
            <div className="p-3 bg-gray-100 text-gray-700 text-xs rounded mb-4 overflow-auto max-h-48">
              <pre className="whitespace-pre-wrap">{debugInfo}</pre>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                className={errors.password ? "border-red-500" : ""}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </div>

          <div className="text-center">
            <Link
              href="/auth/forgot-password"
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              Forgot your password?
            </Link>
          </div>
          
          <div className="mt-4 text-center text-xs text-gray-500">
            Will redirect to: {redirectUrl}
          </div>
        </form>
      </div>
    </div>
  );
}

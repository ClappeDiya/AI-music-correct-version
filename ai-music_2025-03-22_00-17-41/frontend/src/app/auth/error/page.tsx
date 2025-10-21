"use client";

import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

const getErrorMessage = (error: string | null): string => {
  switch (error) {
    case "CredentialsSignin":
      return "Invalid email or password";
    case "OAuthAccountNotLinked":
      return "This account is already linked to another provider";
    case "OAuthSignin":
      return "Error signing in with provider";
    case "OAuthCallback":
      return "Error during authentication callback";
    case "EmailSignin":
      return "Error sending verification email";
    case "EmailCreateAccount":
      return "Error creating account";
    case "SessionRequired":
      return "Please sign in to access this page";
    case "Configuration":
      return "There is a problem with the server configuration";
    case "Default":
    default:
      return "An error occurred during authentication";
  }
};

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const errorType = searchParams?.get("error") ?? "Default";
  const errorMessage = getErrorMessage(errorType);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-bold mb-4 text-destructive text-center">
          Authentication Error
        </h1>
        <p className="text-muted-foreground text-center mb-6">{errorMessage}</p>
        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/auth/login">Try Again</Link>
          </Button>

          <div className="text-center">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}

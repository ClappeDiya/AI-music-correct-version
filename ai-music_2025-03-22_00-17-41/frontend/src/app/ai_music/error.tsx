"use client";

import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AlertCircle } from "lucide-react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("AI Music Generation Error:", error);
  }, [error]);

  return (
    <div className="container mx-auto py-8 space-y-8">
      <Card className="p-6 max-w-2xl mx-auto">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="p-3 bg-destructive/10 rounded-full">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>

          <h1 className="text-2xl font-semibold">Something went wrong</h1>

          <p className="text-muted-foreground">
            {error.message ||
              "An error occurred while generating music. Please try again."}
          </p>

          {error.digest && (
            <p className="text-sm text-muted-foreground">
              Error ID: {error.digest}
            </p>
          )}

          <div className="flex gap-4">
            <Button variant="outline" onClick={() => window.location.reload()}>
              Refresh Page
            </Button>

            <Button onClick={() => reset()}>Try Again</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

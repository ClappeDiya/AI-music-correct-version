"use client";

import { useEffect } from "react";
import { useToast } from "@/components/ui/usetoast";
import { AlertCircle } from "lucide-react";

interface ErrorBoundaryProps {
  error: Error;
  reset: () => void;
}

export function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  const { toast } = useToast();

  useEffect(() => {
    toast({
      title: "Error",
      description: error.message,
      variant: "destructive",
    });
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <AlertCircle className="h-12 w-12 text-destructive mb-4" />
      <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
      <p className="text-muted-foreground mb-4">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
      >
        Try again
      </button>
    </div>
  );
}

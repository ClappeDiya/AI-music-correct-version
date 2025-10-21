"use client";

import { useEffect } from "react";
import { useToast } from "@/components/ui/usetoast";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ErrorBoundaryProps {
  error: Error;
  reset: () => void;
  message?: string;
}

export function ErrorBoundary({ error, reset, message }: ErrorBoundaryProps) {
  const { toast } = useToast();

  useEffect(() => {
    toast({
      title: "Error",
      description: message || error.message,
      variant: "destructive",
    });
  }, [error, message]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-4">
      <AlertCircle className="h-12 w-12 text-destructive mb-4" />
      <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
      <p className="text-muted-foreground mb-4 text-center">
        {message || error.message}
      </p>
      <Button onClick={reset} variant="outline">
        Try again
      </Button>
    </div>
  );
}

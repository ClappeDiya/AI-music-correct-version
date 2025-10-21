"use client";

import { Button } from "@/components/ui/Button";
import { Play } from "lucide-react";
import { useToast } from "@/components/ui/usetoast";
import { useState } from "react";

interface PlayButtonProps {
  itemId: string;
}

export function PlayButton({ itemId }: PlayButtonProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handlePlay = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/analytics/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventType: "play",
          itemId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to track play event");
      }

      toast({
        title: "Play event tracked",
        description: "Your play has been recorded for analytics",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to track play event",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handlePlay}
      disabled={isLoading}
    >
      <Play className="h-4 w-4" />
    </Button>
  );
}

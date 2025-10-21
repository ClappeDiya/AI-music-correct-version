"use client";

import { Button } from "@/components/ui/Button";
import { Heart } from "lucide-react";
import { useToast } from "@/components/ui/usetoast";
import { useState } from "react";

interface LikeButtonProps {
  itemId: string;
  initialLiked?: boolean;
}

export function LikeButton({ itemId, initialLiked = false }: LikeButtonProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [liked, setLiked] = useState(initialLiked);

  const handleLike = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/analytics/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventType: liked ? "unlike" : "like",
          itemId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to track like event");
      }

      setLiked(!liked);
      toast({
        title: liked ? "Unliked" : "Liked",
        description: `Your ${liked ? "unlike" : "like"} has been recorded`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to track like event",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleLike} disabled={isLoading}>
      <Heart
        className={`h-4 w-4 ${liked ? "text-red-500 fill-red-500" : ""}`}
      />
    </Button>
  );
}

"use client";

import { Button } from "@/components/ui/Button";
import { UserPlus, UserMinus } from "lucide-react";
import { useToast } from "@/components/ui/usetoast";
import { useState } from "react";

interface FollowButtonProps {
  userId: string;
  initialFollowing?: boolean;
}

export function FollowButton({
  userId,
  initialFollowing = false,
}: FollowButtonProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [following, setFollowing] = useState(initialFollowing);

  const handleFollow = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/analytics/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventType: following ? "unfollow" : "follow",
          itemId: userId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to track follow event");
      }

      setFollowing(!following);
      toast({
        title: following ? "Unfollowed" : "Followed",
        description: `You ${following ? "unfollowed" : "followed"} this user`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to track follow event",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleFollow}
      disabled={isLoading}
    >
      {following ? (
        <UserMinus className="h-4 w-4" />
      ) : (
        <UserPlus className="h-4 w-4" />
      )}
    </Button>
  );
}

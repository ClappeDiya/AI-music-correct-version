"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { UserPlus, UserMinus } from "lucide-react";
import { useToast } from "@/components/ui/usetoast";

interface FollowButtonProps {
  targetUserId: string;
  initialIsFollowing: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
}

export function FollowButton({
  targetUserId,
  initialIsFollowing,
  onFollowChange,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFollow = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/social/follow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ target_user: targetUserId }),
      });

      if (!response.ok) throw new Error("Failed to update follow status");

      const newFollowState = !isFollowing;
      setIsFollowing(newFollowState);
      onFollowChange?.(newFollowState);

      toast({
        title: newFollowState ? "Following" : "Unfollowed",
        description: newFollowState
          ? "You will now see updates from this creator"
          : "You will no longer see updates from this creator",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update follow status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={isFollowing ? "outline" : "default"}
      size="sm"
      onClick={handleFollow}
      disabled={isLoading}
      className="flex items-center space-x-2"
    >
      {isFollowing ? (
        <>
          <UserMinus className="w-4 h-4" />
          <span>Unfollow</span>
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4" />
          <span>Follow</span>
        </>
      )}
    </Button>
  );
}

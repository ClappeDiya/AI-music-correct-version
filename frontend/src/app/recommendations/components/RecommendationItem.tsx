"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/usetoast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/componen../ui/card";
import { Skeleton } from "@/components/ui/Skeleton";

interface Recommendation {
  id: number;
  user_id: number;
  score: number;
  name: string;
  avatar_url?: string;
}

interface RecommendationItemProps {
  recommendation: Recommendation;
}

export default function RecommendationItem({
  recommendation,
}: RecommendationItemProps) {
  const { toast } = useToast();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFollow = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/recommendations/follow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          target_user: recommendation.user_id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to follow user");
      }

      setIsFollowing(true);
      toast({
        title: "Success",
        description: `You are now following ${recommendation.name}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to follow user",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto md:max-w-lg lg:max-w-xl">
      <CardContent className="flex flex-col md:flex-row items-center gap-4 p-4">
        <div className="flex items-center gap-4 flex-1">
          <Avatar className="w-12 h-12 md:w-16 md:h-16">
            <AvatarImage
              src={
                recommendation.avatar_url ||
                `/avatars/user-${recommendation.user_id}.jpg`
              }
            />
            <AvatarFallback>
              {recommendation.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-medium text-base md:text-lg">
              {recommendation.name || `User ${recommendation.user_id}`}
            </p>
            <p className="text-sm text-muted-foreground">
              Match score: {(recommendation.score * 100).toFixed(0)}%
            </p>
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" size="sm" className="flex-1 md:flex-none">
            View Profile
          </Button>
          <Button
            size="sm"
            onClick={handleFollow}
            disabled={isFollowing || isLoading}
            className="flex-1 md:flex-none"
          >
            {isLoading ? (
              <Skeleton className="h-4 w-12" />
            ) : isFollowing ? (
              "Following"
            ) : (
              "Follow"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

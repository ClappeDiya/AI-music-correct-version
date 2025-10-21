"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { Badge } from "@/components/ui/Badge";
import { Award, Trophy, Calendar, User, Share2, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { musicEducationApi } from "@/services/music_education_api";
import { toast } from "sonner";

interface SharedAchievement {
  id: number;
  title: string;
  description: string;
  type: string;
  unlockedAt: string;
  unlockedBy: {
    username: string;
    avatarUrl?: string;
  };
  requirements: string[];
  progress: number;
  reward?: {
    type: string;
    value: string;
  };
}

export default function SharedAchievementPage() {
  const params = useParams();
  const [achievement, setAchievement] = useState<SharedAchievement | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAchievement();
  }, [params.id]);

  const loadAchievement = async () => {
    try {
      const response = await musicEducationApi.getSharedAchievement(
        params.id as string,
      );
      setAchievement(response.data);
    } catch (error) {
      console.error("Failed to load achievement:", error);
      toast.error("Failed to load achievement");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-3xl py-8">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-8 bg-muted rounded w-3/4" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-2/3" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!achievement) {
    return (
      <div className="container max-w-3xl py-8">
        <Card>
          <CardContent className="py-8">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold">Achievement Not Found</h2>
              <p className="text-muted-foreground">
                The achievement you're looking for doesn't exist or has been
                removed.
              </p>
              <Button onClick={() => window.history.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-8 space-y-6">
      <Button
        variant="ghost"
        onClick={() => window.history.back()}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <span>{achievement.title}</span>
            </CardTitle>
            <Badge variant="secondary">
              {achievement.type.charAt(0).toUpperCase() +
                achievement.type.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">{achievement.description}</p>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>Unlocked by {achievement.unlockedBy.username}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>
                {new Date(achievement.unlockedAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(achievement.progress)}%</span>
            </div>
            <Progress value={achievement.progress} className="h-2" />
          </div>

          {achievement.requirements.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Requirements:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                {achievement.requirements.map((req, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {achievement.reward && (
            <div className="pt-2 border-t">
              <p className="text-sm font-medium flex items-center space-x-1">
                <Award className="w-4 h-4 text-yellow-500" />
                <span>Reward: {achievement.reward.value}</span>
              </p>
            </div>
          )}

          <div className="flex justify-center pt-4">
            <Button
              onClick={() => {
                const shareUrl = window.location.href;
                navigator.clipboard.writeText(shareUrl);
                toast.success("Share link copied to clipboard");
              }}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share Achievement
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

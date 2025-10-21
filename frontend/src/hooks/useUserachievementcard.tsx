"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import { Award, Lock, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserAchievementCardProps {
  achievement: {
    id: number;
    title: string;
    description: string;
    type: "bronze" | "silver" | "gold" | "platinum";
    progress: number;
    requirements: string[];
    isUnlocked: boolean;
  };
  className?: string;
}

export function UserAchievementCard({
  achievement,
  className,
}: UserAchievementCardProps) {
  const typeColors = {
    bronze: "text-orange-600",
    silver: "text-slate-400",
    gold: "text-yellow-500",
    platinum: "text-blue-400",
  };

  const progressColors = {
    bronze: "bg-orange-600",
    silver: "bg-slate-400",
    gold: "bg-yellow-500",
    platinum: "bg-blue-400",
  };

  return (
    <Card
      className={cn(
        "transition-all",
        achievement.isUnlocked ? "border-2 border-primary" : "opacity-75",
        className,
      )}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <span>{achievement.title}</span>
            {achievement.isUnlocked ? (
              <Trophy className={cn("w-5 h-5", typeColors[achievement.type])} />
            ) : (
              <Lock className="w-4 h-4 text-muted-foreground" />
            )}
          </CardTitle>
          {achievement.type === "platinum" && achievement.isUnlocked && (
            <Award className="w-6 h-6 text-blue-400" />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {achievement.description}
        </p>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{Math.round(achievement.progress)}%</span>
          </div>
          <Progress
            value={achievement.progress}
            className="h-2"
            indicatorClassName={cn(
              progressColors[achievement.type],
              "transition-all",
            )}
          />
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
      </CardContent>
    </Card>
  );
}

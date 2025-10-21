"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { Badge } from "@/components/ui/Badge";
import {
  Award,
  BookOpen,
  Crown,
  Flag,
  GraduationCap,
  Medal,
  Music,
  Share2,
  Star,
  Trophy,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Achievement {
  id: number;
  title: string;
  description: string;
  type: "milestone" | "skill" | "social" | "special";
  category: string;
  icon: keyof typeof ACHIEVEMENT_ICONS;
  progress: number;
  isUnlocked: boolean;
  unlockedAt?: string;
  requirements: string[];
  reward?: {
    type: string;
    value: string;
  };
}

const ACHIEVEMENT_ICONS = {
  award: Award,
  book: BookOpen,
  crown: Crown,
  flag: Flag,
  graduation: GraduationCap,
  medal: Medal,
  music: Music,
  star: Star,
  trophy: Trophy,
  users: Users,
} as const;

const ACHIEVEMENT_COLORS = {
  milestone: "text-purple-500",
  skill: "text-blue-500",
  social: "text-green-500",
  special: "text-yellow-500",
} as const;

interface AchievementShowcaseProps {
  achievements: Achievement[];
  onShare: (achievementId: number) => void;
}

export function AchievementShowcaseSection({
  achievements,
  onShare,
}: AchievementShowcaseProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = ["all", ...new Set(achievements.map((a) => a.category))];
  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;
  const totalProgress = (unlockedCount / achievements.length) * 100;

  const filteredAchievements = achievements.filter(
    (a) => selectedCategory === "all" || a.category === selectedCategory,
  );

  const handleShare = async (achievement: Achievement) => {
    if (!achievement.isUnlocked) return;

    try {
      await onShare(achievement.id);
      toast.success("Achievement shared successfully!");
    } catch (error) {
      toast.error("Failed to share achievement");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Achievements</h2>
          <p className="text-muted-foreground">
            {unlockedCount} of {achievements.length} achievements unlocked
          </p>
        </div>
        <Progress value={totalProgress} className="w-32" />
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map((achievement) => {
          const Icon = ACHIEVEMENT_ICONS[achievement.icon];
          return (
            <Card
              key={achievement.id}
              className={cn(
                "transition-all",
                achievement.isUnlocked
                  ? "border-2 border-primary"
                  : "opacity-75",
              )}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Icon
                      className={cn(
                        "w-5 h-5",
                        ACHIEVEMENT_COLORS[achievement.type],
                      )}
                    />
                    <span>{achievement.title}</span>
                  </CardTitle>
                  {achievement.isUnlocked && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleShare(achievement)}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
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
                      ACHIEVEMENT_COLORS[achievement.type],
                      "bg-current",
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

                {achievement.isUnlocked && achievement.unlockedAt && (
                  <Badge variant="outline" className="w-full justify-center">
                    Unlocked on{" "}
                    {new Date(achievement.unlockedAt).toLocaleDateString()}
                  </Badge>
                )}

                {achievement.reward && achievement.isUnlocked && (
                  <div className="pt-2 border-t">
                    <p className="text-sm font-medium flex items-center space-x-1">
                      <Trophy className="w-4 h-4 text-yellow-500" />
                      <span>Reward: {achievement.reward.value}</span>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

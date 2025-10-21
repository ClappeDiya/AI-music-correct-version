"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { LineChart } from "@/components/ui/LineChart";
import { Badge } from '@/components/ui/Badge';
import {
  Award,
  Trophy,
  Users,
  TrendingUp,
  Star,
  Medal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { musicEducationApi } from '@/services/music_education_api";

interface AchievementAnalytics {
  totalAchievements: number;
  unlockedAchievements: number;
  completionRate: number;
  recentUnlocks: {
    id: number;
    title: string;
    type: string;
    unlockedAt: string;
  }[];
  progressOverTime: {
    date: string;
    unlocked: number;
  }[];
  topAchievers: {
    userId: number;
    username: string;
    achievementCount: number;
    rank: number;
  }[];
}

export function AchievementAnalyticsSection() {
  const [analytics, setAnalytics] = useState<AchievementAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const response = await musicEducationApi.getAchievementAnalytics();
      setAnalytics(response);
    } catch (error) {
      console.error("Failed to load achievement analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !analytics) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted rounded w-1/4 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded w-full mb-4" />
                <div className="h-4 bg-muted rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Achievement Analytics</h2>
        <Badge variant="secondary" className="text-sm">
          {Math.round(analytics.completionRate * 100)}% Complete
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
              Total Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">
              {analytics.unlockedAchievements} / {analytics.totalAchievements}
            </div>
            <Progress
              value={(analytics.unlockedAchievements / analytics.totalAchievements) * 100}
              className="h-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
              Progress Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[150px]">
              <LineChart
                data={analytics.progressOverTime}
                title="Achievements Unlocked"
                lines={[
                  {
                    name: "Unlocked",
                    dataKey: "unlocked",
                    stroke: "#2563eb",
                  },
                ]}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Star className="w-5 h-5 mr-2 text-purple-500" />
              Recent Unlocks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.recentUnlocks.slice(0, 3).map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="truncate">{achievement.title}</span>
                  <Badge variant="outline" className="ml-2">
                    {new Date(achievement.unlockedAt).toLocaleDateString()}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Medal className="w-5 h-5 mr-2" />
            Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.topAchievers.map((achiever) => (
              <div
                key={achiever.userId}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-white",
                      {
                        "bg-yellow-500": achiever.rank === 1,
                        "bg-gray-400": achiever.rank === 2,
                        "bg-orange-500": achiever.rank === 3,
                        "bg-blue-500": achiever.rank > 3,
                      }
                    )}
                  >
                    {achiever.rank}
                  </div>
                  <span className="font-medium">{achiever.username}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-yellow-500" />
                  <span>{achiever.achievementCount}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 


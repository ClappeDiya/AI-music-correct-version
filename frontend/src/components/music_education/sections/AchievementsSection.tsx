"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Achievement, UserAchievement, musicEducationApi } from '@/services/music_education/api';
import { Award } from 'lucide-react';

export function AchievementsSection() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [achievementsResponse, userAchievementsResponse] = await Promise.all([
        musicEducationApi.getAchievements(),
        musicEducationApi.getUserAchievements(),
      ]);
      setAchievements(achievementsResponse);
      setUserAchievements(userAchievementsResponse);
    } catch (error) {
      console.error("Failed to load achievements:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const isAchieved = (achievementId: number) => {
    return userAchievements.some((ua) => ua.achievement === achievementId);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Your Achievements</h2>
        <p className="text-muted-foreground">Track your progress and unlock new achievements</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded w-full mb-4"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement) => {
            const achieved = isAchieved(achievement.id);
            const earnedAchievement = userAchievements.find(
              (ua) => ua.achievement === achievement.id
            );

            return (
              <Card
                key={achievement.id}
                className={achieved ? "border-primary" : "opacity-75"}
              >
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Award
                      className={`w-5 h-5 ${
                        achieved ? "text-primary" : "text-muted-foreground"
                      }`}
                    />
                    <CardTitle className="text-lg">{achievement.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    {achievement.description}
                  </p>
                  {achieved && earnedAchievement && (
                    <p className="text-xs text-primary">
                      Earned on{" "}
                      {new Date(earnedAchievement.earned_at).toLocaleDateString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
} 

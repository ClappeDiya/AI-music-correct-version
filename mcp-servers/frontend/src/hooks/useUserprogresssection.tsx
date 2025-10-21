"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { BookOpen, Clock, Award, Target } from "lucide-react";
import { musicEducationApi } from "@/services/music_education/api";
import { toast } from "sonner";
import { UserProgressCard } from "@/components/music-education/cards/UserProgressCard";
import { UserActivityList } from "@/components/music-education/lists/user-activity-list";
import { UserProgressChart } from "@/components/music-education/charts/user-progress-chart";
import { UserProgressSection } from "@/types/progress";

interface UserProgress {
  total_courses_enrolled: number;
  completed_courses: number;
  total_lessons_completed: number;
  total_time_spent: number;
  achievements_earned: number;
  total_achievements: number;
  average_quiz_score: number;
  learning_streak: number;
  recent_activities: Array<{
    date: string;
    activity_type: string;
    details: string;
  }>;
  progress_history: Array<{
    date: string;
    lessons_completed: number;
    quiz_score: number;
    practice_time: number;
  }>;
}

export function UserProgressSection() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const response = await musicEducationApi.getUserProgress();
      setProgress(response.data);
    } catch (error) {
      console.error("Failed to load user progress:", error);
      toast.error("Failed to load progress data");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="h-8 bg-muted rounded w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-[300px] bg-muted rounded" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!progress) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No progress data available.</p>
        </CardContent>
      </Card>
    );
  }

  const courseProgress =
    (progress.completed_courses / progress.total_courses_enrolled) * 100;
  const achievementProgress =
    (progress.achievements_earned / progress.total_achievements) * 100;

  const chartData = progress.progress_history.map((entry) => ({
    date: formatDate(entry.date),
    lessons: entry.lessons_completed,
    quizScore: entry.quiz_score,
    practiceTime: Math.round(entry.practice_time / 60), // Convert to hours
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <UserProgressCard
          title="Course Progress"
          value={`${progress.completed_courses} / ${progress.total_courses_enrolled}`}
          icon={BookOpen}
          iconColor="text-blue-500"
          progress={courseProgress}
          subtitle={`${courseProgress.toFixed(1)}% Complete`}
        />
        <UserProgressCard
          title="Learning Time"
          value={formatDuration(progress.total_time_spent)}
          icon={Clock}
          iconColor="text-green-500"
          subtitle={`${progress.learning_streak} day streak`}
        />
        <UserProgressCard
          title="Achievements"
          value={`${progress.achievements_earned} / ${progress.total_achievements}`}
          icon={Award}
          iconColor="text-yellow-500"
          progress={achievementProgress}
          subtitle={`${achievementProgress.toFixed(1)}% Unlocked`}
        />
        <UserProgressCard
          title="Quiz Performance"
          value={`${progress.average_quiz_score.toFixed(1)}%`}
          icon={Target}
          iconColor="text-purple-500"
          progress={progress.average_quiz_score}
          subtitle="Average Score"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <UserProgressChart data={chartData} className="lg:col-span-2" />
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Recent Activity</h3>
            <UserActivityList activities={progress.recent_activities} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function useUserProgressSection(userId: string) {
  const [sectionData, setSectionData] = useState<UserProgressSection | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSectionData = async () => {
      try {
        const response = await fetch(`/api/users/${userId}/progress/section`);
        if (!response.ok) {
          throw new Error("Failed to fetch progress section data");
        }
        const data = await response.json();
        setSectionData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchSectionData();
    }
  }, [userId]);

  return { sectionData, loading, error };
}

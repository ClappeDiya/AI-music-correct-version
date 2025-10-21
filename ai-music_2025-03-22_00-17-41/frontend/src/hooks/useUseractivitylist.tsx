"use client";

import { useState, useEffect } from "react";
import { UserActivity } from "@/types/activity";
import { BookOpen, Music, GraduationCap, Star } from "lucide-react";

interface Activity {
  date: string;
  activity_type: string;
  details: string;
}

interface UserActivityListProps {
  activities: Activity[];
}

export function UserActivityList({ activities }: UserActivityListProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "lesson":
        return <BookOpen className="w-4 h-4 text-blue-500" />;
      case "practice":
        return <Music className="w-4 h-4 text-green-500" />;
      case "quiz":
        return <GraduationCap className="w-4 h-4 text-purple-500" />;
      case "achievement":
        return <Star className="w-4 h-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <div key={index} className="flex items-start space-x-3">
          <div className="mt-1">{getActivityIcon(activity.activity_type)}</div>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium">{activity.details}</p>
            <p className="text-xs text-muted-foreground">
              {formatDate(activity.date)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function useUserActivityList(userId: string) {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch(`/api/users/${userId}/activities`);
        if (!response.ok) {
          throw new Error("Failed to fetch user activities");
        }
        const data = await response.json();
        setActivities(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchActivities();
    }
  }, [userId]);

  return { activities, loading, error };
}

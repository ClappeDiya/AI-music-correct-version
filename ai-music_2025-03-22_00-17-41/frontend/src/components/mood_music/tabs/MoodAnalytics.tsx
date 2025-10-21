"use client";

import { Card } from "@/components/ui/Card";
import { MoodAnalyticsService, UserMoodAnalytics } from "@/lib/api/services/mood-analytics";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Custom hook for using mood analytics
const useMoodAnalytics = () => {
  const [analytics, setAnalytics] = useState<UserMoodAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUserAnalytics = async () => {
    setIsLoading(true);
    try {
      const response = await MoodAnalyticsService.getUserAnalytics();
      setAnalytics(response.data);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch analytics"));
      console.error("Error loading analytics:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    analytics,
    isLoading,
    error,
    fetchUserAnalytics,
  };
};

// Transform data for charts
const prepareMoodTrends = (analytics: UserMoodAnalytics | null) => {
  if (!analytics || !analytics.favorite_moods) return [];
  
  return analytics.favorite_moods.map((item: {
    mood_id: number;
    mood_name: string;
    usage_count: number;
    success_rate: number;
  }) => ({
    mood: item.mood_name,
    count: item.usage_count,
    accuracy: item.success_rate * 100,
  }));
};

export function MoodAnalytics() {
  const { analytics, isLoading, error, fetchUserAnalytics } = useMoodAnalytics();

  useEffect(() => {
    fetchUserAnalytics().catch(error => {
      console.error("Failed to load analytics:", error);
    });
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <p className="text-muted-foreground">Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <p className="text-muted-foreground">Error loading analytics...</p>
      </div>
    );
  }

  // Prepare data for charts
  const moodTrends = prepareMoodTrends(analytics);
  
  // Get favorite mood
  const favoriteMood = analytics?.favorite_moods && analytics.favorite_moods.length > 0 
    ? analytics.favorite_moods[0].mood_name 
    : "None";
    
  // Calculate average accuracy
  const averageAccuracy = analytics?.mood_accuracy?.overall_score 
    ? Math.round(analytics.mood_accuracy.overall_score * 100) 
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Total Tracks Generated
          </h3>
          <p className="text-3xl font-bold mt-2">{analytics?.total_tracks || 0}</p>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Average Mood Accuracy
          </h3>
          <p className="text-3xl font-bold mt-2">
            {averageAccuracy}%
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Most Used Mood
          </h3>
          <p className="text-3xl font-bold mt-2">{favoriteMood}</p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">Mood Generation Trends</h3>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={moodTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mood" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="count"
                fill="#8884d8"
                name="Number of Generations"
              />
              <Bar
                dataKey="accuracy"
                fill="#82ca9d"
                name="Average Accuracy (%)"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6">Recent Feedback</h3>
          <div className="space-y-4">
            {analytics?.recent_feedback && analytics.recent_feedback.length > 0 ? (
              analytics.recent_feedback.map((feedback) => (
                <Card key={feedback.track_id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{feedback.mood_name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {feedback.feedback_notes || "No comments provided"}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(feedback.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">No recent feedback available</p>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6">Improvement Areas</h3>
          <div className="space-y-4">
            {analytics?.improvement_suggestions && analytics.improvement_suggestions.length > 0 ? (
              analytics.improvement_suggestions.map((area, index) => (
                <Card key={index} className="p-4">
                  <h4 className="font-medium">{area.mood_name}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {area.suggestion}
                  </p>
                </Card>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">No improvement areas identified</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

import api from "../";

export interface MoodMetrics {
  track_id: string;
  play_count: number;
  skip_count: number;
  completion_rate: number;
  replay_rate: number;
  average_play_duration: number;
  created_at: string;
}

export interface MoodFeedbackMetrics {
  mood_id: number;
  mood_name: string;
  accuracy_score: number;
  total_feedback: number;
  common_issues: Array<{
    type: string;
    count: number;
    examples: string[];
  }>;
}

export interface UserMoodAnalytics {
  total_tracks: number;
  favorite_moods: Array<{
    mood_id: number;
    mood_name: string;
    usage_count: number;
    success_rate: number;
  }>;
  mood_accuracy: {
    overall_score: number;
    by_category: Record<string, number>;
  };
  recent_feedback: Array<{
    track_id: string;
    mood_name: string;
    feedback_type: string;
    feedback_notes?: string;
    created_at: string;
  }>;
  improvement_suggestions: Array<{
    mood_id: number;
    mood_name: string;
    suggestion: string;
    confidence: number;
  }>;
}

export interface TrackAnalytics {
  track_id: string;
  metrics: MoodMetrics;
  feedback: Array<{
    type: string;
    notes?: string;
    created_at: string;
  }>;
  mood_accuracy: {
    intended: {
      mood_id: number;
      mood_name: string;
      intensity: number;
    };
    perceived: {
      mood_id: number;
      mood_name: string;
      intensity: number;
      confidence: number;
    };
  };
}

export const MoodAnalyticsService = {
  // Get analytics for a specific track
  getTrackAnalytics: (trackId: string) =>
    api.get<TrackAnalytics>(`/api/mood-based-music/mood-analytics/tracks/${trackId}`),

  // Get aggregated user analytics
  getUserAnalytics: () =>
    api.get<UserMoodAnalytics>("/api/mood-based-music/mood-analytics/user"),

  // Get mood-specific metrics
  getMoodMetrics: (moodId: number) =>
    api.get<MoodFeedbackMetrics>(`/api/mood-based-music/mood-analytics/moods/${moodId}`),

  // Track user interaction with a track
  trackInteraction: (
    trackId: string,
    event: {
      type: "play" | "skip" | "replay" | "complete";
      duration?: number;
    },
  ) => api.post(`/api/mood-based-music/mood-analytics/tracks/${trackId}/interaction`, event),

  // Submit detailed mood feedback
  submitMoodFeedback: (
    trackId: string,
    feedback: {
      accuracy_rating: number;
      perceived_intensity: number;
      issues?: string[];
      notes?: string;
    },
  ) => api.post(`/api/mood-based-music/mood-analytics/tracks/${trackId}/feedback`, feedback),

  // Get AI model improvement suggestions
  getModelSuggestions: () =>
    api.get<{
      suggestions: Array<{
        mood_id: number;
        mood_name: string;
        current_accuracy: number;
        improvement_areas: string[];
      }>;
    }>("/api/mood-based-music/mood-analytics/model/suggestions"),
};

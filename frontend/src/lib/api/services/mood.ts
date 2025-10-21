import api from "../";
import type { ApiResponse } from "../";
import type { MoodParameters } from "@/components/mood-music/advanced-mood-controls";

export interface Mood {
  id: number;
  name: string;
  description: string;
  color?: string;
}

export interface MoodRequest {
  mood_id: number;
  intensity: number;
  parameters?: MoodParameters;
}

export interface GeneratedTrack {
  id: string;
  file_url: string;
  metadata: {
    duration?: number;
    emotional_timeline?: {
      time: number;
      intensity: number;
      emotion: string;
    }[];
    parameters?: MoodParameters;
    [key: string]: any;
  };
  created_at: string;
  version?: number;
}

export interface MoodFeedback {
  track_id: string;
  feedback_type: "like" | "dislike";
  feedback_notes?: string;
}

export interface MoodHistory {
  tracks: GeneratedTrack[];
  has_more: boolean;
  next_cursor?: string;
}

export interface MoodProfile {
  id: number;
  name: string;
  parameters: {
    mood_id?: number;
    intensity?: number;
    advanced_parameters?: MoodParameters;
    [key: string]: any;
  };
  usage_count?: number;
  is_trending?: boolean;
  created_at: string;
}

export interface CreateProfileRequest {
  name: string;
  parameters: MoodProfile["parameters"];
}

export const MoodService = {
  getMoods: () => api.get<Mood[]>("/api/mood-based-music/moods"),

  createMood: (mood: Partial<Mood>) => api.post<Mood>("/api/mood-based-music/moods", mood),

  generateTrack: (request: MoodRequest) =>
    api.post<GeneratedTrack>("/api/mood-based-music/mood-requests", request),

  getMoodHistory: (cursor?: string) =>
    api.get<MoodHistory>("/api/mood-based-music/mood-requests", {
      params: { cursor },
    }),

  submitFeedback: (feedback: MoodFeedback) =>
    api.post("/api/mood-based-music/mood-feedback", feedback),

  getTrackVersions: (trackId: string) =>
    api.get<GeneratedTrack[]>(`/api/mood-based-music/mood-requests/${trackId}/versions`),

  // Profile Management
  getUserProfiles: () => api.get<MoodProfile[]>("/api/mood-based-music/mood-profiles/user"),

  getTrendingProfiles: () =>
    api.get<MoodProfile[]>("/api/mood-based-music/mood-profiles/trending"),

  createProfile: (profile: CreateProfileRequest) =>
    api.post<MoodProfile>("/api/mood-based-music/mood-profiles", profile),

  deleteProfile: (profileId: number) =>
    api.delete(`/api/mood-based-music/mood-profiles/${profileId}`),

  applyProfile: (profileId: number) =>
    api.post(`/api/mood-based-music/mood-profiles/${profileId}/apply`),
};

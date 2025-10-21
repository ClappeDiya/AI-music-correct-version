export interface Track {
  id: number;
  title: string;
  artist: string | null;
  album: string | null;
  duration_seconds: number | null;
  genre: string | null;
  created_at: string;
  updated_at: string;
}

export interface AIDJSession {
  id: number;
  user: number;
  mood_settings: Record<string, any> | null;
  last_voice_command: string | null;
  updated_at: string;
}

export interface PlayHistory {
  id: number;
  user: number;
  track: number;
  played_at: string;
}

export interface Recommendation {
  id: number;
  user: number;
  recommendation_data: Record<string, any> | null;
  recommended_at: string;
}

export interface Feedback {
  id: number;
  user: number;
  track: number | null;
  recommendation: number | null;
  feedback_type: string | null;
  feedback_notes: string | null;
  created_at: string;
}

export interface SavedSet {
  id: number;
  user: number;
  set_name: string | null;
  track_list: Record<string, any> | null;
  created_at: string;
}

export type FeedbackType = "like" | "dislike" | "skip";

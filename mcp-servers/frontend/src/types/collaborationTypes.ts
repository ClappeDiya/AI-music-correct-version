export interface MoodPoint {
  timestamp: number;
  intensity: number;
  mood_type: string;
  transition_type: "linear" | "exponential" | "sudden" | "gradual";
}

export interface GenreWeight {
  genre: string;
  weight: number;
}

export interface Chord {
  root: string;
  quality: string;
  duration: number;
}

export interface TransitionPoint {
  start_time: number;
  duration: number;
  type: string;
  parameters: Record<string, any>;
}

export interface TimelineState {
  timestamp: number;
  mood_intensities: Record<string, MoodPoint[]>;
  active_genres: Record<string, number>;
  current_chord: string;
  next_chord: string;
  current_progression?: Chord[];
  upcoming_transition?: TransitionPoint;
}

export interface CreativeRole {
  id: number;
  session_id: string;
  user_id: number;
  role_type:
    | "mood_designer"
    | "genre_mixer"
    | "chord_progressionist"
    | "transition_designer";
  assigned_at: string;
}

export interface CollaborativeUpdate {
  type: "mood" | "genre" | "chord" | "transition";
  timestamp: number;
  user: number;
  data: Record<string, any>;
}

export interface MoodAnalysis {
  section_start: number;
  section_end: number;
  dominant_mood: string;
  mood_distribution: Record<string, number>;
  intensity_curve: number[];
  suggested_genres: string[];
}

export interface GenreTransition {
  transition_start: number;
  transition_end: number;
  source_genres: Record<string, number>;
  target_genres: Record<string, number>;
  suggested_techniques: Array<{
    name: string;
    description: string;
    compatibility_score: number;
    parameters: Record<string, any>;
  }>;
  compatibility_score: number;
}

export interface HarmonicAnalysis {
  progression_id: number;
  key: string;
  chord_functions: string[];
  tension_points: number[];
  resolution_suggestions: string[];
  genre_compatibility: Record<string, number>;
}

export interface VoiceModel {
  id: number;
  user: {
    id: string;
    username: string;
    name: string;
    avatar?: string;
  };
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  supported_languages: string[];
  settings: VoiceSettings;
  language_capabilities: Record<string, LanguageCapability>;
  emotion_profile: Record<string, number>;
  sample_url?: string;
  latest_analysis?: VoiceAnalysisResult;
}

export interface VoiceSample {
  id: number;
  file_url: string;
  duration: number;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface VoiceAnalysisResult {
  id: number;
  status: "pending" | "processing" | "completed" | "failed";
  progress_percentage: number;
  current_step?: string;
  estimated_time_remaining?: number;
  results?: {
    quality_score: number;
    similarity_score: number;
    recommendations: string[];
  };
  created_at: string;
  updated_at: string;
}

export interface VoiceSettings {
  effects: {
    reverb: {
      enabled: boolean;
      room_size: number;
      damping: number;
    };
    chorus: {
      enabled: boolean;
      rate: number;
      depth: number;
    };
    // Add other effects as needed
  };
}

export interface LanguageCapability {
  name: string;
  accent_strength: number;
  formality_level?: number;
  expressiveness?: number;
  gender_neutral?: boolean;
}

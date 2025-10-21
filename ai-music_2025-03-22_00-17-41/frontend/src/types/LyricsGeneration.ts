export interface Language {
  id: number;
  code: string;
  name: string;
  created_at: string;
}

export interface LLMProvider {
  id: number;
  name: string;
  provider_type: string;
  api_endpoint?: string;
  api_credentials?: Record<string, any>;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LyricInfluencer {
  id: number;
  name: string;
  style_tags?: Record<string, any>;
  created_at: string;
}

export interface LyricPrompt {
  id: number;
  user: string;
  provider: number;
  prompt_text: string;
  parameters?: Record<string, any>;
  language_code?: string;
  influencer?: number;
  created_at: string;
  track_id: number;
}

export interface LyricDraft {
  id: number;
  prompt: number;
  draft_content?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface LyricEdit {
  id: number;
  draft: number;
  edited_content?: string;
  edit_notes?: string;
  created_at: string;
}

export interface FinalLyrics {
  id: number;
  user: string;
  track_id: number;
  lyrics_content: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface LyricTimeline {
  id: number;
  final_lyrics: number;
  lyric_segment: string;
  start_time_seconds: number;
  end_time_seconds?: number;
  created_at: string;
}

export interface LyricVrArSettings {
  id: number;
  final_lyrics: number;
  vr_ar_config?: Record<string, any>;
  created_at: string;
}

export interface LyricSignature {
  id: number;
  final_lyrics: number;
  signature_hash: string;
  created_at: string;
}

export interface LyricAdaptiveFeedback {
  id: number;
  final_lyrics: number;
  event_type: string;
  event_details?: Record<string, any>;
  created_at: string;
}

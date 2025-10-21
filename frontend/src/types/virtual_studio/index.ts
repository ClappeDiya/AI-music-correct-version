export interface BaseModel {
  id: number;
  created_at: string;
}

export interface Instrument extends BaseModel {
  name: string;
  instrument_type: string | null;
  base_parameters: Record<string, any> | null;
  updated_at: string;
  created_by: number;
  is_public: boolean;
}

export interface Effect extends BaseModel {
  name: string;
  effect_type: string | null;
  base_parameters: Record<string, any> | null;
  updated_at: string;
  created_by: number;
  is_public: boolean;
}

export interface StudioSession extends BaseModel {
  user: number;
  session_name: string | null;
  description: string | null;
  updated_at: string;
  collaborators: number[];
  is_public: boolean;
}

export interface Track extends BaseModel {
  session: number;
  track_name: string | null;
  track_type: string | null;
  position: number | null;
}

export interface TrackInstrument extends BaseModel {
  track: number;
  instrument: number;
  parameters: Record<string, any> | null;
  created_by: number;
}

export interface TrackEffect extends BaseModel {
  track: number;
  effect: number;
  parameters: Record<string, any> | null;
  created_by: number;
}

export interface InstrumentPreset extends BaseModel {
  user: number;
  instrument: number;
  preset_name: string;
  preset_parameters: Record<string, any> | null;
  is_public: boolean;
}

export interface EffectPreset extends BaseModel {
  user: number;
  effect: number;
  preset_name: string;
  preset_parameters: Record<string, any> | null;
  is_public: boolean;
}

export interface SessionTemplate extends BaseModel {
  user: number;
  template_name: string;
  template_data: Record<string, any> | null;
  is_public: boolean;
}

export interface ExportedFile extends BaseModel {
  session: number;
  file_url: string;
  format: string;
  spatial_audio: boolean;
  cryptographic_signature: string | null;
  created_by: number;
}

export interface VrArSetting extends BaseModel {
  session: number;
  config: Record<string, any> | null;
  created_by: number;
}

export interface AiSuggestion extends BaseModel {
  session: number;
  suggestion_type: string | null;
  suggestion_data: Record<string, any> | null;
  applied: boolean;
  created_by: number;
}

export interface AdaptiveAutomationEvent extends BaseModel {
  session: number;
  event_type: string | null;
  event_details: Record<string, any> | null;
  created_by: number;
}

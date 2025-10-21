export interface VoiceModelVersion {
  id: number;
  voice_model: number;
  version_label: string;
  model_file_url: string | null;
  changes_notes: string | null;
  created_at: string;
}

export interface VoiceModelPermission {
  id: number;
  user: {
    id: number;
    username: string;
  };
  voice_model: number;
  consent_granted_at: string | null;
  consent_revoked_at: string | null;
  usage_scope: Record<string, any>;
}

export interface VoiceModelConsentScope {
  id: number;
  voice_model: number;
  scope_data: Record<string, any>;
  created_at: string;
}

export interface VoiceModelUsageLog {
  id: number;
  voice_model: number;
  used_in_context: string;
  details: Record<string, any>;
  created_at: string;
}

export interface VoiceModelAdaptiveEvent {
  id: number;
  voice_model: number;
  event_type: string;
  event_details: Record<string, any>;
  triggered_by: string;
  created_at: string;
}

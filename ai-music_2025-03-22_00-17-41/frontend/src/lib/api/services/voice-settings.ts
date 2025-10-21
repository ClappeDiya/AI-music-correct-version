import api from "../";
import type { ApiResponse } from "../";

export interface VoiceSettings {
  id: string;
  pitch: number;
  speed: number;
  volume: number;
  clarity: number;
  stability: number;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export const VoiceSettingsService = {
  getSettings: () => api.get<VoiceSettings>("/api/voice/settings"),

  updateSettings: (settings: Partial<VoiceSettings>) =>
    api.patch<VoiceSettings>("/api/voice/settings", settings),

  resetSettings: () => api.post<VoiceSettings>("/api/voice/settings/reset"),
};

import api from "../";
import type { ApiResponse } from "../";

export interface VoicePreset {
  id: string;
  name: string;
  settings: {
    pitch: number;
    speed: number;
    volume: number;
    clarity: number;
    stability: number;
  };
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export const VoicePresetService = {
  getPresets: () => api.get<VoicePreset[]>("/api/voice/presets"),

  createPreset: (preset: Partial<VoicePreset>) =>
    api.post<VoicePreset>("/api/voice/presets", preset),

  updatePreset: (presetId: string, updates: Partial<VoicePreset>) =>
    api.patch<VoicePreset>(`/api/voice/presets/${presetId}`, updates),

  deletePreset: (presetId: string) =>
    api.delete(`/api/voice/presets/${presetId}`),

  setDefaultPreset: (presetId: string) =>
    api.post<VoicePreset>(`/api/voice/presets/${presetId}/set-default`),
};

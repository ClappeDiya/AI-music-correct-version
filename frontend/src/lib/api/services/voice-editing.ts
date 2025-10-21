import api from "../";
import type { ApiResponse } from "../";

export interface VoiceEdit {
  id: string;
  voice_id: string;
  edit_type: "pitch" | "speed" | "volume" | "clarity";
  value: number;
  status: "pending" | "processing" | "completed" | "failed";
}

export const VoiceEditingService = {
  applyEdit: (voiceId: string, edit: Partial<VoiceEdit>) =>
    api.post<VoiceEdit>(`/api/voice/${voiceId}/edit`, edit),

  getEditStatus: (editId: string) =>
    api.get<VoiceEdit>(`/api/voice/edit/${editId}`),

  cancelEdit: (editId: string) => api.delete(`/api/voice/edit/${editId}`),
};

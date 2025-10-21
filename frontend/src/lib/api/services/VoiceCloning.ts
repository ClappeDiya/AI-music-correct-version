import api from "../";
import type { ApiResponse } from "../";

// Moving the content from src/services/api/voice_cloning.ts
export interface VoiceCloneRequest {
  audio_file: File;
  name: string;
  description?: string;
}

export interface VoiceCloneResponse {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  voice_id?: string;
  error?: string;
}

export const VoiceCloneService = {
  initiateCloning: (request: VoiceCloneRequest) => {
    const formData = new FormData();
    formData.append("audio_file", request.audio_file);
    formData.append("name", request.name);
    if (request.description) {
      formData.append("description", request.description);
    }

    return api.post<VoiceCloneResponse>("/api/voice/clone", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  getCloneStatus: (cloneId: string) =>
    api.get<VoiceCloneResponse>(`/api/voice/clone/${cloneId}`),
};

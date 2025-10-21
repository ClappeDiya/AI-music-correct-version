import api from "../";
import type { ApiResponse } from "../";

export interface VoiceApplication {
  id: string;
  voice_id: string;
  target_content: string;
  output_format: "mp3" | "wav" | "ogg";
  status: "pending" | "processing" | "completed" | "failed";
  result_url?: string;
}

export const VoiceApplicationService = {
  applyVoice: (
    voiceId: string,
    content: string,
    format: VoiceApplication["output_format"] = "mp3",
  ) =>
    api.post<VoiceApplication>(`/api/voice/${voiceId}/apply`, {
      target_content: content,
      output_format: format,
    }),

  getApplicationStatus: (applicationId: string) =>
    api.get<VoiceApplication>(`/api/voice/application/${applicationId}`),

  cancelApplication: (applicationId: string) =>
    api.delete(`/api/voice/application/${applicationId}`),
};

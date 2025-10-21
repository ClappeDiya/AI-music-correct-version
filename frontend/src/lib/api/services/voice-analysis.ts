import api from "../";
import type { ApiResponse } from "../";

export interface VoiceAnalysis {
  id: string;
  voice_id: string;
  metrics: {
    pitch: number;
    clarity: number;
    stability: number;
    emotion: string;
  };
  created_at: string;
}

export const VoiceAnalysisService = {
  analyzeVoice: (voiceId: string) =>
    api.post<VoiceAnalysis>(`/api/voice/${voiceId}/analyze`),

  getAnalysisResults: (analysisId: string) =>
    api.get<VoiceAnalysis>(`/api/voice/analysis/${analysisId}`),

  getVoiceHistory: (voiceId: string) =>
    api.get<VoiceAnalysis[]>(`/api/voice/${voiceId}/analysis-history`),
};

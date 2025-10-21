import axios from "axios";

const API_BASE_URL = "/api/ai_dj/voice_emotion"; // Updated path

export interface VoiceEmotionData {
  id: string;
  session: string;
  timestamp: string;
  emotion: string;
  confidence: number;
  pitch: number;
  tempo: number;
  energy: number;
  valence: number;
}

export interface EmotionStats {
  dominant_emotion: string;
  emotion_distribution: Record<string, number>;
  average_confidence: number;
  time_series_data: Array<{
    timestamp: string;
    emotion: string;
    confidence: number;
  }>;
}

class VoiceEmotionService {
  async getSessionEmotions(sessionId: string): Promise<VoiceEmotionData[]> {
    const response = await axios.get(`${API_BASE_URL}/data/`, {
      params: { session_id: sessionId },
    });
    return response.data;
  }

  async submitEmotionData(
    data: Partial<VoiceEmotionData>,
  ): Promise<VoiceEmotionData> {
    const response = await axios.post(`${API_BASE_URL}/data/`, data);
    return response.data;
  }

  async getEmotionStats(sessionId: string): Promise<EmotionStats> {
    const response = await axios.get(`${API_BASE_URL}/data/stats/`, {
      params: { session_id: sessionId },
    });
    return response.data;
  }

  async startVoiceRecognition(sessionId: string): Promise<{ status: string }> {
    const response = await axios.post(`${API_BASE_URL}/recognition/start/`, {
      session_id: sessionId,
    });
    return response.data;
  }

  async stopVoiceRecognition(sessionId: string): Promise<{ status: string }> {
    const response = await axios.post(`${API_BASE_URL}/recognition/stop/`, {
      session_id: sessionId,
    });
    return response.data;
  }
}

export const voiceEmotionService = new VoiceEmotionService();

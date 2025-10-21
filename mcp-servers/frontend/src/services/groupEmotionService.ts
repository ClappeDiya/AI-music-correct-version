import axios from "axios";

const API_BASE_URL = "/api/ai_dj/biometrics";

export interface GroupEmotionalState {
  id: string;
  session: string;
  timestamp: string;
  median_heart_rate: number | null;
  median_energy_level: number | null;
  median_stress_level: number | null;
  dominant_emotion: string;
  emotion_distribution: Record<string, number>;
  consensus_strength: number;
  participant_count: number;
}

export interface EmotionalPreference {
  id: string;
  user: string;
  session: string;
  emotion_weight: number;
  prefer_emotional_sync: boolean;
  emotion_influence_radius: number;
}

class GroupEmotionService {
  async getCurrentState(sessionId: string): Promise<GroupEmotionalState> {
    const response = await axios.get(
      `${API_BASE_URL}/group-state/current_state/`,
      {
        params: { session_id: sessionId },
      },
    );
    return response.data;
  }

  async calculateGroupState(sessionId: string): Promise<GroupEmotionalState> {
    const response = await axios.post(
      `${API_BASE_URL}/group-state/calculate_group_state/`,
      { session_id: sessionId },
    );
    return response.data;
  }

  async getEmotionalPreference(
    sessionId: string,
    userId: string,
  ): Promise<EmotionalPreference> {
    const response = await axios.get(`${API_BASE_URL}/emotional-preferences/`, {
      params: {
        session_id: sessionId,
        user_id: userId,
      },
    });
    return response.data[0]; // Get first matching preference
  }

  async updateEmotionalPreference(
    preferenceId: string,
    updates: Partial<EmotionalPreference>,
  ): Promise<EmotionalPreference> {
    const response = await axios.patch(
      `${API_BASE_URL}/emotional-preferences/${preferenceId}/`,
      updates,
    );
    return response.data;
  }

  async createEmotionalPreference(
    data: Omit<EmotionalPreference, "id">,
  ): Promise<EmotionalPreference> {
    const response = await axios.post(
      `${API_BASE_URL}/emotional-preferences/`,
      data,
    );
    return response.data;
  }
}

export const groupEmotionService = new GroupEmotionService();

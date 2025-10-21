import axios from "axios";

const API_BASE_URL = "/api/ai_dj/biometrics"; // Updated path

export interface BiometricData {
  id: string;
  device_name: string;
  device_type: string;
  timestamp: string;
  heart_rate: number;
  stress_level: number;
  energy_level: number;
  movement: number;
  mood: string;
}

export interface BiometricPreference {
  target_heart_rate?: number;
  target_energy_level?: number;
  stress_management: boolean;
  mood_matching: boolean;
}

class BiometricService {
  async getData(sessionId: string): Promise<BiometricData[]> {
    const response = await axios.get(`${API_BASE_URL}/data/`, {
      params: { session_id: sessionId },
    });
    return response.data;
  }

  async getLatestData(sessionId: string): Promise<BiometricData> {
    const response = await axios.get(`${API_BASE_URL}/data/latest/`, {
      params: { session_id: sessionId },
    });
    return response.data;
  }

  async updatePreferences(
    sessionId: string,
    preferences: Partial<BiometricPreference>,
  ): Promise<BiometricPreference> {
    const response = await axios.patch(
      `${API_BASE_URL}/preferences/${sessionId}/`,
      preferences,
    );
    return response.data;
  }
}

export const biometricService = new BiometricService();

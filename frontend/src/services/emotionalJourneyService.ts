import axios from "axios";

const API_BASE_URL = "/api/ai_dj/emotional_journey"; // Updated path

export interface JourneyPoint {
  id: string;
  position: number;
  energy_level: number;
  mood: string;
  duration: number;
  transition_type: string;
}

export interface EmotionalJourney {
  id: string;
  session: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  total_duration: number;
  is_template: boolean;
  is_active: boolean;
  points: JourneyPoint[];
  total_points: number;
  current_progress: number;
}

export interface JourneyAnalytics {
  id: string;
  journey: string;
  journey_name: string;
  peak_energy: number;
  average_energy: number;
  energy_variance: number;
  mood_transitions: Record<string, any>;
  user_feedback: Record<string, any>;
  completion_rate: number;
}

class EmotionalJourneyService {
  async getJourney(journeyId: string): Promise<EmotionalJourney> {
    const response = await axios.get(`${API_BASE_URL}/journeys/${journeyId}/`);
    return response.data;
  }

  async createJourney(
    data: Partial<EmotionalJourney>,
  ): Promise<EmotionalJourney> {
    const response = await axios.post(`${API_BASE_URL}/journeys/`, data);
    return response.data;
  }

  async updateJourney(
    journeyId: string,
    data: Partial<EmotionalJourney>,
  ): Promise<EmotionalJourney> {
    const response = await axios.patch(
      `${API_BASE_URL}/journeys/${journeyId}/`,
      data,
    );
    return response.data;
  }

  async startJourney(journeyId: string): Promise<EmotionalJourney> {
    const response = await axios.post(
      `${API_BASE_URL}/journeys/${journeyId}/start/`,
    );
    return response.data;
  }

  async pauseJourney(journeyId: string): Promise<EmotionalJourney> {
    const response = await axios.post(
      `${API_BASE_URL}/journeys/${journeyId}/pause/`,
    );
    return response.data;
  }

  async getAnalytics(journeyId: string): Promise<JourneyAnalytics> {
    const response = await axios.get(
      `${API_BASE_URL}/journeys/${journeyId}/analytics/`,
    );
    return response.data;
  }
}

export const emotionalJourneyService = new EmotionalJourneyService();

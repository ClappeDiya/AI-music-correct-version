import axios from "axios";

const API_BASE_URL = "/api/ai_dj/hybrid_dj";

export interface HumanDJPreference {
  id: string;
  user: string;
  preferred_bpm_range_min: number;
  preferred_bpm_range_max: number;
  preferred_transition_length: number;
  auto_suggestions_enabled: boolean;
  auto_transitions_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface TransitionPreset {
  id: string;
  name: string;
  created_by: string;
  effect_type: string;
  effect_type_display: string;
  duration: number;
  effect_parameters: Record<string, any>;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  key: string;
  duration: number;
  waveform_url: string;
}

export interface HumanDJAction {
  id: string;
  session: string;
  user: string;
  action_type: string;
  action_type_display: string;
  track?: Track;
  track_details?: Track;
  parameters: Record<string, any>;
  created_at: string;
}

export interface AIRecommendation {
  id: string;
  session: string;
  recommendation_type: string;
  recommendation_type_display: string;
  current_track: Track;
  current_track_details: Track;
  suggested_track?: Track;
  suggested_track_details?: Track;
  confidence_score: number;
  parameters: Record<string, any>;
  was_accepted: boolean | null;
  created_at: string;
}

class HybridDJService {
  // DJ Preferences
  async getPreferences(): Promise<HumanDJPreference> {
    const response = await axios.get(`${API_BASE_URL}/preferences/`);
    return response.data;
  }

  async updatePreferences(
    data: Partial<HumanDJPreference>,
  ): Promise<HumanDJPreference> {
    const response = await axios.patch(`${API_BASE_URL}/preferences/`, data);
    return response.data;
  }

  // Transition Presets
  async getPresets(): Promise<TransitionPreset[]> {
    const response = await axios.get(`${API_BASE_URL}/presets/`);
    return response.data;
  }

  async createPreset(
    data: Partial<TransitionPreset>,
  ): Promise<TransitionPreset> {
    const response = await axios.post(`${API_BASE_URL}/presets/`, data);
    return response.data;
  }

  async updatePreset(
    id: string,
    data: Partial<TransitionPreset>,
  ): Promise<TransitionPreset> {
    const response = await axios.patch(`${API_BASE_URL}/presets/${id}/`, data);
    return response.data;
  }

  async duplicatePreset(id: string): Promise<TransitionPreset> {
    const response = await axios.post(
      `${API_BASE_URL}/presets/${id}/duplicate/`,
    );
    return response.data;
  }

  // DJ Actions
  async recordAction(data: {
    session: string;
    action_type: string;
    track?: string;
    parameters: Record<string, any>;
  }): Promise<HumanDJAction> {
    const response = await axios.post(`${API_BASE_URL}/actions/`, data);
    return response.data;
  }

  async getSessionActions(sessionId: string): Promise<HumanDJAction[]> {
    const response = await axios.get(`${API_BASE_URL}/actions/`, {
      params: { session_id: sessionId },
    });
    return response.data;
  }

  async getSessionSummary(sessionId: string): Promise<{
    total_actions: number;
    actions_by_type: Record<string, number>;
    suggestions_accepted: number;
    suggestions_rejected: number;
  }> {
    const response = await axios.get(
      `${API_BASE_URL}/actions/session_summary/`,
      {
        params: { session_id: sessionId },
      },
    );
    return response.data;
  }

  // AI Recommendations
  async getPendingRecommendations(
    sessionId: string,
  ): Promise<AIRecommendation[]> {
    const response = await axios.get(
      `${API_BASE_URL}/recommendations/pending/`,
      {
        params: { session_id: sessionId },
      },
    );
    return response.data;
  }

  async acceptRecommendation(id: string): Promise<AIRecommendation> {
    const response = await axios.post(
      `${API_BASE_URL}/recommendations/${id}/accept/`,
    );
    return response.data;
  }

  async rejectRecommendation(
    id: string,
    reason?: string,
  ): Promise<AIRecommendation> {
    const response = await axios.post(
      `${API_BASE_URL}/recommendations/${id}/reject/`,
      { reason },
    );
    return response.data;
  }
}

export const hybridDjService = new HybridDJService();

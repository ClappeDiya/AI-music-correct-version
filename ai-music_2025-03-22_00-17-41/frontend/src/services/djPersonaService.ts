import axios from "axios";

const API_BASE_URL = "/api/ai_dj/dj_personas";

export interface DJPersona {
  id: string;
  name: string;
  description: string;
  created_by: string;
  is_preset: boolean;
  created_at: string;
  updated_at: string;
  voice_style: string;
  voice_style_display: string;
  transition_style: string;
  transition_style_display: string;
  curation_style: string;
  curation_style_display: string;
  energy_level: number;
  experimentalism: number;
  genre_diversity: number;
  commentary_frequency: number;
  trivia_frequency: number;
}

export interface PersonaBlendComponent {
  id: string;
  persona: DJPersona;
  weight: number;
}

export interface PersonaBlend {
  id: string;
  session: string;
  created_at: string;
  is_active: boolean;
  components: PersonaBlendComponent[];
}

export interface PersonaPreset {
  id: string;
  name: string;
  description: string;
  category: string;
  category_display: string;
  persona: DJPersona;
  is_public: boolean;
  created_at: string;
}

class DJPersonaService {
  // Persona Management
  async getPersonas(): Promise<DJPersona[]> {
    const response = await axios.get(`${API_BASE_URL}/personas/`);
    return response.data;
  }

  async createPersona(data: Partial<DJPersona>): Promise<DJPersona> {
    const response = await axios.post(`${API_BASE_URL}/personas/`, data);
    return response.data;
  }

  async updatePersona(
    id: string,
    data: Partial<DJPersona>,
  ): Promise<DJPersona> {
    const response = await axios.patch(`${API_BASE_URL}/personas/${id}/`, data);
    return response.data;
  }

  async duplicatePersona(id: string): Promise<DJPersona> {
    const response = await axios.post(
      `${API_BASE_URL}/personas/${id}/duplicate/`,
    );
    return response.data;
  }

  // Blend Management
  async getSessionBlends(sessionId: string): Promise<PersonaBlend[]> {
    const response = await axios.get(`${API_BASE_URL}/blends/`, {
      params: { session_id: sessionId },
    });
    return response.data;
  }

  async createBlend(data: {
    session: string;
    components: Array<{
      persona_id: string;
      weight: number;
    }>;
  }): Promise<PersonaBlend> {
    const response = await axios.post(`${API_BASE_URL}/blends/`, data);
    return response.data;
  }

  async updateBlend(
    id: string,
    data: Partial<PersonaBlend>,
  ): Promise<PersonaBlend> {
    const response = await axios.patch(`${API_BASE_URL}/blends/${id}/`, data);
    return response.data;
  }

  async activateBlend(id: string): Promise<PersonaBlend> {
    const response = await axios.post(`${API_BASE_URL}/blends/${id}/activate/`);
    return response.data;
  }

  async getActiveBlend(sessionId: string): Promise<PersonaBlend | null> {
    try {
      const response = await axios.get(`${API_BASE_URL}/blends/active_blend/`, {
        params: { session_id: sessionId },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  // Preset Management
  async getPresets(category?: string): Promise<PersonaPreset[]> {
    const response = await axios.get(`${API_BASE_URL}/presets/`, {
      params: category ? { category } : undefined,
    });
    return response.data;
  }

  async applyPresetToSession(
    presetId: string,
    sessionId: string,
  ): Promise<PersonaBlend> {
    const response = await axios.post(
      `${API_BASE_URL}/presets/${presetId}/apply_to_session/`,
      { session_id: sessionId },
    );
    return response.data;
  }
}

export const djPersonaService = new DJPersonaService();

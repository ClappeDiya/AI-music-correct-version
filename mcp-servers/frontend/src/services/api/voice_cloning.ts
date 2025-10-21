import { api } from '../api';

// Define the base types used in the voice cloning service
export interface ModelShare {
  id: number;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  permission: "view" | "edit" | "admin";
  created_at: string;
}

export interface VoiceModel {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  status: "training" | "ready" | "error";
  user: {
    id: string;
    name: string;
    avatar: string;
    username: string;
  };
  settings: Record<string, any>;
  supported_languages: string[];
  language_capabilities: Record<string, any>;
  emotion_profile?: any;
  latest_analysis?: any;
  shares?: ModelShare[];
}

// Define voice model event type
export interface VoiceModelAdaptiveEvent {
  id: number;
  model_id: number;
  type: "training" | "adaptation" | "error" | "update";
  description: string;
  created_at: string;
  metadata?: Record<string, any>;
}

// Generate mock data
function getMockVoiceModels(count: number = 3): VoiceModel[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Voice Model ${i + 1}`,
    created_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - i * 12 * 60 * 60 * 1000).toISOString(),
    status: ["training", "ready", "ready"][i % 3] as "training" | "ready" | "error",
    user: {
      id: `user${i + 1}`,
      name: ["Alice Smith", "Bob Johnson", "Carol Davis"][i % 3],
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(["Alice Smith", "Bob Johnson", "Carol Davis"][i % 3])}`,
      username: ["alice", "bob", "carol"][i % 3],
    },
    settings: {
      quality: 0.8,
      speed: 0.5,
      pitch_adjustment: 0,
      stability: 0.7,
      effects: {
        reverb: { enabled: false, roomSize: 0.5 },
        delay: { enabled: false, time: 0.3, feedback: 0.3 },
        filter: { enabled: false, cutoff: 1000, resonance: 1 },
        chorus: { enabled: false, rate: 1.5, depth: 0.7 },
        compressor: { enabled: false, threshold: -24, ratio: 3 },
        harmonizer: { enabled: false, pitch: 0 },
        distortion: { enabled: false, amount: 0.5 },
        modulation: { enabled: false, type: 'tremolo', frequency: 4, depth: 0.5 }
      },
      capabilities: {
        languages: [
          {
            code: "en-US",
            name: "English (US)",
            proficiency: 0.9,
            accent_strength: 0.2,
            is_native: true
          }
        ],
        effects: ["reverb", "delay", "filter", "chorus"],
        features: {
          emotion_control: true,
          accent_control: true
        }
      },
      consent: {
        usage_approved: true,
        data_retention: true,
        last_updated: new Date().toISOString()
      }
    },
    supported_languages: ["en", "es", "fr"].slice(0, (i % 3) + 1),
    language_capabilities: {
      en: { proficiency: 0.9, accent: "american" },
      es: { proficiency: 0.7, accent: "spain" },
      fr: { proficiency: 0.6, accent: "standard" },
    },
  }));
}

// Generate mock events for a model
function getMockVoiceModelEvents(modelId: number, count: number = 5): VoiceModelAdaptiveEvent[] {
  const eventTypes: ("training" | "adaptation" | "error" | "update")[] = ["training", "adaptation", "error", "update"];
  const descriptions = [
    "Model training initiated",
    "Voice characteristics analysis complete",
    "Adaptation to new accent patterns",
    "Failed to process audio input",
    "Model settings updated",
    "Quality optimization complete",
    "Language support expanded"
  ];
  
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    model_id: modelId,
    type: eventTypes[i % eventTypes.length],
    description: descriptions[i % descriptions.length],
    created_at: new Date(Date.now() - i * 12 * 60 * 60 * 1000).toISOString(),
    metadata: { 
      progress: Math.min(1, Math.random()),
      details: `Detail information for event ${i + 1}`
    }
  }));
}

// API methods for voice cloning
export const voiceCloning = {
  // Get all voice models for the current user
  getVoiceModels: async () => {
    try {
      // Uncomment this when the backend API is fixed
      // const response = await api.get('/api/voice_cloning/models/');
      // return response;
      
      console.warn("Using mock voice models - API endpoint returning errors");
      return {
        data: getMockVoiceModels(),
      };
    } catch (error) {
      console.warn("Using mock voice models - API endpoint not available");
      return {
        data: getMockVoiceModels(),
      };
    }
  },

  // Get a specific voice model by ID
  getVoiceModel: async (id: number) => {
    try {
      // Uncomment this when the backend API is fixed
      // const response = await api.get(`/api/voice_cloning/models/${id}/`);
      // return response;
      
      console.warn(`Using mock voice model for ID ${id} - API endpoint returning errors`);
      const models = getMockVoiceModels();
      const model = models.find(m => m.id === id) || models[0];
      return {
        data: model,
      };
    } catch (error) {
      console.warn(`Using mock voice model for ID ${id} - API endpoint not available`);
      const models = getMockVoiceModels();
      const model = models.find(m => m.id === id) || models[0];
      
      return {
        data: model,
      };
    }
  },

  // Start analysis of an audio file
  startAnalysis: async (formData: FormData) => {
    try {
      // Uncomment this when the backend API is fixed
      // const response = await fetch(`${api['baseURL']}/api/voice_cloning/analysis/start/`, {
      //   method: 'POST',
      //   body: formData,
      //   credentials: 'include',
      // });
      // return await response.json();
      
      console.warn("Using mock analysis - API endpoint returning errors");
      return {
        data: {
          id: Math.floor(Math.random() * 1000),
          status: "processing",
        },
      };
    } catch (error) {
      console.warn("Using mock analysis - API endpoint not available");
      return {
        data: {
          id: Math.floor(Math.random() * 1000),
          status: "processing",
        },
      };
    }
  },

  // Get analysis progress
  getAnalysisProgress: async (analysisId: number) => {
    try {
      // Uncomment this when the backend API is fixed
      // const response = await api.get(`/api/voice_cloning/analysis/${analysisId}/`);
      // return response;
      
      console.warn(`Using mock analysis progress for ID ${analysisId} - API endpoint returning errors`);
      return {
        data: {
          progress: Math.random(),
          status: "processing",
          message: "Processing voice characteristics...",
        },
      };
    } catch (error) {
      console.warn(`Using mock analysis progress for ID ${analysisId} - API endpoint not available`);
      return {
        data: {
          progress: Math.random(),
          status: "processing",
          message: "Processing voice characteristics...",
        },
      };
    }
  },

  // Get analysis results
  getAnalysisResults: async (analysisId: number) => {
    try {
      // Uncomment this when the backend API is fixed
      // const response = await api.get(`/api/voice_cloning/analysis/${analysisId}/results/`);
      // return response;
      
      console.warn(`Using mock analysis results for ID ${analysisId} - API endpoint returning errors`);
      return {
        data: {
          id: analysisId,
          completed: true,
          results: {
            pitch_range: [80, 240],
            speaking_rate: 4.2,
            clarity: 0.85,
            accent_markers: ["american", "western"],
            recommendations: ["Good pitch control", "Consider slower delivery for clarity"]
          }
        }
      };
    } catch (error) {
      console.warn(`Using mock analysis results for ID ${analysisId} - API endpoint not available`);
      return {
        data: {
          id: analysisId,
          completed: true,
          results: {
            pitch_range: [80, 240],
            speaking_rate: 4.2,
            clarity: 0.85,
            accent_markers: ["american", "western"],
            recommendations: ["Good pitch control", "Consider slower delivery for clarity"]
          }
        }
      };
    }
  },

  // Update voice model settings
  updateModelSettings: async (modelId: number, settings: any) => {
    try {
      // Uncomment this when the backend API is fixed
      // const response = await api.patch(`/api/voice_cloning/settings/${modelId}/`, settings);
      // return response;
      
      console.warn(`Using mock settings update for model ID ${modelId} - API endpoint returning errors`);
      return {
        data: { success: true },
      };
    } catch (error) {
      console.warn(`Using mock settings update for model ID ${modelId} - API endpoint not available`);
      return {
        data: { success: true },
      };
    }
  },

  // Delete a voice model
  deleteModel: async (modelId: number) => {
    try {
      // Uncomment this when the backend API is fixed
      // const response = await api.delete(`/api/voice_cloning/models/${modelId}/`);
      // return response;
      
      console.warn(`Using mock delete for model ID ${modelId} - API endpoint returning errors`);
      return { success: true };
    } catch (error) {
      console.warn(`Using mock delete for model ID ${modelId} - API endpoint not available`);
      return { success: true };
    }
  },

  // Get voice model events (history)
  getVoiceModelEvents: async (modelId: number) => {
    try {
      // Uncomment this when the backend API is fixed
      // const response = await api.get(`/api/voice_cloning/models/${modelId}/events/`);
      // return response;
      
      console.warn(`Using mock events for model ID ${modelId} - API endpoint returning errors`);
      return {
        data: getMockVoiceModelEvents(modelId),
      };
    } catch (error) {
      console.warn(`Using mock events for model ID ${modelId} - API endpoint not available`);
      return {
        data: getMockVoiceModelEvents(modelId),
      };
    }
  },

  // Share a voice model with another user
  shareModel: async (modelId: number, shareData: { user_email: string, permission: string }) => {
    try {
      // Uncomment this when the backend API is fixed
      // const response = await api.post(`/api/voice_cloning/models/${modelId}/share/`, shareData);
      // return response;
      
      console.warn(`Using mock share result for model ID ${modelId} - API endpoint returning errors`);
      return {
        data: {
          id: Math.floor(Math.random() * 1000),
          user: {
            id: `user${Math.floor(Math.random() * 100)}`,
            name: shareData.user_email.split('@')[0],
            email: shareData.user_email,
          },
          permission: shareData.permission,
          created_at: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.warn(`Using mock share result for model ID ${modelId} - API endpoint not available`);
      return {
        data: {
          id: Math.floor(Math.random() * 1000),
          user: {
            id: `user${Math.floor(Math.random() * 100)}`,
            name: shareData.user_email.split('@')[0],
            email: shareData.user_email,
          },
          permission: shareData.permission,
          created_at: new Date().toISOString(),
        },
      };
    }
  },

  // Remove a share from a voice model
  removeShare: async (modelId: number, shareId: number) => {
    try {
      // Uncomment this when the backend API is fixed
      // const response = await api.delete(`/api/voice_cloning/models/${modelId}/share/${shareId}/`);
      // return response;
      
      console.warn(`Using mock remove share result for model ID ${modelId}, share ID ${shareId} - API endpoint returning errors`);
      return { success: true };
    } catch (error) {
      console.warn(`Using mock remove share result for model ID ${modelId}, share ID ${shareId} - API endpoint not available`);
      return { success: true };
    }
  },
};
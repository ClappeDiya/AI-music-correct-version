import { api } from '../api';

export interface VoicePreviewResult {
  id: number;
  modelId: number;
  status: "generating" | "ready" | "error";
  progress: number;
  preview_url: string;
  url: string;
  duration: number;
  createdAt: string;
}

export interface VoiceApplicationConfig {
  modelId?: number;
  settings: {
    pitch_shift: number;
    tempo: number;
    volume: number;
    effects: string[];
  };
  emotion?: 'neutral' | 'happy' | 'sad' | 'excited' | 'angry';
  speed?: number;
  pitch?: number;
  clarity?: number;
  removeBackground?: boolean;
  enhanceQuality?: boolean;
}

class VoiceApplicationService {
  // Apply voice to content
  async applyVoice(
    config: VoiceApplicationConfig
  ): Promise<VoicePreviewResult> {
    try {
      const response = await api.post('/voice_cloning/apply/', {
        model_id: config.modelId,
        config
      });
      return response.data;
    } catch (error) {
      console.warn('Using mock voice application - API endpoint not available');
      // Create a mock response that matches VoicePreviewResult
      return {
        id: Math.floor(Math.random() * 1000),
        modelId: config.modelId || 1,
        status: "ready",
        progress: 100,
        preview_url: "https://example.com/preview.mp3",
        url: "https://example.com/preview.mp3",
        duration: 30,
        createdAt: new Date().toISOString()
      };
    }
  }

  // Get preview status
  async getPreviewStatus(previewId: number): Promise<VoicePreviewResult> {
    try {
      const response = await api.get(`/voice_cloning/preview/${previewId}/`);
      return response.data;
    } catch (error) {
      console.warn('Using mock preview status - API endpoint not available');
      // Create a mock preview status
      return {
        id: previewId,
        modelId: 1,
        status: "ready",
        progress: 100,
        preview_url: "https://example.com/preview.mp3",
        url: "https://example.com/preview.mp3",
        duration: 30,
        createdAt: new Date().toISOString()
      };
    }
  }

  // Get voice model capabilities
  async getModelCapabilities(modelId: number): Promise<any> {
    try {
      const response = await api.get(`/voice_cloning/models/${modelId}/capabilities/`);
      return response.data;
    } catch (error) {
      console.warn('Using mock capabilities - API endpoint not available');
      return {
        effects: ["reverb", "chorus", "distortion", "echo"],
        max_duration: 300,
        supported_emotions: ["neutral", "happy", "sad", "excited", "angry"]
      };
    }
  }
  
  // Process audio
  async processAudio(
    audioFile: File, 
    settings: VoiceApplicationConfig
  ): Promise<VoicePreviewResult> {
    try {
      const formData = new FormData();
      formData.append('audio', audioFile);
      formData.append('settings', JSON.stringify(settings));
      
      const response = await api.post('/voice_cloning/process/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.warn('Using mock process audio - API endpoint not available');
      return {
        id: Math.floor(Math.random() * 1000),
        modelId: settings.modelId || 1,
        status: "ready",
        progress: 100,
        preview_url: "https://example.com/processed.mp3",
        url: "https://example.com/processed.mp3",
        duration: 30,
        createdAt: new Date().toISOString()
      };
    }
  }
}

export const voiceApplication = new VoiceApplicationService();

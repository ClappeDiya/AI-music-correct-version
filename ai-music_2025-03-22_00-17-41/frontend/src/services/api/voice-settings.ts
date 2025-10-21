import { api } from '../api';

export interface LanguageCapability {
  code: string;
  name: string;
  proficiency?: number;
  accent_strength: number;
  is_native: boolean;
}

// Define effect types
export interface ReverbEffect {
  enabled: boolean;
  roomSize: number;
  decay?: number;
  wetLevel?: number;
  dryLevel?: number;
}

export interface DelayEffect {
  enabled: boolean;
  time: number;
  feedback: number;
  wetLevel?: number;
}

export interface FilterEffect {
  enabled: boolean;
  cutoff: number;
  resonance: number;
  filterType?: string;
}

export interface ChorusEffect {
  enabled: boolean;
  rate: number;
  depth: number;
  feedback?: number;
}

export interface CompressorEffect {
  enabled: boolean;
  threshold: number;
  ratio: number;
  attack?: number;
  release?: number;
}

export interface HarmonizerEffect {
  enabled: boolean;
  pitch: number;
  detune?: number;
  wetLevel?: number;
}

export interface DistortionEffect {
  enabled: boolean;
  amount: number;
  oversample?: string;
}

export interface ModulationEffect {
  enabled: boolean;
  type: string;
  frequency: number;
  depth: number;
}

export interface VoiceEffects {
  reverb: ReverbEffect;
  delay?: DelayEffect;
  filter?: FilterEffect;
  chorus?: ChorusEffect;
  compressor?: CompressorEffect;
  harmonizer?: HarmonizerEffect;
  distortion?: DistortionEffect;
  modulation?: ModulationEffect;
}

export interface VoiceCapabilities {
  languages: LanguageCapability[];
  effects: string[];
  features: Record<string, boolean>;
  real_time_enabled?: boolean;
}

export interface RealTimeSettings {
  quality: 'low' | 'medium' | 'high';
  latency: number;
  noise_reduction: boolean;
  echo_cancellation: boolean;
}

export interface VoiceSettings {
  id: number;
  voice_id: number;
  capabilities: VoiceCapabilities;
  effects: VoiceEffects;
  real_time_settings: RealTimeSettings;
  consent: {
    usage_approved: boolean;
    data_retention: boolean;
    last_updated: string;
  };
  configuration: Record<string, any>;
}

class VoiceSettingsService {
  // Get all settings for a voice
  async getSettings(voiceId: number): Promise<VoiceSettings> {
    try {
      const response = await api.get(`/api/voice_cloning/settings/${voiceId}/`);
      return response.data;
    } catch (error) {
      console.warn('Using mock voice settings - API endpoint not available');
      // Return mock data when API is not available
      return this.getMockSettings(voiceId);
    }
  }

  // Mock implementation to use during development
  getMockSettings(voiceId: number): VoiceSettings {
    return {
      id: 1,
      voice_id: voiceId,
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
      real_time_settings: {
        quality: 'medium',
        latency: 100,
        noise_reduction: true,
        echo_cancellation: true
      },
      consent: {
        usage_approved: true,
        data_retention: true,
        last_updated: new Date().toISOString()
      },
      configuration: {}
    };
  }

  // Update voice settings
  async updateSettings(
    voiceId: number, 
    settings: Partial<VoiceSettings>
  ): Promise<VoiceSettings> {
    try {
      const response = await api.patch(`/api/voice_cloning/settings/${voiceId}/`, settings);
      return response.data;
    } catch (error) {
      console.warn('Using mock update settings - API endpoint not available');
      // Return mock data when API is not available
      const mockSettings = this.getMockSettings(voiceId);
      return {
        ...mockSettings,
        ...settings
      };
    }
  }

  // Add a language capability to a voice
  async addLanguage(
    voiceId: number, 
    language: LanguageCapability
  ): Promise<VoiceSettings> {
    try {
      const response = await api.post(
        `/api/voice_cloning/settings/${voiceId}/languages/`, 
        language
      );
      return response.data;
    } catch (error) {
      console.warn('Using mock add language - API endpoint not available');
      // Return mock data when API is not available
      const mockSettings = this.getMockSettings(voiceId);
      mockSettings.capabilities.languages.push(language);
      return mockSettings;
    }
  }

  // Remove a language capability from a voice
  async removeLanguage(
    voiceId: number, 
    languageCode: string
  ): Promise<VoiceSettings> {
    try {
      const response = await api.delete(
        `/api/voice_cloning/settings/${voiceId}/languages/${languageCode}/`
      );
      return response.data;
    } catch (error) {
      console.warn('Using mock remove language - API endpoint not available');
      // Return mock data when API is not available
      const mockSettings = this.getMockSettings(voiceId);
      mockSettings.capabilities.languages = mockSettings.capabilities.languages.filter(
        lang => lang.code !== languageCode
      );
      return mockSettings;
    }
  }

  // Update voice effects
  async updateEffects(
    voiceId: number,
    effects: Partial<VoiceEffects>
  ): Promise<VoiceSettings> {
    try {
      const response = await api.patch(
        `/api/voice_cloning/settings/${voiceId}/effects/`,
        effects
      );
      return response.data;
    } catch (error) {
      console.warn('Using mock update effects - API endpoint not available');
      // Return mock data when API is not available
      const mockSettings = this.getMockSettings(voiceId);
      mockSettings.effects = {
        ...mockSettings.effects,
        ...effects
      };
      return mockSettings;
    }
  }

  // Update consent settings
  async updateConsent(
    voiceId: number, 
    consent: {
      usage_approved: boolean;
      data_retention: boolean;
    }
  ): Promise<VoiceSettings> {
    try {
      const response = await api.patch(
        `/api/voice_cloning/settings/${voiceId}/consent/`, 
        consent
      );
      return response.data;
    } catch (error) {
      console.warn('Using mock update consent - API endpoint not available');
      // Return mock data when API is not available
      const mockSettings = this.getMockSettings(voiceId);
      mockSettings.consent = {
        ...mockSettings.consent,
        ...consent,
        last_updated: new Date().toISOString()
      };
      return mockSettings;
    }
  }

  // Delete user voice data
  async deleteVoiceData(voiceId: number): Promise<void> {
    try {
      await api.delete(`/api/voice_cloning/settings/${voiceId}/data/`);
    } catch (error) {
      console.warn('Using mock delete voice data - API endpoint not available');
      // Just log in development - no actual deletion needed
      console.log(`[MOCK] Deleted voice data for voice ID ${voiceId}`);
    }
  }
}

export const voiceSettings = new VoiceSettingsService(); 
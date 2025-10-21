// Type declarations for voice-application module
declare module '@/services/api/voice-application' {
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
  
  export class VoiceApplicationService {
    applyVoice(config: VoiceApplicationConfig): Promise<VoicePreviewResult>;
    getPreviewStatus(previewId: number): Promise<VoicePreviewResult>;
    getModelCapabilities(modelId: number): Promise<any>;
    processAudio(audioFile: File, settings: VoiceApplicationConfig): Promise<VoicePreviewResult>;
  }
  
  export const voiceApplication: VoiceApplicationService;
}

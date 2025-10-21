export interface AIProvider {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  maxDuration: number;
  supportedFormats: string[];
  isAvailable: boolean;
  pricing: {
    basePrice: number;
    pricePerSecond: number;
    currency: string;
  };
  stats: {
    averageGenerationTime: number;
    successRate: number;
    totalGenerations: number;
  };
  limits: {
    maxPromptLength: number;
    maxConcurrentRequests: number;
    dailyRequestLimit: number;
  };
}

export interface GenerationRequest {
  id: string;
  userId: string;
  providerId: string;
  prompt: string;
  style?: string;
  mood?: string;
  instruments?: string[];
  duration: number;
  format: string;
  status: GenerationStatus;
  complexity?: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  error?: string;
}

export type GenerationStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";

export interface Track {
  id: string;
  requestId: string;
  url: string;
  duration: number;
  format: string;
  waveform: number[];
  metadata: {
    tempo: number;
    key: string;
    timeSignature: string;
    instruments: string[];
  };
}

export interface GenerationResult {
  success: boolean;
  request: GenerationRequest;
  track?: Track;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface ProviderStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageGenerationTime: number;
  totalGenerationTime: number;
  requestsByStatus: Record<GenerationStatus, number>;
}

export interface UserGenerationQuota {
  dailyLimit: number;
  remainingToday: number;
  totalGenerated: number;
  resetTime: string;
}

export interface GenerationPreferences {
  defaultProvider: string;
  preferredFormat: string;
  defaultDuration: number;
  defaultStyle?: string;
  defaultMood?: string;
  favoriteInstruments: string[];
  autoPlay: boolean;
  saveHistory: boolean;
}

export interface GenerationHistory {
  requests: GenerationRequest[];
  totalCount: number;
  successCount: number;
  failureCount: number;
  averageGenerationTime: number;
  mostUsedProvider: string;
  mostUsedStyle?: string;
  mostUsedMood?: string;
  favoriteInstruments: string[];
}

// API Response Types
export interface BaseResponse {
  success: boolean;
  error?: {
    code: string;
    message: string;
  };
}

export interface GenerationResponse extends BaseResponse {
  data?: {
    request: GenerationRequest;
  };
}

export interface GenerateTrackResponse extends BaseResponse {
  data?: {
    request: GenerationRequest;
  };
}

export interface GetGenerationHistoryResponse extends BaseResponse {
  data?: {
    history: GenerationHistory;
  };
}

export interface GetGenerationStatsResponse extends BaseResponse {
  data?: {
    stats: ProviderStats;
  };
}

export interface GetProvidersResponse extends BaseResponse {
  data?: {
    providers: AIProvider[];
  };
}

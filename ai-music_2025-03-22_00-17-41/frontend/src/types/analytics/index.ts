export interface BaseAnalytics {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface MixingAnalytics extends BaseAnalytics {
  userId: string;
  sessionId: string;
  eventType: "mix_started" | "mix_completed" | "mix_saved" | "mix_shared";
  duration: number;
  genreWeights: Record<string, number>;
  effectsUsed: string[];
  performanceMetrics: {
    cpuUsage: number;
    memoryUsage: number;
    latency: number;
  };
}

export interface GenreMixingSession extends BaseAnalytics {
  userId: string;
  status: "active" | "completed" | "failed";
  genres: Array<{
    id: string;
    weight: number;
  }>;
  duration: number;
  outputFormat: "wav" | "mp3" | "midi";
  analysisResults: {
    harmony: number;
    rhythm: number;
    melody: number;
  };
}

export interface PersonaFusion extends BaseAnalytics {
  userId: string;
  personaType: string;
  preferences: Record<string, any>;
  activeTimeframe: {
    start: string;
    end: string;
  };
  settings: Record<string, any>;
}

export interface BehaviorTriggeredOverlay extends BaseAnalytics {
  userId: string;
  triggerType: string;
  conditions: Record<string, any>;
  overlay: {
    type: string;
    content: any;
    style: Record<string, any>;
  };
  active: boolean;
}

export interface MultiUserComposite extends BaseAnalytics {
  users: string[];
  compositeType: string;
  weights: Record<string, number>;
  settings: Record<string, any>;
  status: "active" | "inactive";
}

export interface PredictivePreference extends BaseAnalytics {
  userId: string;
  modelVersion: string;
  predictions: Array<{
    category: string;
    score: number;
    confidence: number;
  }>;
  lastUpdated: string;
}

export interface PredictiveEvent extends BaseAnalytics {
  userId: string;
  eventType: string;
  prediction: {
    expected: any;
    actual: any;
    accuracy: number;
  };
  context: Record<string, any>;
}

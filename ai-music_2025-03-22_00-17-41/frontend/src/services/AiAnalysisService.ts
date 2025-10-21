import axios from "@/lib/axios";

// Type Definitions
export interface GenreImpact {
  melody: number;
  harmony: number;
  rhythm: number;
  timbre: number;
  dominantElements: string[];
}

export interface AIAnalysisResult {
  chordProgressions: {
    chords: string[];
    key: string;
    confidence: number;
  };
  rhythmicStructures: {
    tempo: number;
    timeSignature: string;
    rhythmicComplexity: number;
    grooveType: string;
  };
  timbralQualities: {
    brightness: number;
    warmth: number;
    texture: string;
    instrumentPresence: {
      [key: string]: number;
    };
  };
  emotionalCharacteristics: {
    energy: number;
    valence: number;
    tension: number;
    dominantMood: string;
  };
  genreImpacts: {
    [genreId: string]: GenreImpact;
  };
  interactionEffects: {
    genrePairs: {
      [key: string]: {
        compatibility: number;
        complementaryElements: string[];
        conflictingElements: string[];
      };
    };
    overallCoherence: number;
  };
}

export interface AnalysisUpdateCallback {
  (analysis: AIAnalysisResult): void;
}

export interface PerformanceMetrics {
  accuracy: number;
  rhythm: number;
  expression: number;
}

export interface DetailedAnalysis {
  pitch: {
    accuracy: number;
    consistency: number;
    range: string;
  };
  rhythm: {
    timing: number;
    steadiness: number;
    complexity: number;
  };
  expression: {
    dynamics: number;
    articulation: number;
    phrasing: number;
  };
  technicalAspects?: {
    intonation: number;
    breathing: number;
    posture: number;
  };
}

export interface AIFeedback {
  id: string;
  userId: string;
  timestamp: string;
  performanceMetrics: PerformanceMetrics;
  detailedAnalysis: DetailedAnalysis;
  feedback: string;
  strengths: string[];
  improvements: string[];
  suggestions: string[];
}

export interface AnalysisProgress {
  progress: number;
  currentStep: string;
  estimatedTimeRemaining?: number;
}

export interface AnalysisOptions {
  includeDetailedAnalysis?: boolean;
  realTimeFeedback?: boolean;
  privacyLevel?: "private" | "instructor" | "public";
}

// Merged Service Class
class AIAnalysisService {
  // Detailed service properties
  private socket: WebSocket | null = null;
  private analysisCallbacks: Map<string, (feedback: AIFeedback) => void> =
    new Map();
  private progressCallbacks: Map<string, (progress: AnalysisProgress) => void> =
    new Map();

  constructor() {
    this.initializeWebSocket();
  }

  private initializeWebSocket() {
    const wsUrl =
      process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws/analysis/";
    this.socket = new WebSocket(wsUrl);

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "analysis_progress") {
        const callback = this.progressCallbacks.get(data.analysisId);
        if (callback) {
          callback({
            progress: data.progress,
            currentStep: data.currentStep,
            estimatedTimeRemaining: data.estimatedTimeRemaining,
          });
        }
      } else if (data.type === "analysis_complete") {
        const callback = this.analysisCallbacks.get(data.analysisId);
        if (callback) {
          callback(data.feedback);
          this.analysisCallbacks.delete(data.analysisId);
          this.progressCallbacks.delete(data.analysisId);
        }
      }
    };

    this.socket.onclose = () => {
      setTimeout(() => this.initializeWebSocket(), 5000);
    };
  }

  // Simple service methods from the original AiAnalysisService.ts
  public async validateUserAccess(sessionId: string): Promise<boolean> {
    try {
      // Use axios instance without session check
      const response = await axios.get(`/api/permissions/mixing/${sessionId}`);
      return response.data.hasAccess;
    } catch (error) {
      console.error("Error validating access:", error);
      return false;
    }
  }

  public async startAnalysis(
    sessionId: string,
    callback: (analysis: AIAnalysisResult) => void,
  ): Promise<void> {
    try {
      // Fetch initial analysis
      const response = await axios.get(`/api/analysis/${sessionId}/latest`);
      if (response.data) {
        callback(response.data);
      }
    } catch (error) {
      console.error("Error starting analysis:", error);
    }
  }

  public async getLatestAnalysis(sessionId: string): Promise<AIAnalysisResult> {
    try {
      const response = await axios.get(`/api/analysis/${sessionId}/latest`);
      return response.data;
    } catch (error) {
      console.error("Error getting latest analysis:", error);
      return {} as AIAnalysisResult;
    }
  }

  public stopAnalysis(): void {
    // Close any sockets or other connections
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.close();
    }
  }

  // Detailed service methods from the merged file
  public async analyzePerformance(
    audioBlob: Blob,
    options: AnalysisOptions = {},
  ): Promise<string> {
    const formData = new FormData();
    formData.append("audio", audioBlob);
    formData.append("options", JSON.stringify(options));

    const response = await axios.post("/api/music_education/analyze", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data.analysisId;
  }

  public async analyzeMixingSession(
    sessionId: string,
    options: AnalysisOptions = {},
  ): Promise<string> {
    const response = await axios.post(
      `/api/music_education/mixing-sessions/${sessionId}/analyze`,
      { options },
    );
    return response.data.analysisId;
  }

  public onAnalysisProgress(
    analysisId: string,
    callback: (progress: AnalysisProgress) => void,
  ): void {
    this.progressCallbacks.set(analysisId, callback);
  }

  public onAnalysisComplete(
    analysisId: string,
    callback: (feedback: AIFeedback) => void,
  ): void {
    this.analysisCallbacks.set(analysisId, callback);
  }

  public async getFeedbackHistory(limit?: number): Promise<AIFeedback[]> {
    const response = await axios.get("/api/music_education/feedback", {
      params: { limit },
    });
    return response.data;
  }

  public async getDetailedAnalysis(
    feedbackId: string,
  ): Promise<DetailedAnalysis> {
    const response = await axios.get(
      `/api/music_education/feedback/${feedbackId}/detailed`,
    );
    return response.data;
  }

  public async updatePrivacySettings(
    feedbackId: string,
    privacyLevel: AnalysisOptions["privacyLevel"],
  ): Promise<void> {
    await axios.patch(`/api/music_education/feedback/${feedbackId}/privacy`, {
      privacyLevel,
    });
  }
}

export const aiAnalysisService = new AIAnalysisService();

// Voice analysis service for handling API requests related to voice analysis
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// Type definitions
export interface AnalysisProgress {
  progress_percentage: number;
  current_step: string;
  estimated_time_remaining: number; // in seconds
}

export interface VoiceAnalysisResult {
  timbre_score: number;
  pitch_analysis: {
    mean: number;
    range: [number, number];
    variation: number;
  };
  quality_metrics: {
    clarity: number;
    stability: number;
    expressiveness: number;
    volume: number;
  };
  cadence_metrics: {
    pause_patterns: number[];
    speaking_rate: number;
  };
}

// Create an API client
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
apiClient.interceptors.request.use(config => {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// Voice analysis API functions
export const voiceAnalysis = {
  // Get the status of an ongoing analysis
  getAnalysisStatus: async (analysisId: number): Promise<AnalysisProgress> => {
    // For development, return mock data
    // In production, this would make an actual API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          progress_percentage: Math.min(100, Math.random() * 100),
          current_step: ["timbre", "pitch", "cadence", "quality", "finalizing"][
            Math.floor(Math.random() * 5)
          ],
          estimated_time_remaining: Math.floor(Math.random() * 120), // 0-120 seconds
        });
      }, 500);
    });
    
    // Production code would be:
    // const response = await apiClient.get(`/voice_cloning/analysis/${analysisId}/progress/`);
    // return response.data;
  },

  // Get the results of a completed analysis
  getAnalysisResults: async (analysisId: number): Promise<VoiceAnalysisResult> => {
    // For development, return mock data
    // In production, this would make an actual API call
    return {
      timbre_score: 8.5,
      pitch_analysis: {
        mean: 220.5,
        range: [180.2, 260.7],
        variation: 0.65,
      },
      quality_metrics: {
        clarity: 0.85,
        stability: 0.75,
        expressiveness: 0.68,
        volume: 0.92,
      },
      cadence_metrics: {
        pause_patterns: [0.2, 0.5, 0.3, 0.1, 0.4, 0.6, 0.2, 0.1, 0.3, 0.4],
        speaking_rate: 3.2,
      },
    };
    
    // Production code would be:
    // const response = await apiClient.get(`/voice_cloning/analysis/${analysisId}/results/`);
    // return response.data;
  }
}; 
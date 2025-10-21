// Audio analysis service for processing and analyzing voice data
import axios from "axios";

// Fix for FFT module import to properly work with TypeScript
// @ts-ignore - Suppress TypeScript error for FFT import
const FFT = require("fft.js");

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

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

// Type definitions
export interface AudioAnalysisResult {
  // Basic audio properties
  duration: number;       // in seconds
  sampleRate: number;     // in Hz
  channels: number;       // 1 for mono, 2 for stereo
  
  // Analysis results
  frequencies: number[];  // array of frequency values
  amplitudes: number[];   // array of amplitude values
  formants: number[];     // array of formant frequencies
  pitch: number;          // fundamental frequency in Hz
  harmonics: number[];    // array of harmonic frequencies
  
  // Voice characteristics
  clarity: number;        // 0-1 scale
  stability: number;      // 0-1 scale
  timbre: number;         // 0-1 scale
  expressiveness: number; // 0-1 scale
  
  // Additional properties
  spectralCentroid: number;
  zeroCrossingRate: number;
}

/**
 * Client-side audio analyzer using Web Audio API
 */
export class AudioAnalyzer {
  private audioContext: AudioContext;
  private analyser: AnalyserNode;
  private fft: any;
  private bufferSize = 2048;

  constructor() {
    this.audioContext = new AudioContext();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = this.bufferSize;
    this.fft = new FFT(this.bufferSize);
  }

  async analyzeAudio(audioBuffer: AudioBuffer): Promise<Partial<AudioAnalysisResult>> {
    const floatData = audioBuffer.getChannelData(0);
    const frequencies = new Float32Array(this.bufferSize / 2);
    const amplitudes = new Float32Array(this.bufferSize);

    this.analyser.getFloatFrequencyData(frequencies);
    this.analyser.getFloatTimeDomainData(amplitudes);

    return {
      frequencies: Array.from(frequencies),
      amplitudes: Array.from(amplitudes),
      pitch: this.estimatePitch(floatData),
      formants: this.findFormants(frequencies),
      spectralCentroid: this.calculateSpectralCentroid(frequencies),
      zeroCrossingRate: this.calculateZeroCrossingRate(floatData),
    };
  }

  private estimatePitch(buffer: Float32Array): number {
    // Autocorrelation-based pitch detection
    const correlation = new Float32Array(this.bufferSize);
    for (let i = 0; i < this.bufferSize; i++) {
      for (let j = 0; j < this.bufferSize - i; j++) {
        correlation[i] += buffer[j] * buffer[j + i];
      }
    }

    // Find the peak after the first zero crossing
    let firstZeroCrossing = 0;
    while (
      correlation[firstZeroCrossing] > 0 &&
      firstZeroCrossing < correlation.length
    ) {
      firstZeroCrossing++;
    }

    let maxIndex = 0;
    for (let i = firstZeroCrossing; i < correlation.length; i++) {
      if (correlation[i] > correlation[maxIndex]) {
        maxIndex = i;
      }
    }

    return this.audioContext.sampleRate / maxIndex;
  }

  private findFormants(frequencies: Float32Array): number[] {
    // Find local maxima in the frequency spectrum
    const formants: number[] = [];
    for (let i = 1; i < frequencies.length - 1; i++) {
      if (
        frequencies[i] > frequencies[i - 1] &&
        frequencies[i] > frequencies[i + 1]
      ) {
        formants.push((i * this.audioContext.sampleRate) / this.bufferSize);
      }
    }
    return formants.slice(0, 3); // Return first 3 formants
  }

  private calculateSpectralCentroid(frequencies: Float32Array): number {
    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < frequencies.length; i++) {
      const frequency = (i * this.audioContext.sampleRate) / this.bufferSize;
      const magnitude = Math.pow(10, frequencies[i] / 20);
      numerator += frequency * magnitude;
      denominator += magnitude;
    }

    return numerator / denominator;
  }

  private calculateZeroCrossingRate(buffer: Float32Array): number {
    let zeroCrossings = 0;
    for (let i = 1; i < buffer.length; i++) {
      if (
        (buffer[i] >= 0 && buffer[i - 1] < 0) ||
        (buffer[i] < 0 && buffer[i - 1] >= 0)
      ) {
        zeroCrossings++;
      }
    }
    return zeroCrossings / buffer.length;
  }
}

// Mock data generator for development
function generateMockAnalysisResult(): AudioAnalysisResult {
  // Generate frequencies (power spectrum)
  const frequencies = Array.from({ length: 256 }, () => Math.random() * 100 - 100);
  
  // Generate amplitudes (waveform)
  const amplitudes = Array.from({ length: 256 }, () => Math.random() * 2 - 1);
  
  // Generate formants (resonant frequencies)
  const formants = [500 + Math.random() * 300, 1500 + Math.random() * 500, 2500 + Math.random() * 500];
  
  // Generate harmonics
  const pitch = 100 + Math.random() * 400;
  const harmonics = [pitch];
  for (let i = 2; i <= 5; i++) {
    harmonics.push(pitch * i);
  }
  
  return {
    duration: 30 + Math.random() * 30,
    sampleRate: 44100,
    channels: 1,
    frequencies,
    amplitudes,
    formants,
    pitch,
    harmonics,
    clarity: Math.random(),
    stability: Math.random(),
    timbre: Math.random(),
    expressiveness: Math.random(),
    spectralCentroid: Math.random() * 5000,
    zeroCrossingRate: Math.random(),
  };
}

// Audio analysis API
export const audioAnalysis = {
  // Analyze an audio file using server API
  analyzeAudio: async (audioFile: File): Promise<AudioAnalysisResult> => {
    // For development, return mock data
    // In production, this would upload the file and get analysis from the API
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(generateMockAnalysisResult());
      }, 1500);
    });
    
    // Production code would be:
    // const formData = new FormData();
    // formData.append('audio', audioFile);
    // const response = await apiClient.post('/voice_cloning/analyze-audio/', formData, {
    //   headers: {
    //     'Content-Type': 'multipart/form-data',
    //   },
    // });
    // return response.data;
  },
  
  // Get analysis for a specific model
  getModelAnalysis: async (modelId: number): Promise<AudioAnalysisResult> => {
    // For development, return mock data
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(generateMockAnalysisResult());
      }, 800);
    });
    
    // Production code would be:
    // const response = await apiClient.get(`/voice_cloning/models/${modelId}/analysis/`);
    // return response.data;
  },
  
  // Analyze audio on the client-side using Web Audio API
  clientSideAnalyze: async (audioData: ArrayBuffer): Promise<Partial<AudioAnalysisResult>> => {
    const analyzer = new AudioAnalyzer();
    const audioContext = new AudioContext();
    
    return new Promise((resolve, reject) => {
      audioContext.decodeAudioData(audioData, async (buffer) => {
        const analysis = await analyzer.analyzeAudio(buffer);
        resolve(analysis);
      }, (error) => {
        reject(error);
      });
    });
  }
};

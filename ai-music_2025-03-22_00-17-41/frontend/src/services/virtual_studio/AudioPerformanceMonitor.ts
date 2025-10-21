"use client";

import { virtualStudioApi } from "./virtual_studio/api";

interface PerformanceMetrics {
  cpuLoad: number;
  memoryUsage: number;
  latency: number;
  bufferUnderruns: number;
  processingTime: number;
}

interface UserSession {
  userId: string;
  sessionId: string;
  startTime: number;
  metrics: PerformanceMetrics[];
}

export class AudioPerformanceMonitor {
  private static instance: AudioPerformanceMonitor;
  private audioContext: AudioContext | null = null;
  private activeSessions: Map<string, UserSession> = new Map();
  private metricsInterval: number = 1000; // 1 second
  private maxBufferSize: number = 4096;
  private targetLatency: number = 0.005; // 5ms target latency

  private constructor() {
    this.initializeAudioContext();
  }

  static getInstance(): AudioPerformanceMonitor {
    if (!AudioPerformanceMonitor.instance) {
      AudioPerformanceMonitor.instance = new AudioPerformanceMonitor();
    }
    return AudioPerformanceMonitor.instance;
  }

  private initializeAudioContext() {
    const initAudio = () => {
      if (!this.audioContext) {
        this.audioContext = new AudioContext({
          latencyHint: "interactive",
          sampleRate: 48000,
        });
      }
      document.removeEventListener("click", initAudio);
    };
    document.addEventListener("click", initAudio);
  }

  startSession(userId: string, sessionId: string) {
    const sessionKey = `${userId}:${sessionId}`;
    if (this.activeSessions.has(sessionKey)) {
      console.warn("Session already active:", sessionKey);
      return;
    }

    this.activeSessions.set(sessionKey, {
      userId,
      sessionId,
      startTime: Date.now(),
      metrics: [],
    });

    this.monitorSession(sessionKey);
  }

  private async monitorSession(sessionKey: string) {
    const session = this.activeSessions.get(sessionKey);
    if (!session || !this.audioContext) return;

    const collectMetrics = async () => {
      if (!this.audioContext) return;

      const metrics: PerformanceMetrics = {
        cpuLoad: await this.measureCPULoad(),
        memoryUsage: await this.measureMemoryUsage(),
        latency: this.audioContext.baseLatency,
        bufferUnderruns: await this.checkBufferUnderruns(),
        processingTime: await this.measureProcessingTime(),
      };

      session.metrics.push(metrics);

      // Optimize if needed
      this.optimizePerformance(sessionKey, metrics);

      // Report metrics to backend
      try {
        await virtualStudioApi.reportPerformanceMetrics(
          session.sessionId,
          metrics,
        );
      } catch (error) {
        console.error("Failed to report metrics:", error);
      }
    };

    // Start periodic collection
    const intervalId = setInterval(collectMetrics, this.metricsInterval);

    // Cleanup when session ends
    return () => {
      clearInterval(intervalId);
      this.activeSessions.delete(sessionKey);
    };
  }

  private async measureCPULoad(): Promise<number> {
    if (!this.audioContext) return 0;

    const startTime = performance.now();
    const sampleBuffer = new Float32Array(this.maxBufferSize);

    // Simulate audio processing load
    for (let i = 0; i < this.maxBufferSize; i++) {
      sampleBuffer[i] = Math.sin(
        (2 * Math.PI * 440 * i) / this.audioContext.sampleRate,
      );
    }

    const endTime = performance.now();
    const processingTime = endTime - startTime;
    const availableTime =
      (this.maxBufferSize / this.audioContext.sampleRate) * 1000;

    return processingTime / availableTime;
  }

  private async measureMemoryUsage(): Promise<number> {
    if (!performance.memory) return 0;
    return performance.memory.usedJSHeapSize;
  }

  private async checkBufferUnderruns(): Promise<number> {
    // Monitor audio worklet for buffer underruns
    // Implementation would depend on audio worklet setup
    return 0;
  }

  private async measureProcessingTime(): Promise<number> {
    const start = performance.now();

    // Process a test buffer
    const testBuffer = new AudioBuffer({
      length: this.maxBufferSize,
      numberOfChannels: 2,
      sampleRate: this.audioContext?.sampleRate || 48000,
    });

    const end = performance.now();
    return end - start;
  }

  private optimizePerformance(sessionKey: string, metrics: PerformanceMetrics) {
    if (metrics.cpuLoad > 0.8) {
      // High CPU load - increase buffer size
      this.maxBufferSize = Math.min(this.maxBufferSize * 2, 16384);
    }

    if (metrics.latency > this.targetLatency * 2) {
      // High latency - decrease buffer size
      this.maxBufferSize = Math.max(this.maxBufferSize / 2, 256);
    }

    if (metrics.bufferUnderruns > 0) {
      // Buffer underruns - increase buffer size
      this.maxBufferSize = Math.min(this.maxBufferSize * 1.5, 16384);
    }
  }

  getSessionMetrics(userId: string, sessionId: string): PerformanceMetrics[] {
    const sessionKey = `${userId}:${sessionId}`;
    return this.activeSessions.get(sessionKey)?.metrics || [];
  }

  endSession(userId: string, sessionId: string) {
    const sessionKey = `${userId}:${sessionId}`;
    const cleanup = this.activeSessions.get(sessionKey);
    if (cleanup) {
      this.activeSessions.delete(sessionKey);
    }
  }
}

import api from "@/lib/api";

export interface AudioPreviewOptions {
  duration?: number; // Preview duration in seconds
  quality?: "low" | "medium" | "high"; // Audio quality
  format?: "mp3" | "wav"; // Audio format
  instruments?: string[];
  effects?: {
    reverb?: { enabled: boolean; amount: number; decay: number };
    delay?: { enabled: boolean; time: number; feedback: number };
    filter?: { enabled: boolean; frequency: number; resonance: number };
  };
  energyLevel?: number;
  abTestSegment?: "A" | "B";
  loop?: {
    start: number;
    end: number;
  };
}

export interface AudioPreviewResult {
  duration: number;
  sampleRate: number;
  channels: number;
}

class AudioPreviewService {
  private audioContext: AudioContext | null = null;
  private audioBufferCache: Map<string, AudioBuffer> = new Map();
  private currentSource: AudioBufferSourceNode | null = null;
  private analyserNodes: Map<string, AnalyserNode> = new Map();
  private effectNodes: {
    reverb?: ConvolverNode;
    delay?: DelayNode;
    filter?: BiquadFilterNode;
  } = {};
  private audioSource: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;

  constructor() {
    // Initialize AudioContext on first user interaction
    const initializeAudio = () => {
      if (!this.audioContext) {
        this.audioContext = new AudioContext();
      }
      document.removeEventListener("click", initializeAudio);
    };
    if (typeof document !== 'undefined') {
      document.addEventListener("click", initializeAudio);
    }
  }

  public async generatePreview(
    sessionId: string,
    options: AudioPreviewOptions = {},
  ): Promise<ArrayBuffer> {
    try {
      const response = await api.post(
        `/api/genre_mixing/sessions/${sessionId}/preview/`,
        {
          duration: options.duration || 5,
          quality: options.quality || "medium",
          format: options.format || "mp3",
        },
        {
          responseType: "arraybuffer",
        },
      );

      return response.data;
    } catch (error) {
      console.error("Failed to generate audio preview:", error);
      throw error;
    }
  }

  private async createReverbNode(decay: number): Promise<ConvolverNode> {
    const sampleRate = this.audioContext!.sampleRate;
    const length = sampleRate * decay;
    const impulse = this.audioContext!.createBuffer(2, length, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sampleRate * decay));
      }
    }

    const reverbNode = this.audioContext!.createConvolver();
    reverbNode.buffer = impulse;
    return reverbNode;
  }

  private async setupEffectChain(options: AudioPreviewOptions = {}) {
    if (!this.audioContext) return null;

    // Clear existing effect nodes
    this.effectNodes = {};

    let lastNode: AudioNode = this.currentSource!;

    // Create and connect effects if enabled
    if (options.effects?.reverb?.enabled) {
      this.effectNodes.reverb = await this.createReverbNode(
        options.effects.reverb.decay,
      );
      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = options.effects.reverb.amount / 100;

      lastNode.connect(this.effectNodes.reverb);
      this.effectNodes.reverb.connect(gainNode);
      lastNode = gainNode;
    }

    if (options.effects?.delay?.enabled) {
      this.effectNodes.delay = this.audioContext.createDelay();
      this.effectNodes.delay.delayTime.value =
        options.effects.delay.time / 1000;

      const feedbackGain = this.audioContext.createGain();
      feedbackGain.gain.value = options.effects.delay.feedback / 100;

      lastNode.connect(this.effectNodes.delay);
      this.effectNodes.delay.connect(feedbackGain);
      feedbackGain.connect(this.effectNodes.delay);
      lastNode = this.effectNodes.delay;
    }

    if (options.effects?.filter?.enabled) {
      this.effectNodes.filter = this.audioContext.createBiquadFilter();
      this.effectNodes.filter.type = "lowpass";
      this.effectNodes.filter.frequency.value =
        options.effects.filter.frequency;
      this.effectNodes.filter.Q.value = options.effects.filter.resonance;

      lastNode.connect(this.effectNodes.filter);
      lastNode = this.effectNodes.filter;
    }

    return lastNode;
  }

  public async playPreview(
    sessionId: string,
    options: AudioPreviewOptions = {},
  ): Promise<AudioPreviewResult> {
    try {
      // Initialize audio context if not already done
      if (!this.audioContext) {
        this.audioContext = new AudioContext();
      }

      // Stop any existing playback
      this.stopPreview();

      // Create gain node for volume control
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);

      // Fetch audio data from backend
      const response = await fetch(`/api/mix/preview/${sessionId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch audio preview");
      }

      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

      // Create and configure source node
      this.audioSource = this.audioContext.createBufferSource();
      this.audioSource.buffer = audioBuffer;
      this.audioSource.connect(this.gainNode);
      this.audioSource.start();

      return {
        duration: audioBuffer.duration,
        sampleRate: audioBuffer.sampleRate,
        channels: audioBuffer.numberOfChannels,
      };
    } catch (error) {
      console.error("Error playing preview:", error);
      throw error;
    }
  }

  private startAnalysis() {
    const analyseFrame = () => {
      if (!this.currentSource) return;

      const spectrumData: Record<string, number[]> = {};
      const stereoData: Record<string, { left: number[]; right: number[] }> =
        {};

      this.analyserNodes.forEach((analyser, instrument) => {
        // Frequency analysis
        const frequencyData = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(frequencyData);
        spectrumData[instrument] = Array.from(frequencyData);

        // Stereo analysis
        const timeData = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteTimeDomainData(timeData);

        // Split time domain data into left and right channels
        const leftData = timeData.slice(0, timeData.length / 2);
        const rightData = timeData.slice(timeData.length / 2);

        stereoData[instrument] = {
          left: Array.from(leftData),
          right: Array.from(rightData),
        };
      });

      // Dispatch analysis data
      window.dispatchEvent(
        new CustomEvent("audio-analysis-update", {
          detail: {
            instruments: Array.from(this.analyserNodes.keys()),
            spectrum: spectrumData,
            stereo: stereoData,
          },
        }),
      );

      requestAnimationFrame(analyseFrame);
    };

    requestAnimationFrame(analyseFrame);
  }

  public stopPreview() {
    if (this.audioSource) {
      try {
        this.audioSource.stop();
      } catch (e) {
        // Ignore errors if already stopped
      }
      this.audioSource.disconnect();
      this.audioSource = null;
    }
  }

  public clearCache(): void {
    this.audioBufferCache.clear();
  }

  seekTo(time: number) {
    if (this.audioSource && this.audioContext) {
      const currentTime = this.audioContext.currentTime;
      this.audioSource.stop();
      this.audioSource.start(0, time);
    }
  }

  setVolume(volume: number) {
    if (this.gainNode) {
      this.gainNode.gain.value = Math.max(0, Math.min(1, volume));
    }
  }
}

export const audioPreviewService = new AudioPreviewService();

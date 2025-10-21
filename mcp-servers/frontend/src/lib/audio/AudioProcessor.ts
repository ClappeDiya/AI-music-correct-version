export class AudioProcessor {
  private audioContext: AudioContext;
  private analyser: AnalyserNode;
  private gainNode: GainNode;
  private source: MediaElementAudioSourceNode | null = null;
  private fftSize: number = 2048;
  private dataArray: Uint8Array;
  private isInitialized: boolean = false;

  constructor() {
    this.audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    this.analyser = this.audioContext.createAnalyser();
    this.gainNode = this.audioContext.createGain();
    this.analyser.fftSize = this.fftSize;
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

    // Connect nodes
    this.gainNode.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);
  }

  async initialize(audioElement: HTMLAudioElement) {
    if (this.isInitialized) return;

    try {
      await this.audioContext.resume();
      this.source = this.audioContext.createMediaElementSource(audioElement);
      this.source.connect(this.gainNode);
      this.isInitialized = true;
    } catch (error) {
      console.error("Failed to initialize audio processor:", error);
      throw error;
    }
  }

  getFrequencyData(): Uint8Array {
    this.analyser.getByteFrequencyData(this.dataArray);
    return this.dataArray;
  }

  getTimeDomainData(): Uint8Array {
    this.analyser.getByteTimeDomainData(this.dataArray);
    return this.dataArray;
  }

  getBPM(): number {
    const timeDomainData = this.getTimeDomainData();
    // Implement BPM detection algorithm
    // This is a simplified example
    let peaks = 0;
    let lastValue = 0;

    for (let i = 0; i < timeDomainData.length; i++) {
      const value = timeDomainData[i];
      if (value > 200 && lastValue <= 200) {
        peaks++;
      }
      lastValue = value;
    }

    // Calculate BPM based on peaks and buffer size
    const duration = this.fftSize / this.audioContext.sampleRate;
    const bpm = (peaks * 60) / duration;

    return Math.round(bpm);
  }

  getSpectralCentroid(): number {
    const frequencyData = this.getFrequencyData();
    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < frequencyData.length; i++) {
      const amplitude = frequencyData[i];
      const frequency = (i * this.audioContext.sampleRate) / this.fftSize;
      numerator += frequency * amplitude;
      denominator += amplitude;
    }

    return denominator === 0 ? 0 : numerator / denominator;
  }

  setVolume(value: number) {
    this.gainNode.gain.value = Math.max(0, Math.min(1, value));
  }

  getVolume(): number {
    return this.gainNode.gain.value;
  }

  async crossfade(value: number, duration: number = 0.1) {
    const now = this.audioContext.currentTime;
    this.gainNode.gain.linearRampToValueAtTime(value, now + duration);
  }

  disconnect() {
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    this.gainNode.disconnect();
    this.analyser.disconnect();
  }
}

import { useLanguageStore } from "./languageService";

interface VoiceRecognitionOptions {
  onResult?: (text: string) => void;
  onError?: (error: Error) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

class VoiceRecognitionService {
  private recognition: SpeechRecognition | null = null;
  private options: VoiceRecognitionOptions = {};

  constructor() {
    if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.setupRecognition();
    }
  }

  private setupRecognition() {
    if (!this.recognition) return;

    this.recognition.continuous = false;
    this.recognition.interimResults = false;

    this.recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      this.options.onResult?.(text);
    };

    this.recognition.onerror = (event) => {
      this.options.onError?.(new Error(event.error));
    };

    this.recognition.onstart = () => {
      this.options.onStart?.();
    };

    this.recognition.onend = () => {
      this.options.onEnd?.();
    };
  }

  public start(options: VoiceRecognitionOptions = {}) {
    if (!this.recognition) {
      options.onError?.(new Error("Speech recognition not supported"));
      return;
    }

    this.options = options;
    const { preferredLanguage } = useLanguageStore.getState();
    this.recognition.lang = preferredLanguage;

    try {
      this.recognition.start();
    } catch (error) {
      options.onError?.(error as Error);
    }
  }

  public stop() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (error) {
        console.error("Error stopping recognition:", error);
      }
    }
  }
}

export const voiceRecognition = new VoiceRecognitionService();

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

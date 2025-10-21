import axios from "axios";
import { create } from "zustand";

interface AnnouncementState {
  isPlaying: boolean;
  currentAnnouncement: string | null;
  audioQueue: Array<{ text: string; audio: string }>;
  setPlaying: (playing: boolean) => void;
  setCurrentAnnouncement: (text: string | null) => void;
  addToQueue: (announcement: { text: string; audio: string }) => void;
  clearQueue: () => void;
}

export const useAnnouncementStore = create<AnnouncementState>((set) => ({
  isPlaying: false,
  currentAnnouncement: null,
  audioQueue: [],
  setPlaying: (playing) => set({ isPlaying: playing }),
  setCurrentAnnouncement: (text) => set({ currentAnnouncement: text }),
  addToQueue: (announcement) =>
    set((state) => ({ audioQueue: [...state.audioQueue, announcement] })),
  clearQueue: () => set({ audioQueue: [] }),
}));

class AnnouncementService {
  private audioContext: AudioContext | null = null;
  private currentSource: AudioBufferSourceNode | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
    }
  }

  async generateAnnouncement(sessionId: number, text: string): Promise<string> {
    const response = await axios.post(
      `/api/ai_dj/sessions/${sessionId}/generate-announcement/`,
      { text },
    );
    return response.data.audio_content;
  }

  async playAnnouncement(base64Audio: string): Promise<void> {
    if (!this.audioContext) return;

    const store = useAnnouncementStore.getState();
    if (store.isPlaying) {
      this.stop();
    }

    try {
      store.setPlaying(true);

      // Decode base64 audio
      const binaryString = window.atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Create audio buffer
      const audioBuffer = await this.audioContext.decodeAudioData(bytes.buffer);

      // Create and play source
      this.currentSource = this.audioContext.createBufferSource();
      this.currentSource.buffer = audioBuffer;
      this.currentSource.connect(this.audioContext.destination);

      this.currentSource.onended = () => {
        store.setPlaying(false);
        store.setCurrentAnnouncement(null);
        this.playNext();
      };

      this.currentSource.start(0);
    } catch (error) {
      console.error("Error playing announcement:", error);
      store.setPlaying(false);
      store.setCurrentAnnouncement(null);
    }
  }

  stop(): void {
    if (this.currentSource) {
      try {
        this.currentSource.stop();
      } catch (error) {
        console.error("Error stopping announcement:", error);
      }
    }
  }

  private async playNext(): Promise<void> {
    const store = useAnnouncementStore.getState();
    const next = store.audioQueue[0];

    if (next) {
      const newQueue = store.audioQueue.slice(1);
      store.setCurrentAnnouncement(next.text);
      await this.playAnnouncement(next.audio);
      useAnnouncementStore.setState({ audioQueue: newQueue });
    }
  }

  async updateSettings(
    sessionId: number,
    settings: {
      enable_announcements?: boolean;
      voice_style?: string;
      announcement_frequency?: string;
    },
  ): Promise<void> {
    await axios.post(
      `/api/ai_dj/sessions/${sessionId}/update-announcement_settings/`,
      settings,
    );
  }
}

export const announcementService = new AnnouncementService();

declare global {
  interface Window {
    AudioContext: typeof AudioContext;
    webkitAudioContext: typeof AudioContext;
  }
}

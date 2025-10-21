import axios from "axios";
import { create } from "zustand";

const API_BASE_URL = "/api/ai_dj/vr_dj";
const WS_BASE_URL =
  process.env.NEXT_PUBLIC_WS_BASE_URL || "ws://localhost:8000";

export interface VRDJSession {
  id: string;
  session: string;
  user: string;
  environment_type: "club" | "festival" | "studio" | "custom";
  is_collaborative: boolean;
  created_at: string;
  updated_at: string;
}

export interface VRDJControl {
  id?: string;
  session: string;
  control_type: string;
  value: number;
  timestamp?: string;
}

export interface VRDJEnvironment {
  id: string;
  session: string;
  name: string;
  scene_data: {
    scene_objects: any[];
    camera_position: { x: number; y: number; z: number };
    lighting: any;
  };
  lighting_preset: "ambient" | "dynamic" | "reactive" | "custom";
  crowd_simulation: boolean;
  visual_effects: Record<string, any>;
  created_at: string;
}

export interface VRDJInteraction {
  id?: string;
  session: string;
  interaction_type: string;
  details: Record<string, any>;
  success_rating?: number;
  timestamp?: string;
}

interface VRDJState {
  session: VRDJSession | null;
  controls: VRDJControl[];
  environment: VRDJEnvironment | null;
  isConnected: boolean;
  isVRSupported: boolean;
  error: string | null;
}

export const useVRDJStore = create<VRDJState>((set) => ({
  session: null,
  controls: [],
  environment: null,
  isConnected: false,
  isVRSupported: false,
  error: null,
}));

class VRDJService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor() {
    if (typeof window !== "undefined") {
      this.checkVRSupport();
    }
  }

  private async checkVRSupport() {
    if ("xr" in navigator) {
      try {
        const isSupported = await (navigator as any).xr.isSessionSupported(
          "immersive-vr",
        );
        useVRDJStore.setState({ isVRSupported: isSupported });
      } catch (error) {
        console.error("VR support check failed:", error);
        useVRDJStore.setState({ isVRSupported: false });
      }
    }
  }

  async connectWebSocket(sessionId: string) {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    this.ws = new WebSocket(`${WS_BASE_URL}/ws/vrdj/${sessionId}/`);

    this.ws.onopen = () => {
      useVRDJStore.setState({ isConnected: true, error: null });
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleWebSocketMessage(data);
    };

    this.ws.onclose = () => {
      useVRDJStore.setState({ isConnected: false });
      this.handleReconnect(sessionId);
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      useVRDJStore.setState({ error: "Connection error" });
    };
  }

  private handleReconnect(sessionId: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(
        () => {
          this.connectWebSocket(sessionId);
        },
        1000 * Math.pow(2, this.reconnectAttempts),
      );
    }
  }

  private handleWebSocketMessage(data: any) {
    switch (data.type) {
      case "control_update":
        useVRDJStore.setState((state) => ({
          controls: [...state.controls, data.control],
        }));
        break;
      case "environment_update":
        useVRDJStore.setState({ environment: data.environment });
        break;
      default:
        console.warn("Unknown message type:", data.type);
    }
  }

  async sendControl(control: Omit<VRDJControl, "id" | "timestamp">) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: "control_update",
          control,
        }),
      );
    }
  }

  async batchSendControls(controls: Omit<VRDJControl, "id" | "timestamp">[]) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/controls/batch_update/`,
        { controls },
      );
      return response.data;
    } catch (error) {
      console.error("Failed to send batch controls:", error);
      throw error;
    }
  }

  // Session Management
  async createSession(data: Partial<VRDJSession>): Promise<VRDJSession> {
    const response = await axios.post(`${API_BASE_URL}/sessions/`, data);
    useVRDJStore.setState({ session: response.data });
    return response.data;
  }

  async getSession(id: string): Promise<VRDJSession> {
    const response = await axios.get(`${API_BASE_URL}/sessions/${id}/`);
    useVRDJStore.setState({ session: response.data });
    return response.data;
  }

  // Environment Management
  async createEnvironment(
    data: Partial<VRDJEnvironment>,
  ): Promise<VRDJEnvironment> {
    const response = await axios.post(`${API_BASE_URL}/environments/`, data);
    useVRDJStore.setState({ environment: response.data });
    return response.data;
  }

  async updateEnvironment(
    id: string,
    data: Partial<VRDJEnvironment>,
  ): Promise<VRDJEnvironment> {
    const response = await axios.patch(
      `${API_BASE_URL}/environments/${id}/`,
      data,
    );
    useVRDJStore.setState({ environment: response.data });
    return response.data;
  }

  async applyEnvironmentPreset(
    id: string,
    preset: string,
  ): Promise<VRDJEnvironment> {
    const response = await axios.post(
      `${API_BASE_URL}/environments/${id}/apply_preset/`,
      { preset },
    );
    useVRDJStore.setState({ environment: response.data });
    return response.data;
  }

  // Interaction Recording
  async recordInteraction(
    data: Omit<VRDJInteraction, "id" | "timestamp">,
  ): Promise<VRDJInteraction> {
    const response = await axios.post(`${API_BASE_URL}/interactions/`, data);
    return response.data;
  }

  async getSessionStats(sessionId: string) {
    const response = await axios.get(
      `${API_BASE_URL}/interactions/session_stats/`,
      { params: { session_id: sessionId } },
    );
    return response.data;
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const vrDjService = new VRDJService();

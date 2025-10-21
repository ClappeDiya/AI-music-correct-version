import { ApiClient } from "../../lib/api-client";
import {
  VREnvironment,
  VRInteraction,
  VRPosition,
  VRRotation,
} from "../../types/api";

export class VRService {
  private client: ApiClient;
  private wsConnections: Map<string, WebSocket>;

  constructor() {
    this.client = new ApiClient();
    this.wsConnections = new Map();
  }

  // Environment Management
  async getEnvironments(): Promise<VREnvironment[]> {
    return this.client.get<VREnvironment[]>("/vr-environments/");
  }

  async getEnvironment(id: string): Promise<VREnvironment> {
    return this.client.get<VREnvironment>(`/vr-environments/${id}/`);
  }

  async createEnvironment(
    data: Partial<VREnvironment>,
  ): Promise<VREnvironment> {
    return this.client.post<VREnvironment>("/vr-environments/", data);
  }

  async updateEnvironment(
    id: string,
    data: Partial<VREnvironment>,
  ): Promise<VREnvironment> {
    return this.client.patch<VREnvironment>(`/vr-environments/${id}/`, data);
  }

  async deleteEnvironment(id: string): Promise<void> {
    return this.client.delete(`/vr-environments/${id}/`);
  }

  // Interaction Logging
  async logInteraction(
    data: Omit<VRInteraction, "id" | "timestamp">,
  ): Promise<VRInteraction> {
    return this.client.post<VRInteraction>("/vr-interactions/", data);
  }

  async getInteractionAnalytics(sessionId: string): Promise<any> {
    return this.client.get(
      `/vr-interactions/analytics/?session_id=${sessionId}`,
    );
  }

  // Real-time Session Management
  connectToSession(
    sessionId: string,
    callbacks: {
      onOpen?: () => void;
      onMessage?: (data: any) => void;
      onError?: (error: Event) => void;
      onClose?: () => void;
    },
  ): void {
    if (this.wsConnections.has(sessionId)) {
      return;
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(
      `${protocol}//${window.location.host}/ws/vr-session/${sessionId}/`,
    );

    ws.onopen = () => {
      callbacks.onOpen?.();
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        callbacks.onMessage?.(data);
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    };

    ws.onerror = (error) => {
      callbacks.onError?.(error);
    };

    ws.onclose = () => {
      this.wsConnections.delete(sessionId);
      callbacks.onClose?.();
    };

    this.wsConnections.set(sessionId, ws);
  }

  disconnectFromSession(sessionId: string): void {
    const ws = this.wsConnections.get(sessionId);
    if (ws) {
      ws.close();
      this.wsConnections.delete(sessionId);
    }
  }

  updatePosition(
    sessionId: string,
    position: VRPosition,
    rotation: VRRotation,
  ): void {
    const ws = this.wsConnections.get(sessionId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          action: "update_position",
          position,
          rotation,
        }),
      );
    }
  }

  interactWithObject(
    sessionId: string,
    objectId: string,
    interactionType: string,
  ): void {
    const ws = this.wsConnections.get(sessionId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          action: "interact_object",
          object_id: objectId,
          interaction_type: interactionType,
        }),
      );
    }
  }

  syncSessionState(sessionId: string, state: any): void {
    const ws = this.wsConnections.get(sessionId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          action: "sync_state",
          state,
        }),
      );
    }
  }
}

import { ApiClient } from "../../lib/api-client";
import {
  Plugin,
  PluginDeveloper,
  PluginInstallation,
  PluginRating,
} from "../../types/api";

export class PluginService {
  private client: ApiClient;
  private wsConnections: Map<string, WebSocket>;

  constructor() {
    this.client = new ApiClient();
    this.wsConnections = new Map();
  }

  // Plugin Management
  async getPlugins(filters?: {
    type?: string;
    is_certified?: boolean;
    ordering?: string;
  }): Promise<Plugin[]> {
    const params = new URLSearchParams();
    if (filters?.type) params.append("type", filters.type);
    if (filters?.is_certified !== undefined)
      params.append("is_certified", String(filters.is_certified));
    if (filters?.ordering) params.append("ordering", filters.ordering);

    return this.client.get<Plugin[]>(`/plugins/?${params.toString()}`);
  }

  async getPlugin(id: string): Promise<Plugin> {
    return this.client.get<Plugin>(`/plugins/${id}/`);
  }

  async createPlugin(data: Partial<Plugin>): Promise<Plugin> {
    return this.client.post<Plugin>("/plugins/", data);
  }

  async updatePlugin(id: string, data: Partial<Plugin>): Promise<Plugin> {
    return this.client.patch<Plugin>(`/plugins/${id}/`, data);
  }

  async deletePlugin(id: string): Promise<void> {
    return this.client.delete(`/plugins/${id}/`);
  }

  async certifyPlugin(id: string): Promise<Plugin> {
    return this.client.post<Plugin>(`/plugins/${id}/certify/`);
  }

  async installPlugin(id: string): Promise<PluginInstallation> {
    return this.client.post<PluginInstallation>(`/plugins/${id}/install/`);
  }

  // Developer Management
  async getDevelopers(): Promise<PluginDeveloper[]> {
    return this.client.get<PluginDeveloper[]>("/plugin-developers/");
  }

  async getDeveloper(id: string): Promise<PluginDeveloper> {
    return this.client.get<PluginDeveloper>(`/plugin-developers/${id}/`);
  }

  async createDeveloper(
    data: Partial<PluginDeveloper>,
  ): Promise<PluginDeveloper> {
    return this.client.post<PluginDeveloper>("/plugin-developers/", data);
  }

  async verifyDeveloper(id: string): Promise<PluginDeveloper> {
    return this.client.post<PluginDeveloper>(
      `/plugin-developers/${id}/verify/`,
    );
  }

  // Installation Management
  async getInstallations(): Promise<PluginInstallation[]> {
    return this.client.get<PluginInstallation[]>("/plugin-installations/");
  }

  async getInstallation(id: string): Promise<PluginInstallation> {
    return this.client.get<PluginInstallation>(`/plugin-installations/${id}/`);
  }

  async toggleInstallation(id: string): Promise<PluginInstallation> {
    return this.client.post<PluginInstallation>(
      `/plugin-installations/${id}/toggle/`,
    );
  }

  async updateInstallationSettings(
    id: string,
    settings: Record<string, any>,
  ): Promise<PluginInstallation> {
    return this.client.post<PluginInstallation>(
      `/plugin-installations/${id}/update-settings/`,
      { settings },
    );
  }

  // Rating Management
  async getRatings(pluginId: string): Promise<PluginRating[]> {
    return this.client.get<PluginRating[]>(
      `/plugin-ratings/?plugin_id=${pluginId}`,
    );
  }

  async createRating(data: Partial<PluginRating>): Promise<PluginRating> {
    return this.client.post<PluginRating>("/plugin-ratings/", data);
  }

  // Plugin Execution
  async executePlugin(
    pluginId: string,
    action: string,
    parameters: Record<string, any>,
  ): Promise<any> {
    return this.client.post("/execute-plugin/", {
      plugin_id: pluginId,
      action,
      parameters,
    });
  }

  // Real-time Plugin State Management
  connectToPluginState(
    pluginId: string,
    callbacks: {
      onOpen?: () => void;
      onStateUpdate?: (state: any) => void;
      onError?: (error: Event) => void;
      onClose?: () => void;
    },
  ): void {
    if (this.wsConnections.has(pluginId)) {
      return;
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(
      `${protocol}//${window.location.host}/ws/plugin/${pluginId}/`,
    );

    ws.onopen = () => {
      callbacks.onOpen?.();
    };

    ws.onmessage = (event) => {
      try {
        const state = JSON.parse(event.data);
        callbacks.onStateUpdate?.(state);
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    };

    ws.onerror = (error) => {
      callbacks.onError?.(error);
    };

    ws.onclose = () => {
      this.wsConnections.delete(pluginId);
      callbacks.onClose?.();
    };

    this.wsConnections.set(pluginId, ws);
  }

  disconnectFromPluginState(pluginId: string): void {
    const ws = this.wsConnections.get(pluginId);
    if (ws) {
      ws.close();
      this.wsConnections.delete(pluginId);
    }
  }

  updatePluginState(pluginId: string, state: Record<string, any>): void {
    const ws = this.wsConnections.get(pluginId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          action: "update_state",
          state,
        }),
      );
    }
  }

  requestPluginStateSync(pluginId: string): void {
    const ws = this.wsConnections.get(pluginId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          action: "sync_request",
        }),
      );
    }
  }
}

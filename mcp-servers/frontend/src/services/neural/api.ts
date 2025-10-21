import { ApiClient } from "../../lib/api-client";
import { NeuralDevice, NeuralSignal, NeuralControl } from "../../types/api";

export class NeuralService {
  private client: ApiClient;
  private wsConnections: Map<string, WebSocket>;

  constructor() {
    this.client = new ApiClient();
    this.wsConnections = new Map();
  }

  // Device Management
  async getDevices(): Promise<NeuralDevice[]> {
    return this.client.get<NeuralDevice[]>("/neural-devices/");
  }

  async getDevice(id: string): Promise<NeuralDevice> {
    return this.client.get<NeuralDevice>(`/neural-devices/${id}/`);
  }

  async createDevice(data: Partial<NeuralDevice>): Promise<NeuralDevice> {
    return this.client.post<NeuralDevice>("/neural-devices/", data);
  }

  async updateDevice(
    id: string,
    data: Partial<NeuralDevice>,
  ): Promise<NeuralDevice> {
    return this.client.patch<NeuralDevice>(`/neural-devices/${id}/`, data);
  }

  async deleteDevice(id: string): Promise<void> {
    return this.client.delete(`/neural-devices/${id}/`);
  }

  async calibrateDevice(id: string): Promise<void> {
    return this.client.post(`/neural-devices/${id}/calibrate/`);
  }

  async resetSafetyThresholds(id: string): Promise<void> {
    return this.client.post(`/neural-devices/${id}/reset-safety-thresholds/`);
  }

  // Signal Processing
  async processSignal(data: {
    device_id: string;
    signal_type: string;
    signal_data: Record<string, any>;
  }): Promise<NeuralSignal> {
    return this.client.post<NeuralSignal>("/process-neural-signal/", data);
  }

  // Control Mapping
  async getControls(): Promise<NeuralControl[]> {
    return this.client.get<NeuralControl[]>("/neural-controls/");
  }

  async createControl(data: Partial<NeuralControl>): Promise<NeuralControl> {
    return this.client.post<NeuralControl>("/neural-controls/", data);
  }

  async updateControl(
    id: string,
    data: Partial<NeuralControl>,
  ): Promise<NeuralControl> {
    return this.client.patch<NeuralControl>(`/neural-controls/${id}/`, data);
  }

  async deleteControl(id: string): Promise<void> {
    return this.client.delete(`/neural-controls/${id}/`);
  }

  async testMapping(id: string, testData: Record<string, any>): Promise<any> {
    return this.client.post(`/neural-controls/${id}/test-mapping/`, testData);
  }

  async batchUpdateControls(
    updates: Array<{ id: string; data: Partial<NeuralControl> }>,
  ): Promise<NeuralControl[]> {
    return this.client.post<NeuralControl[]>("/neural-controls/batch-update/", {
      updates,
    });
  }

  // Real-time Signal Processing
  connectToDevice(
    deviceId: string,
    callbacks: {
      onOpen?: () => void;
      onSignal?: (signal: NeuralSignal) => void;
      onError?: (error: Event) => void;
      onClose?: () => void;
    },
  ): void {
    if (this.wsConnections.has(deviceId)) {
      return;
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(
      `${protocol}//${window.location.host}/ws/neural-device/${deviceId}/`,
    );

    ws.onopen = () => {
      callbacks.onOpen?.();
    };

    ws.onmessage = (event) => {
      try {
        const signal = JSON.parse(event.data);
        callbacks.onSignal?.(signal);
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    };

    ws.onerror = (error) => {
      callbacks.onError?.(error);
    };

    ws.onclose = () => {
      this.wsConnections.delete(deviceId);
      callbacks.onClose?.();
    };

    this.wsConnections.set(deviceId, ws);
  }

  disconnectFromDevice(deviceId: string): void {
    const ws = this.wsConnections.get(deviceId);
    if (ws) {
      ws.close();
      this.wsConnections.delete(deviceId);
    }
  }

  sendSignal(
    deviceId: string,
    signalType: string,
    signalData: Record<string, any>,
  ): void {
    const ws = this.wsConnections.get(deviceId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          signal_type: signalType,
          signal_data: signalData,
        }),
      );
    }
  }
}

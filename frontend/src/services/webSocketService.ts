import { EventEmitter } from "events";

export interface WebSocketMessage {
  type: string;
  payload: any;
}

class WebSocketService extends EventEmitter {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout = 1000;
  private sessionId: string | null = null;

  connect(sessionId: string) {
    this.sessionId = sessionId;
    const wsUrl = `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}/ws/dj-session/${sessionId}/`;

    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log("WebSocket connected");
      this.reconnectAttempts = 0;
      this.emit("connected");
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.emit(message.type, message.payload);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    this.ws.onclose = () => {
      console.log("WebSocket disconnected");
      this.emit("disconnected");
      this.attemptReconnect();
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      this.emit("error", error);
    };
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts && this.sessionId) {
      setTimeout(
        () => {
          console.log(
            `Attempting to reconnect (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`,
          );
          this.reconnectAttempts++;
          this.connect(this.sessionId!);
        },
        this.reconnectTimeout * Math.pow(2, this.reconnectAttempts),
      );
    } else {
      this.emit("reconnect_failed");
    }
  }

  send(type: string, payload: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    } else {
      console.error("WebSocket is not connected");
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.sessionId = null;
      this.reconnectAttempts = 0;
    }
  }
}

export const webSocketService = new WebSocketService();

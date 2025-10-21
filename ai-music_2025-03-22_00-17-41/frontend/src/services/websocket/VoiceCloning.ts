type WebSocketMessageType =
  | "training_progress"
  | "model_performance"
  | "usage_update"
  | "error_report";

interface WebSocketMessage {
  type: WebSocketMessageType;
  data: any;
}

export class VoiceCloningWebSocket {
  private ws: WebSocket | null = null;
  private messageHandlers: Map<WebSocketMessageType, ((data: any) => void)[]> =
    new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;

  constructor(
    private modelId: number,
    private onError?: (error: string) => void,
  ) {}

  connect() {
    if (this.isConnecting) return;
    this.isConnecting = true;

    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}/voice_cloning/models/${this.modelId}/ws/`;
    this.ws = new WebSocket(wsUrl);

    this.ws.onmessage = this.handleMessage;
    this.ws.onclose = this.handleClose;
    this.ws.onerror = this.handleError;
    this.ws.onopen = this.handleOpen;
  }

  private handleMessage = (event: MessageEvent) => {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      const handlers = this.messageHandlers.get(message.type) || [];
      handlers.forEach((handler) => handler(message.data));
    } catch (error) {
      this.onError?.("Failed to parse WebSocket message");
    }
  };

  private handleClose = (event: CloseEvent) => {
    this.isConnecting = false;
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(
        () => {
          this.reconnectAttempts++;
          this.connect();
        },
        this.reconnectDelay * Math.pow(2, this.reconnectAttempts),
      );
    } else {
      this.onError?.(
        "WebSocket connection failed after maximum retry attempts",
      );
    }
  };

  private handleError = (event: Event) => {
    this.onError?.("WebSocket error occurred");
  };

  private handleOpen = () => {
    this.isConnecting = false;
    this.reconnectAttempts = 0;
  };

  subscribe(type: WebSocketMessageType, handler: (data: any) => void) {
    const handlers = this.messageHandlers.get(type) || [];
    handlers.push(handler);
    this.messageHandlers.set(type, handlers);
  }

  unsubscribe(type: WebSocketMessageType, handler: (data: any) => void) {
    const handlers = this.messageHandlers.get(type) || [];
    const index = handlers.indexOf(handler);
    if (index !== -1) {
      handlers.splice(index, 1);
      this.messageHandlers.set(type, handlers);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.messageHandlers.clear();
    this.reconnectAttempts = 0;
    this.isConnecting = false;
  }
}

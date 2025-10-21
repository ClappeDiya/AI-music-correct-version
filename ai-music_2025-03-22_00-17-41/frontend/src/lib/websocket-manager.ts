type MessageHandler = (data: any) => void;

const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws";

export class WebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout = 1000;
  private handlers: Map<string, Set<MessageHandler>> = new Map();
  private currentModelId: string = "";
  private moduleType: string = "voice_cloning"; // Default module type

  constructor(moduleType?: string) {
    if (moduleType) {
      this.moduleType = moduleType;
    }
  }

  connect(modelId: string) {
    this.currentModelId = modelId;
    
    // Skip WebSocket connection on server-side
    if (typeof window === 'undefined') return;
    
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem("auth_token") : null;
      
      // Determine the WebSocket URL based on the module type
      let wsUrl = `${WS_BASE_URL}/${this.moduleType}/${modelId}/?token=${token}`;
      
      // Special handling for lyrics_generation module
      if (this.moduleType === "lyrics_generation") {
        wsUrl = `${WS_BASE_URL}/lyrics_generation/${modelId}/?token=${token}`;
      }
      
      this.ws = new WebSocket(wsUrl);
      this.setupEventHandlers();
    } catch (error) {
      console.error("WebSocket connection error:", error);
    }
  }

  private setupEventHandlers() {
    if (!this.ws) return;

    this.ws.onopen = this.handleOpen;
    this.ws.onclose = this.handleClose;
    this.ws.onmessage = this.handleMessage;
    this.ws.onerror = this.handleError;
  }

  private handleOpen = () => {
    this.reconnectAttempts = 0;
    console.log(`WebSocket connected for ${this.moduleType}`);
  };

  private handleClose = () => {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        this.reconnectAttempts++;
        this.connect(this.currentModelId);
      }, this.reconnectTimeout * this.reconnectAttempts);
    }
  };

  private handleMessage = (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      const eventType = data.type;

      if (this.handlers.has(eventType)) {
        this.handlers.get(eventType)?.forEach((handler) => handler(data));
      }
    } catch (error) {
      console.error("Error handling WebSocket message:", error);
    }
  };

  private handleError = (error: Event) => {
    console.error("WebSocket error:", error);
  };

  subscribe(eventType: string, handler: MessageHandler) {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)?.add(handler);
  }

  unsubscribe(eventType: string, handler: MessageHandler) {
    this.handlers.get(eventType)?.delete(handler);
  }

  send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  disconnect() {
    this.ws?.close();
    this.ws = null;
    this.handlers.clear();
  }
}

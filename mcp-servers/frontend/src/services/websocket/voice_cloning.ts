/**
 * Voice Cloning WebSocket service for real-time analysis and updates
 * This is a mock implementation for development
 */

type EventHandler = (data: any) => void;

export class VoiceCloningWebSocket {
  private handlers: Map<string, Set<EventHandler>> = new Map();
  private isConnected: boolean = false;
  private mockInterval: NodeJS.Timeout | null = null;
  private modelId: number;

  constructor(modelId: number) {
    this.modelId = modelId;
  }

  connect() {
    this.isConnected = true;
    
    // Simulate receiving random events for development
    this.mockInterval = setInterval(() => {
      if (!this.isConnected) return;
      
      this.generateMockEvent();
    }, 3000);
  }

  disconnect() {
    this.isConnected = false;
    if (this.mockInterval) {
      clearInterval(this.mockInterval);
      this.mockInterval = null;
    }
  }

  subscribe(eventType: string, handler: EventHandler) {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)?.add(handler);
    
    // Send initial data immediately for UI
    if (eventType === "error_report") {
      handler(this.generateMockErrorReport());
    }
  }

  unsubscribe(eventType: string, handler: EventHandler) {
    this.handlers.get(eventType)?.delete(handler);
  }

  // Mock event generator
  private generateMockEvent() {
    const eventTypes = ["error_report", "status_update", "model_update"];
    const randomEvent = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    
    if (!this.handlers.has(randomEvent)) return;
    
    let mockData: Record<string, any> = {};
    
    switch (randomEvent) {
      case "error_report":
        mockData = this.generateMockErrorReport();
        break;
      case "status_update":
        mockData = {
          status: ["processing", "ready", "training"][Math.floor(Math.random() * 3)],
          progress: Math.random(),
          timestamp: new Date().toISOString(),
        };
        break;
      case "model_update":
        mockData = {
          version: `${Math.floor(Math.random() * 5)}.${Math.floor(Math.random() * 10)}`,
          changes: ["Improved quality", "Added new features", "Fixed bugs", "Enhanced performance"][Math.floor(Math.random() * 4)],
          timestamp: new Date().toISOString(),
        };
        break;
    }
    
    this.handlers.get(randomEvent)?.forEach(handler => {
      handler(mockData);
    });
  }
  
  private generateMockErrorReport() {
    const errorTypes = ["audio_processing", "model_training", "inference", "network", "server"];
    const totalErrors = Math.floor(Math.random() * 50);
    
    // Generate error breakdown by type
    const errorsByType: Record<string, number> = {};
    for (const type of errorTypes) {
      errorsByType[type] = Math.floor(Math.random() * 20);
    }
    
    // Generate recent errors
    const recentErrors = [];
    for (let i = 0; i < 5; i++) {
      const errorType = errorTypes[Math.floor(Math.random() * errorTypes.length)];
      recentErrors.push({
        type: errorType,
        count: Math.floor(Math.random() * 10) + 1,
        timestamp: Date.now() - i * 1000 * 60 * Math.floor(Math.random() * 30),
        details: [
          "Failed to process audio segment",
          "Model training diverged",
          "Inference timeout",
          "Network connection interrupted",
          "Server resource limit reached"
        ][Math.floor(Math.random() * 5)],
      });
    }
    
    return {
      totalErrors,
      errorsByType,
      recentErrors,
      errorRate: Math.random() * 0.1,
    };
  }
} 
"use client";

/**
 * Collaboration service for voice cloning model collaboration
 * This is a mock implementation for development
 */

type EventHandler = (data: any) => void;

export class CollaborationService {
  private handlers: Map<string, Set<EventHandler>> = new Map();
  private isConnected: boolean = false;
  private mockInterval: NodeJS.Timeout | null = null;
  private modelId: number;
  private userId: string;

  constructor(modelId: number, userId: string) {
    this.modelId = modelId;
    this.userId = userId;
  }

  connect() {
    this.isConnected = true;
    
    // Simulate receiving random events for development
    this.mockInterval = setInterval(() => {
      if (!this.isConnected) return;
      
      this.generateMockEvent();
    }, 5000);
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
  }

  unsubscribe(eventType: string, handler: EventHandler) {
    this.handlers.get(eventType)?.delete(handler);
  }

  sendEvent(eventType: string, data: any) {
    if (!this.isConnected) return;
    
    // For a real implementation this would send to the WebSocket:
    // this.socket.send(JSON.stringify({ type: eventType, data }));
    
    // For the mock implementation, we just log the event
    console.log(`Sending event ${eventType}:`, data);
    
    // For testing, we can immediately simulate receiving the event back
    if (eventType === "drawing_event") {
      this.handlers.get(eventType)?.forEach(handler => {
        handler({ type: eventType, data });
      });
    }
  }

  // Mock event generator
  private generateMockEvent() {
    const eventTypes = ["user_joined", "user_left", "parameter_change", "model_update", "comment_added"];
    const randomEvent = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    
    if (!this.handlers.has(randomEvent)) return;
    
    const users = [
      { id: "user1", name: "Alice", avatar: "https://ui-avatars.com/api/?name=Alice" },
      { id: "user2", name: "Bob", avatar: "https://ui-avatars.com/api/?name=Bob" },
      { id: "user3", name: "Charlie", avatar: "https://ui-avatars.com/api/?name=Charlie" },
    ];
    
    // Don't include the current user in the random selection
    const randomUser = users.find(u => u.id !== this.userId) || users[0];
    
    const mockData: Record<string, any> = {
      type: randomEvent,
      user: randomUser,
      timestamp: new Date().toISOString(),
    };
    
    switch (randomEvent) {
      case "parameter_change":
        mockData.data = {
          parameter: ["pitch", "timbre", "speed", "emotion"][Math.floor(Math.random() * 4)],
          value: Math.random().toFixed(2),
        };
        break;
      case "comment_added":
        mockData.data = {
          comment: ["Sounds great!", "Let's adjust the pitch a bit.", "I like this version better.", "Can we try a different emotion?"][Math.floor(Math.random() * 4)],
        };
        break;
    }
    
    this.handlers.get(randomEvent)?.forEach(handler => {
      handler(mockData);
    });
  }
}

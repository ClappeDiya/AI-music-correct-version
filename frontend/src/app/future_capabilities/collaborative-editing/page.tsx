"use client";

import { useEffect, useState, useRef } from "react";
import { useTheme } from "next-themes";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Slider } from "@/components/ui/Slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { useToast } from "@/components/ui/useToast";
import {
  Users,
  Music,
  Save,
  Undo,
  Redo,
  Clock,
  Share2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

interface User {
  id: string;
  username: string;
  color: string;
  cursor?: {
    x: number;
    y: number;
    element: string;
  };
}

interface EditHistory {
  version: number;
  user: string;
  timestamp: Date;
  changes: any;
}

const COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEEAD",
  "#D4A5A5",
  "#9B59B6",
  "#3498DB",
];

export default function CollaborativeEditing() {
  const { theme } = useTheme();
  const { toast } = useToast();
  const ws = useRef<WebSocket | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [editHistory, setEditHistory] = useState<EditHistory[]>([]);
  const [currentVersion, setCurrentVersion] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!sessionId) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws/session/${sessionId}/`;
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      setIsConnected(true);
      toast({
        title: "Connected to session",
        description: "You can now collaborate in real-time",
      });
    };

    ws.current.onclose = () => {
      setIsConnected(false);
      toast({
        title: "Disconnected from session",
        description: "Attempting to reconnect...",
        variant: "destructive",
      });
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleWebSocketMessage(data);
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [sessionId]);

  // Handle incoming WebSocket messages
  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case "user_join":
        handleUserJoin(data);
        break;
      case "user_leave":
        handleUserLeave(data);
        break;
      case "cursor_update":
        handleCursorUpdate(data);
        break;
      case "edit_made":
        handleEditMade(data);
        break;
      case "session_state":
        handleSessionState(data);
        break;
    }
  };

  // Join or create a session
  const joinSession = async (id: string) => {
    try {
      const response = await api.post("/api/collaboration-sessions/join", {
        session_id: id,
      });
      setSessionId(id);
      toast({
        title: "Joined session",
        description: `Successfully joined session ${id}`,
      });
    } catch (error) {
      toast({
        title: "Error joining session",
        description: "Failed to join the session",
        variant: "destructive",
      });
    }
  };

  // Send cursor position updates
  const updateCursor = (event: React.MouseEvent) => {
    if (!ws.current || !isConnected) return;

    const element = (event.target as HTMLElement).closest("[data-element-id]");
    const elementId = element?.getAttribute("data-element-id") || "";

    ws.current.send(
      JSON.stringify({
        type: "cursor_move",
        position: {
          x: event.clientX,
          y: event.clientY,
        },
        element_id: elementId,
      }),
    );
  };

  // Send edit updates
  const sendEdit = (editData: any) => {
    if (!ws.current || !isConnected) return;

    ws.current.send(
      JSON.stringify({
        type: "edit",
        edit_data: editData,
      }),
    );
  };

  // Handle user cursors
  const renderCursors = () => {
    return users.map((user) => {
      if (!user.cursor) return null;

      return (
        <div
          key={user.id}
          className="absolute pointer-events-none z-50"
          style={{
            left: user.cursor.x,
            top: user.cursor.y,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: user.color }}
          />
          <span
            className="ml-2 px-2 py-1 rounded text-xs text-white"
            style={{ backgroundColor: user.color }}
          >
            {user.username}
          </span>
        </div>
      );
    });
  };

  return (
    <div className="container mx-auto p-6" onMouseMove={updateCursor}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Collaborative Music Creation</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <Clock className="mr-2 h-4 w-4" />
            <span>Version {currentVersion}</span>
          </div>
          <Button
            variant="outline"
            onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
          >
            <Save className="mr-2 h-4 w-4" />
            {autoSaveEnabled ? "Auto-save On" : "Auto-save Off"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <Tabs defaultValue="track">
              <TabsList>
                <TabsTrigger value="track">Track View</TabsTrigger>
                <TabsTrigger value="piano-roll">Piano Roll</TabsTrigger>
                <TabsTrigger value="mixer">Mixer</TabsTrigger>
              </TabsList>
              <TabsContent value="track">
                {/* Track view content */}
              </TabsContent>
              <TabsContent value="piano-roll">
                {/* Piano roll content */}
              </TabsContent>
              <TabsContent value="mixer">{/* Mixer content */}</TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* Collaboration Panel */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Users className="mr-2" /> Collaborators
          </h2>
          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-2 rounded"
                style={{ backgroundColor: `${user.color}20` }}
              >
                <div className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: user.color }}
                  />
                  <span>{user.username}</span>
                </div>
              </div>
            ))}
          </div>

          <h3 className="text-lg font-semibold mt-6 mb-4">Edit History</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {editHistory.map((edit, index) => (
              <div key={index} className="text-sm p-2 rounded bg-muted">
                <div className="flex justify-between">
                  <span>{edit.user}</span>
                  <span className="text-muted-foreground">
                    {new Date(edit.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Version {edit.version}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Render user cursors */}
      {renderCursors()}
    </div>
  );
}

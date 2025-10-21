"use client";

import { useEffect, useState, useRef } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/useToast";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import {
  MessageSquare,
  Video,
  Mic,
  MicOff,
  VideoOff,
  Pin,
  ListTodo,
  Send,
  Plus,
} from "lucide-react";
import { useWebSocket } from "@/hooks/useWebSocket";
import { api } from "@/lib/api";

interface Message {
  id: string;
  userId: string;
  username: string;
  type: "chat" | "pinned_note" | "todo";
  content: string;
  timestamp: string;
  metadata?: any;
}

interface TodoItem {
  id: string;
  content: string;
  completed: boolean;
  assignedTo?: string;
  dueDate?: string;
}

export default function CommunicationPanel() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [pinnedNotes, setPinnedNotes] = useState<Message[]>([]);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // WebSocket connection for real-time communication
  const { isConnected, sendMessage } = useWebSocket("/ws/communication/", {
    onMessage: (data) => {
      handleWebSocketMessage(data);
    },
  });

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle WebSocket messages
  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case "chat_message":
        setMessages((prev) => [...prev, data.message]);
        break;
      case "pinned_note":
        setPinnedNotes((prev) => [...prev, data.note]);
        break;
      case "todo_update":
        setTodos(data.todos);
        break;
    }
  };

  // Send a chat message
  const sendChatMessage = () => {
    if (!newMessage.trim()) return;

    sendMessage({
      type: "chat_message",
      content: newMessage,
    });
    setNewMessage("");
  };

  // Pin a note to the waveform
  const pinNote = (content: string, position: number) => {
    sendMessage({
      type: "pinned_note",
      content,
      metadata: { position },
    });
  };

  // Add a todo item
  const addTodo = (content: string) => {
    sendMessage({
      type: "todo_add",
      content,
    });
  };

  // Toggle video/audio
  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    // Handle video stream
  };

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
    // Handle audio stream
  };

  return (
    <div className="fixed bottom-0 right-0 p-4 space-y-4">
      {/* Chat Sheet */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon">
            <MessageSquare className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Chat</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-4">
            <ScrollArea className="h-[500px] pr-4">
              {messages.map((message, index) => (
                <div key={message.id} className="mb-4 p-3 rounded-lg bg-muted">
                  <div className="flex justify-between items-start">
                    <span className="font-semibold">{message.username}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="mt-1">{message.content}</p>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </ScrollArea>
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                onKeyPress={(e) => e.key === "Enter" && sendChatMessage()}
              />
              <Button onClick={sendChatMessage}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Video Call Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon">
            <Video className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Video Call</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                className="w-full rounded-lg"
              />
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                <Button variant="secondary" size="icon" onClick={toggleAudio}>
                  {isAudioEnabled ? (
                    <Mic className="h-4 w-4" />
                  ) : (
                    <MicOff className="h-4 w-4" />
                  )}
                </Button>
                <Button variant="secondary" size="icon" onClick={toggleVideo}>
                  {isVideoEnabled ? (
                    <Video className="h-4 w-4" />
                  ) : (
                    <VideoOff className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <video
              ref={remoteVideoRef}
              autoPlay
              className="w-full rounded-lg"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Pinned Notes and Todos */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon">
            <Pin className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Notes & Todos</SheetTitle>
          </SheetHeader>
          <Tabs defaultValue="notes" className="mt-4">
            <TabsList>
              <TabsTrigger value="notes">Pinned Notes</TabsTrigger>
              <TabsTrigger value="todos">Todo List</TabsTrigger>
            </TabsList>
            <TabsContent value="notes">
              <ScrollArea className="h-[400px]">
                {pinnedNotes.map((note) => (
                  <Card key={note.id} className="p-4 mb-4">
                    <div className="flex justify-between items-start">
                      <span className="font-semibold">{note.username}</span>
                      <Pin className="h-4 w-4" />
                    </div>
                    <p className="mt-2">{note.content}</p>
                    {note.metadata?.position && (
                      <span className="text-xs text-muted-foreground">
                        At position: {note.metadata.position}s
                      </span>
                    )}
                  </Card>
                ))}
              </ScrollArea>
            </TabsContent>
            <TabsContent value="todos">
              <ScrollArea className="h-[400px]">
                {todos.map((todo) => (
                  <Card key={todo.id} className="p-4 mb-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => {
                          sendMessage({
                            type: "todo_update",
                            id: todo.id,
                            completed: !todo.completed,
                          });
                        }}
                      />
                      <span className={todo.completed ? "line-through" : ""}>
                        {todo.content}
                      </span>
                    </div>
                    {todo.assignedTo && (
                      <span className="text-xs text-muted-foreground block mt-2">
                        Assigned to: {todo.assignedTo}
                      </span>
                    )}
                  </Card>
                ))}
              </ScrollArea>
              <Button
                onClick={() => {
                  const content = prompt("New todo item:");
                  if (content) addTodo(content);
                }}
                className="mt-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Todo
              </Button>
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>
    </div>
  );
}

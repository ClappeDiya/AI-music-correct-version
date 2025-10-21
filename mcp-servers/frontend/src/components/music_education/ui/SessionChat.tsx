"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { Send, FileUp } from "lucide-react";
import { toast } from "sonner";
import { musicEducationApi } from '@/services/music_education_api";

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  attachments?: { name: string; url: string }[];
}

interface SessionChatProps {
  sessionId: string;
  sessionType: "mentoring" | "peer";
  participants: {
    id: string;
    name: string;
    avatar?: string;
  }[];
  className?: string;
}

export function SessionChat({
  sessionId,
  sessionType,
  participants,
  className,
}: SessionChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadMessages();
    // Set up WebSocket connection for real-time messages
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/chat/${sessionId}`);
    
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages((prev) => [...prev, message]);
    };

    return () => ws.close();
  }, [sessionId]);

  const loadMessages = async () => {
    try {
      const response = await musicEducationApi.getSessionMessages(sessionId);
      setMessages(response.data);
    } catch (error) {
      toast.error("Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    setIsSending(true);
    try {
      await musicEducationApi.sendSessionMessage(sessionId, {
        content: newMessage,
        sessionType,
      });
      setNewMessage("");
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("sessionId", sessionId);
      
      await musicEducationApi.uploadSessionFile(formData);
      toast.success("File uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload file");
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Session Chat</span>
          <div className="flex -space-x-2">
            {participants.map((participant) => (
              <Avatar key={participant.id} className="border-2 border-background">
                <AvatarImage src={participant.avatar} />
                <AvatarFallback>
                  {participant.name.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.senderId === "currentUser" ? "justify-end" : "justify-start"
                }`}
              >
                <div className="flex items-start max-w-[80%] space-x-2">
                  {message.senderId !== "currentUser" && (
                    <Avatar>
                      <AvatarImage src={message.senderAvatar} />
                      <AvatarFallback>
                        {message.senderName.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div>
                    {message.senderId !== "currentUser" && (
                      <p className="text-sm text-muted-foreground mb-1">
                        {message.senderName}
                      </p>
                    )}
                    <div
                      className={`rounded-lg p-3 ${
                        message.senderId === "currentUser"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      {message.attachments?.map((attachment) => (
                        <a
                          key={attachment.url}
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-sm underline mt-2"
                        >
                          {attachment.name}
                        </a>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
        </ScrollArea>
        
        <div className="flex items-center space-x-2 mt-4">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            disabled={isSending}
            aria-label="Message input"
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
            aria-label="Upload file"
            title="Choose a file to upload"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSending}
            aria-label="Upload file"
          >
            <FileUp className="w-4 h-4" />
          </Button>
          <Button onClick={sendMessage} disabled={isSending} aria-label="Send message">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 


"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/useToast";
import {
  Mic,
  MicOff,
  Users,
  MessageCircle,
  Radio,
  Volume2,
  VolumeX,
} from "lucide-react";
import { WebRTCManager } from "@/lib/webrtc";
import {
  voiceChatService,
  VoiceChannel as IVoiceChannel,
  VoiceParticipant,
  ChatMessage,
} from "@/services/voiceChatService";
import { cn } from "@/lib/utils";

interface VoiceChannelProps {
  sessionId: string;
  userId: string;
  className?: string;
}

export function VoiceChannel({
  sessionId,
  userId,
  className,
}: VoiceChannelProps) {
  const { toast } = useToast();
  const [channel, setChannel] = useState<IVoiceChannel | null>(null);
  const [participants, setParticipants] = useState<VoiceParticipant[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const webrtcRef = useRef<WebRTCManager | null>(null);
  const audioElements = useRef<Map<string, HTMLAudioElement>>(new Map());

  useEffect(() => {
    const loadChannel = async () => {
      try {
        const channels = await voiceChatService.getChannels(sessionId);
        if (channels.length > 0) {
          setChannel(channels[0]);
        }
      } catch (error) {
        console.error("Failed to load voice channel:", error);
        toast({
          title: "Error",
          description: "Failed to load voice channel",
          variant: "destructive",
        });
      }
    };

    loadChannel();
  }, [sessionId, toast]);

  useEffect(() => {
    if (!channel) return;

    const initializeWebRTC = async () => {
      try {
        webrtcRef.current = new WebRTCManager(
          channel.ice_servers,
          channel.signaling_url,
        );

        await webrtcRef.current.initialize(
          // Handle participant joined
          (peerId) => {
            console.log("Participant joined:", peerId);
            webrtcRef.current?.startCall(peerId);
          },
          // Handle participant left
          (peerId) => {
            console.log("Participant left:", peerId);
            const audioEl = audioElements.current.get(peerId);
            if (audioEl) {
              audioEl.remove();
              audioElements.current.delete(peerId);
            }
          },
          // Handle new audio track
          (peerId, stream) => {
            let audioEl = audioElements.current.get(peerId);
            if (!audioEl) {
              audioEl = new Audio();
              audioElements.current.set(peerId, audioEl);
            }
            audioEl.srcObject = stream;
            audioEl.play().catch(console.error);
          },
        );

        const participant = await voiceChatService.joinChannel(
          channel.id,
          userId,
        );
        setIsConnected(true);
        toast({
          title: "Connected",
          description: "Successfully joined voice channel",
        });
      } catch (error) {
        console.error("Failed to initialize WebRTC:", error);
        toast({
          title: "Error",
          description: "Failed to join voice channel",
          variant: "destructive",
        });
      }
    };

    initializeWebRTC();

    return () => {
      webrtcRef.current?.cleanup();
      audioElements.current.forEach((audio) => audio.remove());
      audioElements.current.clear();
    };
  }, [channel, userId, toast]);

  const handleToggleMute = async () => {
    if (!channel) return;

    try {
      const newMuteState = !isMuted;
      webrtcRef.current?.setMuted(newMuteState);
      setIsMuted(newMuteState);

      const participant = participants.find((p) => p.user.id === userId);
      if (participant) {
        await voiceChatService.toggleMute(participant.id);
      }
    } catch (error) {
      console.error("Failed to toggle mute:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!channel || !newMessage.trim()) return;

    try {
      const message = await voiceChatService.sendMessage(
        channel.id,
        newMessage.trim(),
      );
      setMessages((prev) => [...prev, message]);
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="h-5 w-5" />
            Voice Channel
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleMute}
              className={cn("transition-colors", isMuted && "text-destructive")}
            >
              {isMuted ? (
                <MicOff className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsConnected(!isConnected)}
            >
              {isConnected ? (
                <Volume2 className="h-5 w-5" />
              ) : (
                <VolumeX className="h-5 w-5" />
              )}
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          {isConnected
            ? "Connected to voice chat"
            : "Disconnected from voice chat"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Participants List */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Participants ({participants.length})
            </h3>
            <ScrollArea className="h-[200px] w-full rounded-md border p-2">
              {participants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between py-2"
                >
                  <span className="text-sm">{participant.user.username}</span>
                  <div className="flex items-center gap-2">
                    {participant.is_speaking && (
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                    )}
                    {participant.is_muted && (
                      <MicOff className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              ))}
            </ScrollArea>
          </div>

          {/* Chat Messages */}
          <div className="md:col-span-2 space-y-2">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Chat
            </h3>
            <ScrollArea className="h-[200px] w-full rounded-md border p-2">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "py-2 px-3 rounded-lg mb-2",
                    message.user.id === userId
                      ? "bg-primary/10 ml-auto"
                      : "bg-muted",
                    message.is_system_message && "bg-secondary/20 italic",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">
                      {message.user.username}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(message.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm mt-1">{message.content}</p>
                </div>
              ))}
            </ScrollArea>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Type a message..."
                className="flex-1 rounded-md border p-2 text-sm"
              />
              <Button
                size="sm"
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
              >
                Send
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

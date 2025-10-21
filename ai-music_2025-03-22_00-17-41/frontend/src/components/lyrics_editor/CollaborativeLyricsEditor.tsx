"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { LyricsEditor } from "./LyricsEditor";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/useToast";
import { Share2, Users, Lock, Copy } from "lucide-react";
import { WebSocketManager } from "@/lib/websocket-manager";

interface Collaborator {
  id: string;
  name: string;
  cursorPosition?: number;
  isActive: boolean;
}

interface CollaborativeLyricsEditorProps {
  trackId: number;
  className?: string;
  isOwner?: boolean;
}

export function CollaborativeLyricsEditor({
  trackId,
  className,
  isOwner = false,
}: CollaborativeLyricsEditorProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [shareLink, setShareLink] = useState<string>("");
  const wsRef = useRef<WebSocketManager | null>(null);

  useEffect(() => {
    // Initialize WebSocket connection for real-time collaboration
    const initializeWebSocket = () => {
      // Skip WebSocket initialization on server-side
      if (typeof window === 'undefined') return;
      
      wsRef.current = new WebSocketManager("lyrics_generation");
      wsRef.current.connect(`lyrics-collab-${trackId}`);

      // Handle collaborator presence
      wsRef.current.subscribe("collaborator_joined", (data) => {
        setCollaborators((prev) => [...prev, data.collaborator]);
        toast({
          title: "Collaborator Joined",
          description: `${data.collaborator.name} joined the session`,
        });
      });

      wsRef.current.subscribe("collaborator_left", (data) => {
        setCollaborators((prev) =>
          prev.filter((c) => c.id !== data.collaboratorId),
        );
      });

      // Handle cursor position updates
      wsRef.current.subscribe("cursor_update", (data) => {
        setCollaborators((prev) =>
          prev.map((c) =>
            c.id === data.collaboratorId
              ? { ...c, cursorPosition: data.position }
              : c,
          ),
        );
      });
    };

    initializeWebSocket();

    // Load share link if owner
    if (isOwner) {
      loadShareLink();
    }

    return () => {
      if (wsRef.current && typeof window !== 'undefined') {
        wsRef.current.disconnect();
      }
    };
  }, [trackId, isOwner]);

  const loadShareLink = async () => {
    try {
      // This would be replaced with an actual API call
      // For now, use mock implementation
      // const response = await fetch(`/api/lyrics/${trackId}/share-link`);
      // if (!response.ok) throw new Error("Failed to load share link");
      // const data = await response.json();
      
      // Mock data for development
      const data = {
        shareLink: `https://example.com/share/${trackId}-${Math.random().toString(36).substring(2, 8)}`
      };
      
      setShareLink(data.shareLink);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load share link",
      });
    }
  };

  const generateNewShareLink = async () => {
    try {
      // This would be replaced with an actual API call
      // For now, use mock implementation
      // const response = await fetch(`/api/lyrics/${trackId}/share-link`, {
      //   method: "POST",
      // });
      // if (!response.ok) throw new Error("Failed to generate share link");
      // const data = await response.json();
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock data for development
      const data = {
        shareLink: `https://example.com/share/${trackId}-${Math.random().toString(36).substring(2, 8)}`
      };
      
      setShareLink(data.shareLink);
      toast({
        title: "Success",
        description: "New share link generated",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate share link",
      });
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    toast({
      title: "Copied",
      description: "Share link copied to clipboard",
    });
  };

  const handleCursorMove = (position: number) => {
    wsRef.current?.send({
      type: "cursor_update",
      position,
    });
  };

  return (
    <div className={className}>
      {/* Collaboration controls for owner */}
      {isOwner && (
        <Card className="mb-4">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span>
                  {collaborators.length} active collaborator
                  {collaborators.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex flex-1 items-center gap-2 sm:ml-4">
                <Input
                  value={shareLink}
                  readOnly
                  className="flex-1"
                  placeholder="Generate a share link..."
                />
                <Button
                  variant="outline"
                  onClick={copyShareLink}
                  className="h-10 w-10 p-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={generateNewShareLink}
                  className="h-10 w-10 p-0"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active collaborators list */}
      {collaborators.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {collaborators.map((collaborator) => (
            <div
              key={collaborator.id}
              className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-sm"
            >
              <div
                className={`h-2 w-2 rounded-full ${
                  collaborator.isActive ? "bg-green-500" : "bg-gray-500"
                }`}
              />
              <span>{collaborator.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Main lyrics editor */}
      <LyricsEditor trackId={trackId} />
    </div>
  );
}

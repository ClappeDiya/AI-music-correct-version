"use client";

import React, { useState, useEffect } from "react";
import { useLanguageStore } from "@/stores/languageStore";
import { AnnouncementCreator } from "./AnnouncementCreator";
import { AnnouncementQueue } from "./AnnouncementQueue";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useToast } from "@/components/ui/useToast";
import { cn } from "@/lib/utils";

interface AnnouncementSystemProps {
  sessionId: number;
  className?: string;
}

interface Announcement {
  id: string;
  text: string;
  language: string;
  status: "pending" | "playing" | "completed" | "failed";
  created_at: string;
  voice_style: string;
}

export function AnnouncementSystem({
  sessionId,
  className,
}: AnnouncementSystemProps) {
  const { currentLanguage } = useLanguageStore();
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    loadAnnouncements();
    const interval = setInterval(loadAnnouncements, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [sessionId]);

  const loadAnnouncements = async () => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/announcements`);
      if (!response.ok) throw new Error("Failed to load announcements");
      const data = await response.json();
      setAnnouncements(data);
      setIsPlaying(data.some((a: Announcement) => a.status === "playing"));
    } catch (error) {
      console.error("Failed to load announcements:", error);
    }
  };

  const handleAnnouncementCreate = (announcement: Announcement) => {
    setAnnouncements((prev) => [...prev, announcement]);
  };

  const handleAnnouncementRemove = (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
  };

  const handlePlayPause = async () => {
    try {
      const response = await fetch(
        `/api/sessions/${sessionId}/announcements/playback`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: isPlaying ? "pause" : "play" }),
        },
      );

      if (!response.ok) throw new Error("Failed to control playback");

      setIsPlaying(!isPlaying);
      toast({
        title: "Success",
        description: `Playback ${isPlaying ? "paused" : "resumed"}`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to control playback",
      });
    }
  };

  const handleAnnouncementSkip = async () => {
    try {
      const response = await fetch(
        `/api/sessions/${sessionId}/announcements/skip`,
        { method: "POST" },
      );

      if (!response.ok) throw new Error("Failed to skip announcement");

      toast({
        title: "Success",
        description: "Skipped to next announcement",
      });

      loadAnnouncements();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to skip announcement",
      });
    }
  };

  return (
    <div
      className={cn(
        "h-[600px] sm:h-[700px] lg:h-[800px]",
        "flex flex-col lg:flex-row gap-4 lg:gap-0",
        className,
      )}
    >
      {/* Mobile/Tablet Layout */}
      <div className="lg:hidden flex flex-col gap-4">
        <AnnouncementCreator
          sessionId={sessionId}
          onAnnouncementCreate={handleAnnouncementCreate}
          className="w-full"
        />
        <AnnouncementQueue
          sessionId={sessionId}
          announcements={announcements}
          onAnnouncementRemove={handleAnnouncementRemove}
          onAnnouncementSkip={handleAnnouncementSkip}
          onPlayPause={handlePlayPause}
          isPlaying={isPlaying}
          className="w-full"
        />
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block w-full h-full">
        <ResizablePanelGroup
          direction="horizontal"
          className="h-full rounded-lg border"
        >
          <ResizablePanel defaultSize={40} minSize={30}>
            <AnnouncementCreator
              sessionId={sessionId}
              onAnnouncementCreate={handleAnnouncementCreate}
              className="h-full rounded-none border-0"
            />
          </ResizablePanel>

          <ResizableHandle />

          <ResizablePanel defaultSize={60} minSize={40}>
            <AnnouncementQueue
              sessionId={sessionId}
              announcements={announcements}
              onAnnouncementRemove={handleAnnouncementRemove}
              onAnnouncementSkip={handleAnnouncementSkip}
              onPlayPause={handlePlayPause}
              isPlaying={isPlaying}
              className="h-full rounded-none border-0"
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}

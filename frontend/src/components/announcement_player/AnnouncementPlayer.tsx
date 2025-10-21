"use client";

import React, { useEffect, useCallback } from "react";
import { useAnnouncementStore } from "@/services/announcementService";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/useToast";
import { Volume2, VolumeX, Hash, StopCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnnouncementPlayerProps {
  sessionId: number;
  className?: string;
}

export function AnnouncementPlayer({
  sessionId,
  className,
}: AnnouncementPlayerProps) {
  const { isPlaying, currentAnnouncement, audioQueue, setCurrentAnnouncement } =
    useAnnouncementStore();
  const { toast } = useToast();

  const generateAndPlayAnnouncement = useCallback(
    async (text: string) => {
      try {
        const response = await fetch(
          `/api/sessions/${sessionId}/announcements/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ text }),
          },
        );

        if (!response.ok) {
          throw new Error("Failed to generate announcement");
        }

        const blob = await response.blob();
        const audio = new Audio(URL.createObjectURL(blob));
        await audio.play();
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to play announcement. Please try again.",
        });
      }
    },
    [sessionId, toast],
  );

  const handleStop = useCallback(() => {
    const audio = document.querySelector("audio");
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setCurrentAnnouncement(null);
  }, [setCurrentAnnouncement]);

  useEffect(() => {
    return () => {
      handleStop();
    };
  }, [handleStop]);

  if (!isPlaying && !currentAnnouncement && audioQueue.length === 0) {
    return null;
  }

  return (
    <Card
      className={cn("fixed bottom-8 right-8 w-[400px] shadow-lg", className)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            {isPlaying ? (
              <Volume2 className="h-5 w-5 text-primary animate-pulse" />
            ) : (
              <VolumeX className="h-5 w-5 text-muted-foreground" />
            )}
          </div>

          <div className="flex-1 space-y-1">
            {currentAnnouncement && (
              <p className="text-sm leading-tight">{currentAnnouncement}</p>
            )}
            {audioQueue.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {audioQueue.length} announcement
                {audioQueue.length !== 1 ? "s" : ""} in queue
              </p>
            )}
          </div>

          {isPlaying && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleStop}
              className="h-8 w-8"
            >
              <StopCircle className="h-4 w-4" />
            </Button>
          )}
        </div>

        {audioQueue.length > 0 && (
          <ScrollArea className="mt-4 h-[120px]">
            <div className="space-y-2">
              {audioQueue.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 rounded-md bg-muted p-2 text-sm"
                >
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    #{index + 1}
                  </span>
                  <span className="flex-1 truncate">{item.text}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

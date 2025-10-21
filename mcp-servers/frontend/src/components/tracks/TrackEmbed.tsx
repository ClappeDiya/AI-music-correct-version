"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/componen../ui/card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { PlaybackControls } from "@/app/ai_music/components/PlaybackControls";
import { TrackReference } from "@/services/trackReferenceService";
import { audioPreviewService } from "@/services/audioPreviewService";
import { useToast } from "@/components/ui/usetoast";
import { Clock, Music2, Tag, User } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { formatDistanceToNow } from "date-fns";

interface TrackEmbedProps {
  referenceId: string;
  showHeader?: boolean;
  showVersions?: boolean;
  onVersionChange?: (version: number) => void;
  className?: string;
}

export function TrackEmbed({
  referenceId,
  showHeader = true,
  showVersions = false,
  onVersionChange,
  className = "",
}: TrackEmbedProps) {
  const { toast } = useToast();
  const [reference, setReference] = useState<TrackReference>();
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  // Load track reference data
  useEffect(() => {
    const loadReference = async () => {
      try {
        const response = await fetch(`/api/track-references/${referenceId}`);
        if (!response.ok) throw new Error("Failed to load track reference");
        const data = await response.json();
        setReference(data);
      } catch (error) {
        console.error("Error loading track reference:", error);
        toast({
          title: "Error",
          description: "Failed to load track data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadReference();
  }, [referenceId, toast]);

  // Handle playback controls
  const handlePlayPause = async () => {
    if (!reference) return;

    if (isPlaying) {
      audioPreviewService.stopPreview();
      setIsPlaying(false);
    } else {
      try {
        const previewData = await audioPreviewService.playPreview(
          reference.originalTrackId,
          {
            duration: 30,
            quality: "medium",
          },
        );
        setDuration(previewData.duration);
        setIsPlaying(true);
      } catch (error) {
        console.error("Failed to play preview:", error);
        toast({
          title: "Error",
          description: "Failed to play audio preview",
          variant: "destructive",
        });
      }
    }
  };

  const handleSeek = (time: number) => {
    setCurrentTime(time);
    audioPreviewService.seekTo(time);
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    audioPreviewService.setVolume(newVolume);
  };

  // Stop preview on unmount
  useEffect(() => {
    return () => {
      audioPreviewService.stopPreview();
    };
  }, []);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!reference) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Track not found or inaccessible
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Music2 className="h-5 w-5" />
            {reference.metadata.title}
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>Created by {reference.userId}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>Version {reference.currentVersion}</span>
            </div>
            {reference.metadata.tags && reference.metadata.tags.length > 0 && (
              <div className="flex items-center gap-1">
                <Tag className="h-4 w-4" />
                <div className="flex flex-wrap gap-1">
                  {reference.metadata.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardHeader>
      )}
      <CardContent className="space-y-4">
        {/* Playback Controls */}
        <PlaybackControls
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          onSeek={handleSeek}
          onVolumeChange={handleVolumeChange}
          currentTime={currentTime}
          duration={duration}
          volume={volume}
        />

        {/* Version History */}
        {showVersions && reference.versions.length > 1 && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Version History</div>
            <ScrollArea className="h-32">
              <div className="space-y-2">
                {reference.versions.map((version) => (
                  <Button
                    key={version.id}
                    variant={
                      version.version === reference.currentVersion
                        ? "secondary"
                        : "ghost"
                    }
                    className="w-full justify-start text-left"
                    onClick={() => onVersionChange?.(version.version)}
                  >
                    <div className="flex flex-col">
                      <span>Version {version.version}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(version.createdAt))} ago
                      </span>
                    </div>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

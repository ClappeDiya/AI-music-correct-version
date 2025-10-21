"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Music2,
  HeartPulse,
  Sparkles,
  PlayCircle,
  ListMusic,
  Plus,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/Tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Track {
  id: string;
  title: string;
  artist: string;
  mood: string;
  energyLevel: number;
  duration: string;
}

interface EmotionalMusicSuggestionProps {
  detectedEmotion: string;
  suggestedTracks: Track[];
  onPlayTrack: (trackId: string) => void;
  onAddToQueue: (trackId: string) => void;
  className?: string;
}

export function EmotionalMusicSuggestion({
  detectedEmotion,
  suggestedTracks,
  onPlayTrack,
  onAddToQueue,
  className,
}: EmotionalMusicSuggestionProps) {
  const getEmotionDescription = (emotion: string) => {
    switch (emotion.toLowerCase()) {
      case "happy":
        return "Upbeat and energetic tracks to maintain your positive mood";
      case "sad":
        return "Comforting and uplifting music to improve your mood";
      case "excited":
        return "High-energy tracks to match your enthusiasm";
      case "calm":
        return "Peaceful and relaxing music to maintain tranquility";
      case "frustrated":
        return "Soothing and calming tracks to help reduce stress";
      default:
        return "Personalized music selection based on your mood";
    }
  };

  const getMoodColor = (mood: string) => {
    switch (mood.toLowerCase()) {
      case "upbeat":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "relaxing":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "energetic":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "peaceful":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "melancholic":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      default:
        return "bg-muted/10 text-muted-foreground border-muted/20";
    }
  };

  return (
    <Card className={cn("w-full max-w-md", className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HeartPulse className="h-5 w-5 text-primary" />
            Mood-Based Suggestions
          </div>
          <Badge variant="outline" className="capitalize">
            {detectedEmotion}
          </Badge>
        </CardTitle>
        <CardDescription>
          {getEmotionDescription(detectedEmotion)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {suggestedTracks.map((track) => (
              <div
                key={track.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1 min-w-0 mr-4">
                  <div className="flex items-center gap-2">
                    <Music2 className="h-4 w-4 flex-shrink-0" />
                    <div className="truncate">
                      <p className="font-medium truncate">{track.title}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {track.artist}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge
                      variant="outline"
                      className={cn("text-xs", getMoodColor(track.mood))}
                    >
                      {track.mood}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {track.duration}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onPlayTrack(track.id)}
                          className="h-8 w-8"
                        >
                          <PlayCircle className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Play Now</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onAddToQueue(track.id)}
                          className="h-8 w-8"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Add to Queue</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            ))}

            {suggestedTracks.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <ListMusic className="h-8 w-8 mb-2" />
                <p>No tracks suggested yet</p>
                <p className="text-sm">
                  Start speaking to get personalized suggestions
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

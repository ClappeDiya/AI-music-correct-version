"use client";

import { Button } from "@/components/ui/Button";
import { Slider } from "@/components/ui/Slider";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useState, useCallback } from "react";

interface PlaybackControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  currentTime: number;
  duration: number;
  volume: number;
}

export function PlaybackControls({
  isPlaying,
  onPlayPause,
  onSeek,
  onVolumeChange,
  currentTime,
  duration,
  volume,
}: PlaybackControlsProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(volume);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleVolumeToggle = useCallback(() => {
    if (isMuted) {
      onVolumeChange(previousVolume);
      setIsMuted(false);
    } else {
      setPreviousVolume(volume);
      onVolumeChange(0);
      setIsMuted(true);
    }
  }, [isMuted, volume, previousVolume, onVolumeChange]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSeek(Math.max(0, currentTime - 10))}
        >
          <SkipBack className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="default"
          onClick={onPlayPause}
          className="h-10 w-10"
        >
          {isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSeek(Math.min(duration, currentTime + 10))}
        >
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <span className="text-sm tabular-nums">{formatTime(currentTime)}</span>
        <Slider
          value={[currentTime]}
          max={duration}
          step={1}
          onValueChange={([value]) => onSeek(value)}
          className="flex-1"
        />
        <span className="text-sm tabular-nums">{formatTime(duration)}</span>
      </div>

      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" onClick={handleVolumeToggle}>
          {isMuted || volume === 0 ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </Button>
        <Slider
          value={[volume]}
          max={1}
          step={0.01}
          onValueChange={([value]) => {
            onVolumeChange(value);
            setIsMuted(value === 0);
          }}
          className="w-24"
        />
      </div>
    </div>
  );
}

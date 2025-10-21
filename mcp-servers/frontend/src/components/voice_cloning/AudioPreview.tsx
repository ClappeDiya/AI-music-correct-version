"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { Slider } from "@/components/ui/Slider";
import {
  voiceApplication,
  VoicePreviewResult,
} from "@/services/api/voice-application";
import { Play, Pause, RotateCcw, Volume2 } from "lucide-react";

interface AudioPreviewProps {
  previewId: number;
  audioUrl?: string; // Optional direct URL
  onLoad?: () => void;
}

export function AudioPreview({ previewId, audioUrl, onLoad }: AudioPreviewProps) {
  const [preview, setPreview] = useState<VoicePreviewResult | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!audioUrl) {
      const checkStatus = async () => {
        const result = await voiceApplication.getPreviewStatus(previewId);
        setPreview(result);

        if (result.status === "generating") {
          setTimeout(checkStatus, 1000);
        } else if (result.status === "ready" && !audioRef.current) {
          const audio = new Audio(result.preview_url);
          audioRef.current = audio;
          
          audio.addEventListener('loadedmetadata', () => {
            setDuration(audio.duration);
            if (onLoad) onLoad();
          });
          
          audio.addEventListener('timeupdate', updateProgress);
          audio.addEventListener('ended', () => {
            setIsPlaying(false);
            resetAnimation();
          });
        }
      };
      
      checkStatus();
    } else {
      // If direct audioUrl is provided
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.addEventListener('loadedmetadata', () => {
        setDuration(audio.duration);
        if (onLoad) onLoad();
      });
      
      audio.addEventListener('timeupdate', updateProgress);
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        resetAnimation();
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('timeupdate', updateProgress);
        audioRef.current.removeEventListener('ended', () => {
          setIsPlaying(false);
          resetAnimation();
        });
      }
      resetAnimation();
    };
  }, [previewId, audioUrl]);

  const updateProgress = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const resetAnimation = () => {
    if (animationRef.current) {
      window.cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      resetAnimation();
    } else {
      audioRef.current.play();
      animationRef.current = window.requestAnimationFrame(updateProgress);
    }
    
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    if (!audioRef.current) return;
    
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
    
    if (isPlaying) {
      audioRef.current.play();
    }
  };

  const handleSliderChange = (values: number[]) => {
    if (!audioRef.current) return;
    
    const newTime = values[0];
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (values: number[]) => {
    if (!audioRef.current) return;
    
    const newVolume = values[0];
    audioRef.current.volume = newVolume;
    setVolume(newVolume);
  };

  // If preview is still generating and there's no direct audioUrl
  if (!audioUrl && (!preview || preview.status === "generating")) {
    return (
      <div className="flex flex-col items-center justify-center p-4 space-y-4">
        <p className="text-sm">Generating preview...</p>
        <Progress value={preview?.progress || 0} className="w-full" />
      </div>
    );
  }

  // If there was an error generating the preview
  if (!audioUrl && preview?.status === "error") {
    return (
      <div className="flex flex-col items-center justify-center p-4 space-y-2">
        <p className="text-sm text-destructive">Error generating preview</p>
        <Button variant="outline" size="sm">
          Try Again
        </Button>
      </div>
    );
  }

  // Format time to display as MM:SS
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={togglePlayback}
          className="h-8 w-8 p-0"
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="h-8 w-8 p-0"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        <div className="flex flex-col flex-1 space-y-1">
          <Slider
            value={[currentTime]}
            max={duration}
            step={0.1}
            onValueChange={handleSliderChange}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
        <div className="flex items-center space-x-1 w-24">
          <Volume2 className="h-4 w-4 text-muted-foreground" />
          <Slider
            value={[volume]}
            max={1}
            step={0.01}
            onValueChange={handleVolumeChange}
          />
        </div>
      </div>
    </div>
  );
}

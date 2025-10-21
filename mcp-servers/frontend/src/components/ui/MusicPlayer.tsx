"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Repeat,
  Shuffle
} from "./Icons";
import { Slider } from "./Slider";

interface MusicPlayerProps {
  src: string;
  title: string;
  artist?: string;
  coverArt?: string;
  onEnded?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  className?: string;
  autoPlay?: boolean;
  showControls?: boolean;
  loop?: boolean;
}

export function MusicPlayer({
  src,
  title,
  artist,
  coverArt,
  onEnded,
  onNext,
  onPrevious,
  className,
  autoPlay = false,
  showControls = true,
  loop = false,
}: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLooping, setIsLooping] = useState(loop);
  const [isShuffle, setIsShuffle] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(error => {
          console.error("Error playing audio:", error);
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = isLooping;
    }
  }, [isLooping]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedData = () => {
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setProgress((audio.currentTime / audio.duration) * 100);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
      if (onEnded) onEnded();
    };

    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [onEnded]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleProgressChange = (newValue: number[]) => {
    const newTime = (newValue[0] / 100) * duration;
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      setProgress(newValue[0]);
    }
  };

  const handleVolumeChange = (newValue: number[]) => {
    const newVolume = newValue[0] / 100;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className={cn("flex flex-col bg-card rounded-md shadow-md p-4", className)}>
      <audio 
        ref={audioRef} 
        src={src} 
        autoPlay={autoPlay}
        preload="metadata"
        loop={isLooping}
      />
      
      <div className="flex items-center mb-4">
        {coverArt && (
          <div className="w-16 h-16 rounded-md overflow-hidden mr-4">
            <img 
              src={coverArt} 
              alt={`${title} by ${artist}`} 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="flex-grow">
          <h3 className="text-base font-medium truncate">{title}</h3>
          {artist && (
            <p className="text-sm text-muted-foreground truncate">{artist}</p>
          )}
        </div>
      </div>
      
      {showControls && (
        <>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground w-10">
              {formatTime(currentTime)}
            </span>
            <Slider
              className="flex-grow mx-4"
              value={[progress]}
              min={0}
              max={100}
              step={0.1}
              onValueChange={handleProgressChange}
            />
            <span className="text-xs text-muted-foreground w-10">
              {formatTime(duration)}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setIsShuffle(!isShuffle)}
                className={cn(
                  "p-2 text-muted-foreground hover:text-foreground focus:outline-none",
                  isShuffle && "text-primary"
                )}
                aria-label="Shuffle"
              >
                <Shuffle className="h-4 w-4" />
              </button>
              
              <button
                onClick={onPrevious}
                disabled={!onPrevious}
                className="p-2 text-muted-foreground hover:text-foreground focus:outline-none disabled:opacity-50"
                aria-label="Previous track"
              >
                <SkipBack className="h-5 w-5" />
              </button>
              
              <button
                onClick={handlePlayPause}
                className="p-3 bg-primary text-primary-foreground rounded-full mx-2 hover:bg-primary/90 focus:outline-none"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </button>
              
              <button
                onClick={onNext}
                disabled={!onNext}
                className="p-2 text-muted-foreground hover:text-foreground focus:outline-none disabled:opacity-50"
                aria-label="Next track"
              >
                <SkipForward className="h-5 w-5" />
              </button>
              
              <button
                onClick={() => setIsLooping(!isLooping)}
                className={cn(
                  "p-2 text-muted-foreground hover:text-foreground focus:outline-none",
                  isLooping && "text-primary"
                )}
                aria-label="Loop"
              >
                <Repeat className="h-4 w-4" />
              </button>
            </div>
            
            <div className="flex items-center">
              <button
                onClick={handleMuteToggle}
                className="p-2 text-muted-foreground hover:text-foreground focus:outline-none"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </button>
              
              <Slider
                className="w-24 ml-1"
                value={[isMuted ? 0 : volume * 100]}
                min={0}
                max={100}
                onValueChange={handleVolumeChange}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
} 
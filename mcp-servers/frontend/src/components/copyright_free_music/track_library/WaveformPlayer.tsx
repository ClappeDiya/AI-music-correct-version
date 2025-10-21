import { useRef, useEffect, useState } from "react";
import { Track } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import {
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
} from "@/components/ui/Slider";
import { Button } from "@/components/ui/Button";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

interface WaveformPlayerProps {
  track: Track;
  onPlayStateChange?: (isPlaying: boolean) => void;
  className?: string;
}

export function WaveformPlayer({
  track,
  onPlayStateChange,
  className,
}: WaveformPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || !track.metadata.waveform_data) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const waveformData = track.metadata.waveform_data;
    const dpr = window.devicePixelRatio || 1;
    const padding = 20;

    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = (canvas.offsetHeight + padding * 2) * dpr;

    ctx.scale(dpr, dpr);
    ctx.translate(0, canvas.offsetHeight / 2 + padding);

    // Clear the canvas
    ctx.clearRect(
      0,
      -canvas.offsetHeight / 2 - padding,
      canvas.width,
      canvas.height,
    );

    const width = canvas.width / dpr;
    const height = canvas.height / dpr - padding * 2;
    const barWidth = width / waveformData.length;
    const barGap = Math.max(1, barWidth * 0.2);

    // Draw the waveform
    ctx.beginPath();
    ctx.strokeStyle = "var(--primary)";
    ctx.lineWidth = barWidth - barGap;

    for (let i = 0; i < waveformData.length; i++) {
      const x = i * barWidth + barWidth / 2;
      const amplitude = waveformData[i] * (height / 2);

      ctx.moveTo(x, -amplitude);
      ctx.lineTo(x, amplitude);
    }

    ctx.stroke();
  }, [track.metadata.waveform_data]);

  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onPlayStateChange?.(false);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [onPlayStateChange]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }

    setIsPlaying(!isPlaying);
    onPlayStateChange?.(!isPlaying);
  };

  const handleSeek = (value: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = value;
    setCurrentTime(value);
  };

  const handleVolumeChange = (value: number) => {
    if (!audioRef.current) return;
    audioRef.current.volume = value;
    setVolume(value);
    setIsMuted(value === 0);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className={cn("space-y-4", className)}>
      <audio
        ref={audioRef}
        src={track.metadata.preview_url}
        preload="metadata"
      />

      <canvas
        ref={canvasRef}
        className="w-full h-24 cursor-pointer"
        onClick={(e) => {
          if (!audioRef.current) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const percentage = x / rect.width;
          handleSeek(percentage * duration);
        }}
      />

      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={togglePlayPause}
          className="h-8 w-8"
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>

        <div className="flex-1">
          <Slider
            value={[currentTime]}
            max={duration}
            step={0.1}
            onValueChange={([value]) => handleSeek(value)}
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="h-8 w-8"
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume]}
            max={1}
            step={0.01}
            className="w-24"
            onValueChange={([value]) => handleVolumeChange(value)}
          />
        </div>
      </div>
    </div>
  );
}

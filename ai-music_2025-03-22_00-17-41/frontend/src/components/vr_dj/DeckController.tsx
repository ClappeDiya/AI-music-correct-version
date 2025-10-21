"use client";

import React, { useEffect, useRef, useState } from "react";
import { AudioProcessor } from "@/lib/audio/AudioProcessor";
import { useVRDJStore, vrDjService } from "@/services/vrDjService";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Slider } from "@/components/ui/Slider";
import {
  Play,
  Pause,
  SkipForward,
  Volume2,
  VolumeX,
  Music,
  Waveform,
} from "lucide-react";

interface DeckControllerProps {
  side: "left" | "right";
  className?: string;
}

export function DeckController({ side, className }: DeckControllerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const processorRef = useRef<AudioProcessor>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [bpm, setBpm] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const session = useVRDJStore((state) => state.session);

  useEffect(() => {
    if (audioRef.current) {
      // Create dynamic audio source using Web Audio API
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      // Set oscillator properties based on deck side
      oscillator.type = side === "left" ? "sine" : "square";
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime);

      // Set initial volume
      gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);

      // Connect nodes
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Start oscillator
      oscillator.start();

      // Clean up
      return () => {
        oscillator.stop();
        audioContext.close();
      };
    }
  }, [side]);

  useEffect(() => {
    if (audioRef.current && !processorRef.current) {
      const processor = new AudioProcessor();
      processor.initialize(audioRef.current).then(() => {
        processorRef.current = processor;
        // Start BPM detection loop
        const detectBpm = () => {
          if (processorRef.current && isPlaying) {
            const detectedBpm = processorRef.current.getBPM();
            setBpm(detectedBpm);

            // Send control update to backend
            if (session?.id) {
              vrDjService.sendControl({
                session: session.id,
                control_type: `deck_${side}_bpm`,
                value: detectedBpm / 200, // Normalize to 0-1 range
              });
            }
          }
          requestAnimationFrame(detectBpm);
        };
        detectBpm();
      });
    }

    return () => {
      if (processorRef.current) {
        processorRef.current.disconnect();
      }
    };
  }, [side, session?.id, isPlaying]);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);

      // Send control update
      if (session?.id) {
        vrDjService.sendControl({
          session: session.id,
          control_type: `deck_${side}_playing`,
          value: isPlaying ? 0 : 1,
        });
      }
    }
  };

  const handleVolumeChange = (values: number[]) => {
    const newVolume = values[0];
    setVolume(newVolume);
    if (processorRef.current) {
      processorRef.current.setVolume(newVolume);
    }

    // Send control update
    if (session?.id) {
      vrDjService.sendControl({
        session: session.id,
        control_type: `deck_${side}_volume`,
        value: newVolume,
      });
    }
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    if (processorRef.current) {
      processorRef.current.setVolume(isMuted ? volume : 0);
    }
  };

  return (
    <div
      className={cn(
        "p-4 rounded-lg border bg-card text-card-foreground",
        className,
      )}
    >
      <div className="space-y-4">
        {/* Audio Element */}
        <audio
          ref={audioRef}
          src={`/audio/deck_${side}_sample.mp3`}
          crossOrigin="anonymous"
        />

        {/* Track Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music className="h-4 w-4" />
            <span className="text-sm font-medium">
              Track {side.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Waveform className="h-4 w-4" />
            <span className="text-sm">{bpm} BPM</span>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-between">
          <Button variant="outline" size="icon" onClick={handlePlayPause}>
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>

          <Button variant="outline" size="icon" onClick={handleMuteToggle}>
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>

          <Button variant="outline" size="icon">
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        {/* Volume Slider */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Volume</label>
          <Slider
            value={[volume]}
            min={0}
            max={1}
            step={0.01}
            onValueChange={handleVolumeChange}
          />
        </div>

        {/* EQ Controls */}
        <div className="space-y-2">
          <label className="text-sm font-medium">EQ</label>
          <div className="grid grid-cols-3 gap-2">
            {["High", "Mid", "Low"].map((band) => (
              <div key={band} className="space-y-1">
                <label className="text-xs">{band}</label>
                <Slider
                  value={[0.5]}
                  min={0}
                  max={1}
                  step={0.01}
                  orientation="vertical"
                  className="h-24"
                  onValueChange={(values) => {
                    if (session?.id) {
                      vrDjService.sendControl({
                        session: session.id,
                        control_type: `deck_${side}_eq_${band.toLowerCase()}`,
                        value: values[0],
                      });
                    }
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

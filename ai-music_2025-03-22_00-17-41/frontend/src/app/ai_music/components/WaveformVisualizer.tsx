"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { PlayIcon, PauseIcon, SkipBackIcon } from "lucide-react";
let WaveSurfer;
if (typeof window !== "undefined") {
  WaveSurfer = require("wavesurfer.js").default;
}

interface WaveformVisualizerProps {
  audioUrl: string;
  waveformData?: number[];
  className?: string;
}

export function WaveformVisualizer({
  audioUrl,
  waveformData,
  className = "",
}: WaveformVisualizerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize WaveSurfer
    const wavesurfer = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "var(--primary)",
      progressColor: "var(--primary-foreground)",
      cursorColor: "var(--primary)",
      barWidth: 2,
      barGap: 1,
      barRadius: 3,
      responsive: true,
      height: 100,
      normalize: true,
      partialRender: true,
    });

    // Load audio file
    wavesurfer.load(audioUrl);

    // If waveform data is provided, use it instead of computing from audio
    if (waveformData) {
      wavesurfer.setWaveformData(waveformData);
    }

    // Event listeners
    wavesurfer.on("ready", () => {
      setIsLoading(false);
    });

    wavesurfer.on("play", () => setIsPlaying(true));
    wavesurfer.on("pause", () => setIsPlaying(false));
    wavesurfer.on("finish", () => setIsPlaying(false));

    // Store reference
    wavesurferRef.current = wavesurfer;

    // Cleanup
    return () => {
      wavesurfer.destroy();
    };
  }, [audioUrl, waveformData]);

  const togglePlayPause = () => {
    if (!wavesurferRef.current) return;
    wavesurferRef.current.playPause();
  };

  const restart = () => {
    if (!wavesurferRef.current) return;
    wavesurferRef.current.stop();
    wavesurferRef.current.play();
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Waveform</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            <Skeleton className="h-[100px] w-full" />
          ) : (
            <div ref={containerRef} className="w-full" />
          )}

          <div className="flex justify-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={restart}
              disabled={isLoading}
            >
              <SkipBackIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={togglePlayPause}
              disabled={isLoading}
            >
              {isPlaying ? (
                <PauseIcon className="h-4 w-4" />
              ) : (
                <PlayIcon className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Slider } from "@/components/ui/Slider";
import { Play, Pause, SkipBack, Volume2 } from "lucide-react";
import WaveSurfer from "wavesurfer.js";

interface AudioComparisonProps {
  originalAudioUrl: string;
  clonedAudioUrl: string;
  onAnalysisComplete?: (differences: AudioDifferences) => void;
}

interface AudioDifferences {
  pitchDifference: number;
  timbreSimilarity: number;
  rhythmAccuracy: number;
}

export function AudioComparison({
  originalAudioUrl,
  clonedAudioUrl,
  onAnalysisComplete,
}: AudioComparisonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeAudio, setActiveAudio] = useState<"original" | "cloned">(
    "original",
  );

  const originalWaveformRef = useRef<WaveSurfer>();
  const clonedWaveformRef = useRef<WaveSurfer>();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize WaveSurfer instances
    originalWaveformRef.current = WaveSurfer.create({
      container: containerRef.current.querySelector("#original-waveform")!,
      waveColor: "#4F46E5",
      progressColor: "#818CF8",
      cursorColor: "#C7D2FE",
      height: 100,
      normalize: true,
    });

    clonedWaveformRef.current = WaveSurfer.create({
      container: containerRef.current.querySelector("#cloned-waveform")!,
      waveColor: "#059669",
      progressColor: "#34D399",
      cursorColor: "#A7F3D0",
      height: 100,
      normalize: true,
    });

    // Load audio files
    originalWaveformRef.current.load(originalAudioUrl);
    clonedWaveformRef.current.load(clonedAudioUrl);

    // Sync playback
    originalWaveformRef.current.on("audioprocess", () => {
      setCurrentTime(originalWaveformRef.current!.getCurrentTime());
    });

    originalWaveformRef.current.on("ready", () => {
      setDuration(originalWaveformRef.current!.getDuration());
    });

    return () => {
      originalWaveformRef.current?.destroy();
      clonedWaveformRef.current?.destroy();
    };
  }, [originalAudioUrl, clonedAudioUrl]);

  const togglePlayback = () => {
    const activeWaveform =
      activeAudio === "original"
        ? originalWaveformRef.current
        : clonedWaveformRef.current;
    if (activeWaveform?.isPlaying()) {
      activeWaveform.pause();
      setIsPlaying(false);
    } else {
      activeWaveform?.play();
      setIsPlaying(true);
    }
  };

  const handleVolumeChange = (value: number) => {
    setVolume(value);
    const activeWaveform =
      activeAudio === "original"
        ? originalWaveformRef.current
        : clonedWaveformRef.current;
    activeWaveform?.setVolume(value);
  };

  const handleSeek = (time: number) => {
    const activeWaveform =
      activeAudio === "original"
        ? originalWaveformRef.current
        : clonedWaveformRef.current;
    activeWaveform?.seekTo(time / duration);
    setCurrentTime(time);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audio Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={containerRef} className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Original Audio</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveAudio("original")}
                className={activeAudio === "original" ? "bg-primary/10" : ""}
              >
                Select
              </Button>
            </div>
            <div id="original-waveform" />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Cloned Audio</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveAudio("cloned")}
                className={activeAudio === "cloned" ? "bg-primary/10" : ""}
              >
                Select
              </Button>
            </div>
            <div id="cloned-waveform" />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleSeek(0)}
                >
                  <SkipBack className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={togglePlayback}>
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                <Slider
                  value={[volume]}
                  onValueChange={([value]) => handleVolumeChange(value)}
                  min={0}
                  max={1}
                  step={0.1}
                  className="w-[100px]"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">{formatTime(currentTime)}</span>
              <Slider
                value={[currentTime]}
                onValueChange={([value]) => handleSeek(value)}
                min={0}
                max={duration}
                step={0.1}
                className="flex-1"
              />
              <span className="text-sm">{formatTime(duration)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import React, { useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Activity, Clock, Music2, TrendingUp, HeartPulse } from "lucide-react";
import { cn } from "@/lib/utils";

interface JourneyPoint {
  energy: number;
  mood: string;
  duration: number;
  timestamp?: number;
}

interface JourneyVisualizerProps {
  currentJourney: JourneyPoint[];
  progress: number;
  currentTrack?: {
    title: string;
    artist: string;
    duration: number;
    progress: number;
  };
  className?: string;
}

export function JourneyVisualizer({
  currentJourney,
  progress,
  currentTrack,
  className,
}: JourneyVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawJourneyGraph = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
  ) => {
    ctx.clearRect(0, 0, width, height);

    // Calculate total duration
    const totalDuration = currentJourney.reduce(
      (acc, point) => acc + point.duration,
      0,
    );

    // Draw background grid
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1;

    // Vertical grid lines
    for (let i = 0; i <= width; i += width / 10) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }

    // Horizontal grid lines
    for (let i = 0; i <= height; i += height / 5) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }

    // Draw journey line
    ctx.beginPath();
    ctx.strokeStyle = "hsl(var(--primary))";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    let currentX = 0;
    currentJourney.forEach((point, index) => {
      const x = (currentX / totalDuration) * width;
      const y = height - (point.energy / 100) * height;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        // Create a smooth curve between points
        const prevPoint = currentJourney[index - 1];
        const prevX = ((currentX - prevPoint.duration) / totalDuration) * width;
        const prevY = height - (prevPoint.energy / 100) * height;

        const cp1x = prevX + (x - prevX) / 3;
        const cp1y = prevY;
        const cp2x = prevX + ((x - prevX) * 2) / 3;
        const cp2y = y;

        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
      }

      currentX += point.duration;
    });
    ctx.stroke();

    // Draw progress indicator
    const progressX = (progress / 100) * width;
    ctx.beginPath();
    ctx.strokeStyle = "hsl(var(--primary))";
    ctx.fillStyle = "hsl(var(--background))";
    ctx.lineWidth = 2;
    ctx.arc(
      progressX,
      height - (getCurrentEnergy() / 100) * height,
      6,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.stroke();
  };

  const getCurrentEnergy = () => {
    if (!currentJourney.length) return 0;

    const totalDuration = currentJourney.reduce(
      (acc, point) => acc + point.duration,
      0,
    );
    const currentTime = (progress / 100) * totalDuration;

    let accumulatedTime = 0;
    for (let i = 0; i < currentJourney.length - 1; i++) {
      const point = currentJourney[i];
      const nextPoint = currentJourney[i + 1];
      accumulatedTime += point.duration;

      if (currentTime <= accumulatedTime) {
        const progressInSegment =
          (currentTime - (accumulatedTime - point.duration)) / point.duration;
        return (
          point.energy + (nextPoint.energy - point.energy) * progressInSegment
        );
      }
    }

    return currentJourney[currentJourney.length - 1].energy;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        canvas.width = width;
        canvas.height = height;
        drawJourneyGraph(ctx, width, height);
      }
    });

    resizeObserver.observe(canvas.parentElement!);

    return () => {
      resizeObserver.disconnect();
    };
  }, [currentJourney, progress]);

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Journey Progress
          </div>
          <Badge variant="outline" className="text-sm">
            {Math.round(progress)}% Complete
          </Badge>
        </CardTitle>
        <CardDescription>
          Visualizing your emotional music journey
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="relative aspect-[3/1] w-full">
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full"
            />
          </div>

          {currentTrack && (
            <div className="space-y-2 p-4 rounded-lg border bg-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Music2 className="h-4 w-4" />
                  <div>
                    <p className="font-medium">{currentTrack.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {currentTrack.artist}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {formatTime(currentTrack.progress)} /{" "}
                  {formatTime(currentTrack.duration)}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

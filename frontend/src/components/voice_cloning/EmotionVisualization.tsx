"use client";

import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { PresetEmotion } from "@/services/api/voice-presets";
import { Heart } from "lucide-react";

interface EmotionVisualizationProps {
  emotion: PresetEmotion;
  width?: number;
  height?: number;
}

export function EmotionVisualization({
  emotion,
  width = 300,
  height = 200,
}: EmotionVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    drawEmotionGraph(ctx);
  }, [emotion, width, height]);

  const drawEmotionGraph = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, width, height);

    const emotions = Object.entries(emotion);
    const barWidth = width / emotions.length - 10;
    const maxHeight = height - 40;

    // Draw bars
    emotions.forEach(([name, value], i) => {
      const x = i * (barWidth + 10) + 5;
      const barHeight = value * maxHeight;
      const y = height - barHeight - 20;

      // Create gradient
      const gradient = ctx.createLinearGradient(x, y, x, height - 20);
      gradient.addColorStop(0, getEmotionColor(name, 0.8));
      gradient.addColorStop(1, getEmotionColor(name, 0.4));

      // Draw bar
      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, barWidth, barHeight);

      // Draw label
      ctx.fillStyle = "#ffffff";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(name, x + barWidth / 2, height - 5);

      // Draw value
      ctx.fillText(Math.round(value * 100) + "%", x + barWidth / 2, y - 5);
    });
  };

  const getEmotionColor = (emotion: string, alpha: number): string => {
    const colors: Record<string, string> = {
      happiness: `rgba(255, 193, 7, ${alpha})`,
      sadness: `rgba(33, 150, 243, ${alpha})`,
      anger: `rgba(244, 67, 54, ${alpha})`,
      fear: `rgba(156, 39, 176, ${alpha})`,
      surprise: `rgba(76, 175, 80, ${alpha})`,
    };
    return colors[emotion] || `rgba(158, 158, 158, ${alpha})`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5" />
          Emotional Profile
        </CardTitle>
      </CardHeader>
      <CardContent>
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="border rounded-lg"
        />
      </CardContent>
    </Card>
  );
}

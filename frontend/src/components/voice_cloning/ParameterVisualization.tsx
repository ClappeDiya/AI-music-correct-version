"use client";

import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { VoiceEditConfig } from "@/services/api/voice-editing";
import { Activity } from "lucide-react";

interface ParameterVisualizationProps {
  parameters: VoiceEditConfig["parameters"];
  width?: number;
  height?: number;
}

export function ParameterVisualization({
  parameters,
  width = 400,
  height = 400,
}: ParameterVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    drawRadarChart(ctx);
  }, [parameters, width, height]);

  const drawRadarChart = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 40;

    // Flatten parameters for visualization
    const values = [
      parameters.timbre.brightness,
      parameters.timbre.breathiness,
      parameters.timbre.roughness,
      parameters.pitch.shift / 12, // Normalize to -1 to 1
      parameters.pitch.stability,
      parameters.articulation.clarity,
      parameters.expression.emotion,
      parameters.expression.dynamics,
    ];

    const labels = [
      "Brightness",
      "Breathiness",
      "Roughness",
      "Pitch",
      "Stability",
      "Clarity",
      "Emotion",
      "Dynamics",
    ];

    const angleStep = (Math.PI * 2) / values.length;

    // Draw background
    ctx.beginPath();
    values.forEach((_, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.closePath();
    ctx.fillStyle = "rgba(59, 130, 246, 0.1)";
    ctx.fill();

    // Draw parameter values
    ctx.beginPath();
    values.forEach((value, i) => {
      const normalizedValue = (value + 1) / 2; // Normalize to 0-1
      const angle = i * angleStep - Math.PI / 2;
      const x = centerX + radius * normalizedValue * Math.cos(angle);
      const y = centerY + radius * normalizedValue * Math.sin(angle);

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.closePath();
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "rgba(59, 130, 246, 0.2)";
    ctx.fill();

    // Draw labels
    ctx.fillStyle = "#ffffff";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    labels.forEach((label, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const x = centerX + (radius + 20) * Math.cos(angle);
      const y = centerY + (radius + 20) * Math.sin(angle);
      ctx.fillText(label, x, y);
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Parameter Visualization
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

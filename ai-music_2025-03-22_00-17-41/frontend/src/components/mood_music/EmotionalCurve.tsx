import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";

interface EmotionalCurveProps {
  metadata: {
    emotional_timeline?: {
      time: number;
      intensity: number;
      emotion: string;
    }[];
    duration?: number;
  };
}

export function EmotionalCurve({ metadata }: EmotionalCurveProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeline = metadata.emotional_timeline || [];
  const duration = metadata.duration || 0;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || timeline.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set up dimensions
    const width = canvas.width;
    const height = canvas.height;
    const padding = 20;

    // Draw timeline
    ctx.beginPath();
    ctx.strokeStyle = "#94a3b8"; // slate-400
    ctx.lineWidth = 2;

    timeline.forEach((point, index) => {
      const x = padding + (point.time / duration) * (width - 2 * padding);
      const y = height - (padding + point.intensity * (height - 2 * padding));

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      // Draw emotion label
      ctx.font = "12px sans-serif";
      ctx.fillStyle = "#64748b"; // slate-500
      ctx.fillText(point.emotion, x - 20, y - 10);
    });

    ctx.stroke();

    // Draw axes
    ctx.beginPath();
    ctx.strokeStyle = "#e2e8f0"; // slate-200
    ctx.lineWidth = 1;

    // X axis
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);

    // Y axis
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);

    ctx.stroke();
  }, [timeline, duration]);

  if (!timeline.length) {
    return null;
  }

  return (
    <Card className="p-4 space-y-4">
      <Label>Emotional Progression</Label>
      <div className="relative w-full h-[200px]">
        <canvas
          ref={canvasRef}
          width={800}
          height={200}
          className="w-full h-full"
        />
      </div>
    </Card>
  );
}

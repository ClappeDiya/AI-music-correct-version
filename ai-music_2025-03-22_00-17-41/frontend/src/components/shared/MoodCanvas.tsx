import React, { useRef, useEffect, useState } from "react";
import { Box, useTheme } from "@mui/material";
import { MoodPoint } from "../../types/moodTypes";

interface MoodCanvasProps {
  width: number;
  height: number;
  moodType: string;
  onIntensityChange: (intensity: number, timestamp: number) => void;
  existingPoints?: MoodPoint[];
  isActive?: boolean;
}

const MoodCanvas: React.FC<MoodCanvasProps> = ({
  width,
  height,
  moodType,
  onIntensityChange,
  existingPoints = [],
  isActive = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const theme = useTheme();

  const moodColors = {
    happy: "#FFD700",
    sad: "#4169E1",
    energetic: "#FF4500",
    calm: "#98FB98",
    tense: "#DC143C",
    relaxed: "#87CEEB",
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw existing points
    if (existingPoints.length > 0) {
      ctx.beginPath();
      ctx.moveTo(0, height);

      existingPoints.forEach((point, index) => {
        const x = (point.timestamp / 100) * width;
        const y = height - point.intensity * height;

        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          if (point.transition_type === "linear") {
            ctx.lineTo(x, y);
          } else if (point.transition_type === "exponential") {
            const prevPoint = existingPoints[index - 1];
            const prevX = (prevPoint.timestamp / 100) * width;
            const prevY = height - prevPoint.intensity * height;
            const cp1x = prevX + (x - prevX) * 0.7;
            const cp1y = prevY;
            const cp2x = prevX + (x - prevX) * 0.3;
            const cp2y = y;
            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
          }
        }
      });

      ctx.strokeStyle =
        moodColors[moodType as keyof typeof moodColors] ||
        theme.palette.primary.main;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }, [existingPoints, width, height, moodType, theme]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isActive) return;
    setIsDrawing(true);
    const { intensity, timestamp } = getIntensityAndTimestamp(e);
    onIntensityChange(intensity, timestamp);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isActive) return;
    const { intensity, timestamp } = getIntensityAndTimestamp(e);
    onIntensityChange(intensity, timestamp);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const getIntensityAndTimestamp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { intensity: 0, timestamp: 0 };

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const intensity = Math.max(0, Math.min(1, 1 - y / height));
    const timestamp = (x / width) * 100;

    return { intensity, timestamp };
  };

  return (
    <Box
      sx={{
        position: "relative",
        width,
        height,
        backgroundColor: theme.palette.background.paper,
        borderRadius: 1,
        overflow: "hidden",
        opacity: isActive ? 1 : 0.5,
        cursor: isActive ? "crosshair" : "not-allowed",
      }}
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
        }}
      />
    </Box>
  );
};

export default MoodCanvas;

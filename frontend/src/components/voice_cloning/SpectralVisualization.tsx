"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { AudioAnalysisResult } from "@/services/AudioAnalysis";
import { Activity } from "lucide-react";

interface SpectralVisualizationProps {
  analysisResult: AudioAnalysisResult;
  width?: number;
  height?: number;
}

type VisualizationType = "spectrogram" | "waveform" | "formants";

export function SpectralVisualization({
  analysisResult,
  width = 800,
  height = 400,
}: SpectralVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visualizationType, setVisualizationType] =
    useState<VisualizationType>("spectrogram");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    switch (visualizationType) {
      case "spectrogram":
        drawSpectrogram(ctx, analysisResult.frequencies);
        break;
      case "waveform":
        drawWaveform(ctx, analysisResult.amplitudes);
        break;
      case "formants":
        drawFormants(ctx, analysisResult.formants, analysisResult.frequencies);
        break;
    }
  }, [analysisResult, visualizationType, width, height]);

  const drawSpectrogram = (
    ctx: CanvasRenderingContext2D,
    frequencies: number[],
  ) => {
    const gradient = ctx.createLinearGradient(0, height, 0, 0);
    gradient.addColorStop(0, "#0f172a");
    gradient.addColorStop(0.5, "#3b82f6");
    gradient.addColorStop(1, "#ef4444");

    ctx.fillStyle = gradient;

    const barWidth = width / frequencies.length;
    frequencies.forEach((frequency, i) => {
      const normalized = (frequency + 140) / 140; // Normalize from dB scale
      const barHeight = normalized * height;
      ctx.fillRect(i * barWidth, height - barHeight, barWidth, barHeight);
    });
  };

  const drawWaveform = (
    ctx: CanvasRenderingContext2D,
    amplitudes: number[],
  ) => {
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 2;
    ctx.beginPath();

    const sliceWidth = width / amplitudes.length;
    let x = 0;

    amplitudes.forEach((amplitude, i) => {
      const y = ((amplitude + 1) / 2) * height;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    });

    ctx.stroke();
  };

  const drawFormants = (
    ctx: CanvasRenderingContext2D,
    formants: number[],
    frequencies: number[],
  ) => {
    // Draw frequency spectrum
    drawSpectrogram(ctx, frequencies);

    // Highlight formants
    ctx.strokeStyle = "#22c55e";
    ctx.lineWidth = 3;

    formants.forEach((formant) => {
      const x = (formant / (frequencies.length * 2)) * width;
      ctx.beginPath();
      ctx.moveTo(x, height);
      ctx.lineTo(x, 0);
      ctx.stroke();
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Spectral Analysis
          </div>
          <Select
            value={visualizationType}
            onValueChange={(value) =>
              setVisualizationType(value as VisualizationType)
            }
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="spectrogram">Spectrogram</SelectItem>
              <SelectItem value="waveform">Waveform</SelectItem>
              <SelectItem value="formants">Formants</SelectItem>
            </SelectContent>
          </Select>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="border rounded-lg"
        />
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm font-medium">Pitch</p>
            <p className="text-2xl">{Math.round(analysisResult.pitch)} Hz</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">Spectral Centroid</p>
            <p className="text-2xl">
              {Math.round(analysisResult.spectralCentroid)} Hz
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">Zero Crossing Rate</p>
            <p className="text-2xl">
              {analysisResult.zeroCrossingRate.toFixed(3)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

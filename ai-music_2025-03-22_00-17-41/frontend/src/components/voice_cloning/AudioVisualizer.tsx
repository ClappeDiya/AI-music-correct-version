"use client";

import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Waveform } from "lucide-react";

interface AudioVisualizerProps {
  audioStream: MediaStream | null;
  type: "waveform" | "spectrum" | "spectrogram";
  width?: number;
  height?: number;
}

export function AudioVisualizer({
  audioStream,
  type,
  width = 400,
  height = 200,
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (!audioStream) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    audioContextRef.current = new AudioContext();
    analyserRef.current = audioContextRef.current.createAnalyser();

    const source = audioContextRef.current.createMediaStreamSource(audioStream);
    source.connect(analyserRef.current);

    switch (type) {
      case "waveform":
        analyserRef.current.fftSize = 2048;
        drawWaveform(ctx);
        break;
      case "spectrum":
        analyserRef.current.fftSize = 256;
        drawSpectrum(ctx);
        break;
      case "spectrogram":
        analyserRef.current.fftSize = 1024;
        drawSpectrogram(ctx);
        break;
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [audioStream, type]);

  const drawWaveform = (ctx: CanvasRenderingContext2D) => {
    const analyser = analyserRef.current;
    if (!analyser) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);

      ctx.fillStyle = "rgb(30, 30, 30)";
      ctx.fillRect(0, 0, width, height);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgb(59, 130, 246)";
      ctx.beginPath();

      const sliceWidth = width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(width, height / 2);
      ctx.stroke();
    };

    draw();
  };

  const drawSpectrum = (ctx: CanvasRenderingContext2D) => {
    const analyser = analyserRef.current;
    if (!analyser) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = "rgb(30, 30, 30)";
      ctx.fillRect(0, 0, width, height);

      const barWidth = width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * height;
        const gradient = ctx.createLinearGradient(
          0,
          height,
          0,
          height - barHeight,
        );
        gradient.addColorStop(0, "rgb(59, 130, 246)");
        gradient.addColorStop(1, "rgb(147, 197, 253)");

        ctx.fillStyle = gradient;
        ctx.fillRect(x, height - barHeight, barWidth, barHeight);
        x += barWidth;
      }
    };

    draw();
  };

  const drawSpectrogram = (ctx: CanvasRenderingContext2D) => {
    // Implementation for spectrogram visualization
    // This is more complex and requires storing historical frequency data
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Waveform className="h-5 w-5" />
          Audio Visualization - {type}
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

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { AudioAnalysisResult, audioAnalysis } from "@/services/AudioAnalysis";
import { Activity, BarChart2, Waves, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/useToast";

interface AdvancedVisualizationProps {
  modelId: number;
  width?: number;
  height?: number;
}

type VisualizationType =
  | "spectrogram"
  | "waveform"
  | "formants"
  | "3d-spectrum"
  | "pitch-contour"
  | "spectral-envelope";

export function AdvancedVisualization({
  modelId,
  width = 800,
  height = 400,
}: AdvancedVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeTab, setActiveTab] = useState<VisualizationType>("spectrogram");
  const [renderMode, setRenderMode] = useState<"2d" | "3d">("2d");
  const animationRef = useRef<number>();
  const [analysisResult, setAnalysisResult] = useState<AudioAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setIsLoading(true);
        const result = await audioAnalysis.getModelAnalysis(modelId);
        setAnalysisResult(result);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load analysis data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalysis();
  }, [modelId, toast]);

  useEffect(() => {
    if (!analysisResult) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext(renderMode === "2d" ? "2d" : "webgl2");
    if (!ctx) return;

    const render = () => {
      if (renderMode === "2d") {
        render2D(ctx as CanvasRenderingContext2D);
      } else {
        render3D(ctx as WebGL2RenderingContext);
      }
      animationRef.current = requestAnimationFrame(render);
    };

    render();
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [analysisResult, activeTab, renderMode]);

  const render2D = (ctx: CanvasRenderingContext2D) => {
    if (!analysisResult) return;
    
    ctx.clearRect(0, 0, width, height);

    switch (activeTab) {
      case "spectrogram":
        renderSpectrogram(ctx);
        break;
      case "waveform":
        renderWaveform(ctx);
        break;
      case "formants":
        renderFormants(ctx);
        break;
      case "pitch-contour":
        renderPitchContour(ctx);
        break;
      case "spectral-envelope":
        renderSpectralEnvelope(ctx);
        break;
    }
  };

  const render3D = (ctx: WebGL2RenderingContext) => {
    // WebGL rendering code for 3D spectrum visualization
    // Implementation details...
  };

  const renderSpectrogram = (ctx: CanvasRenderingContext2D) => {
    if (!analysisResult) return;
    
    const gradient = ctx.createLinearGradient(0, height, 0, 0);
    gradient.addColorStop(0, "#1e293b");
    gradient.addColorStop(0.5, "#3b82f6");
    gradient.addColorStop(1, "#ef4444");

    ctx.fillStyle = gradient;

    const barWidth = width / analysisResult.frequencies.length;
    analysisResult.frequencies.forEach((frequency, i) => {
      const normalized = (frequency + 140) / 140;
      const barHeight = normalized * height;
      ctx.fillRect(i * barWidth, height - barHeight, barWidth, barHeight);
    });
  };

  const renderWaveform = (ctx: CanvasRenderingContext2D) => {
    if (!analysisResult) return;
    
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 2;
    ctx.beginPath();

    const sliceWidth = width / analysisResult.amplitudes.length;
    let x = 0;

    analysisResult.amplitudes.forEach((amplitude, i) => {
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

  const renderFormants = (ctx: CanvasRenderingContext2D) => {
    if (!analysisResult) return;
    
    // Draw frequency spectrum as background
    renderSpectrogram(ctx);

    // Highlight formants
    ctx.strokeStyle = "#22c55e";
    ctx.lineWidth = 3;

    analysisResult.formants.forEach((formant) => {
      const x = (formant / (analysisResult.frequencies.length * 2)) * width;
      ctx.beginPath();
      ctx.moveTo(x, height);
      ctx.lineTo(x, 0);
      ctx.stroke();
    });

    // Add formant labels
    ctx.fillStyle = "#ffffff";
    ctx.font = "12px sans-serif";
    analysisResult.formants.forEach((formant, i) => {
      const x = (formant / (analysisResult.frequencies.length * 2)) * width;
      ctx.fillText(`F${i + 1}: ${Math.round(formant)}Hz`, x + 5, 20 + i * 20);
    });
  };

  const renderPitchContour = (ctx: CanvasRenderingContext2D) => {
    if (!analysisResult) return;
    
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 2;
    ctx.beginPath();

    // Calculate pitch points over time
    const pitchPoints = analysisResult.frequencies.map((f, i) => ({
      x: (i / analysisResult.frequencies.length) * width,
      y: height - (f / 1000) * height,
    }));

    pitchPoints.forEach((point, i) => {
      if (i === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });

    ctx.stroke();

    // Add pitch range indicators
    ctx.fillStyle = "#ffffff";
    ctx.font = "12px sans-serif";
    ctx.fillText(`${Math.round(analysisResult.pitch)}Hz`, 10, 20);
  };

  const renderSpectralEnvelope = (ctx: CanvasRenderingContext2D) => {
    if (!analysisResult) return;
    
    ctx.strokeStyle = "#ec4899";
    ctx.lineWidth = 2;
    ctx.beginPath();

    // Calculate spectral envelope using peak detection
    const envelope = calculateSpectralEnvelope(analysisResult.frequencies);
    envelope.forEach((point, i) => {
      const x = (i / envelope.length) * width;
      const y = height - (point / 140) * height;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();
  };

  // Utility function to calculate spectral envelope
  const calculateSpectralEnvelope = (frequencies: number[]): number[] => {
    // Simple moving maximum algorithm
    const windowSize = 10;
    const envelope: number[] = [];
    
    for (let i = 0; i < frequencies.length; i += windowSize) {
      const window = frequencies.slice(i, i + windowSize);
      const max = Math.max(...window.map(f => Math.abs(f)));
      envelope.push(max);
    }
    
    return envelope;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!analysisResult) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <p className="text-muted-foreground">No analysis data available</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Advanced Visualization
          </div>
          <Select
            value={renderMode}
            onValueChange={(value) => setRenderMode(value as "2d" | "3d")}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2d">2D</SelectItem>
              <SelectItem value="3d">3D</SelectItem>
            </SelectContent>
          </Select>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as VisualizationType)}
        >
          <TabsList>
            <TabsTrigger
              value="spectrogram"
              className="flex items-center gap-2"
            >
              <BarChart2 className="h-4 w-4" />
              Spectrogram
            </TabsTrigger>
            <TabsTrigger value="waveform" className="flex items-center gap-2">
              <Waves className="h-4 w-4" />
              Waveform
            </TabsTrigger>
            <TabsTrigger value="formants" className="flex items-center gap-2">
              <Waves className="h-4 w-4" />
              Formants
            </TabsTrigger>
            <TabsTrigger
              value="pitch-contour"
              className="flex items-center gap-2"
            >
              <Waves className="h-4 w-4" />
              Pitch Contour
            </TabsTrigger>
            <TabsTrigger
              value="spectral-envelope"
              className="flex items-center gap-2"
            >
              <Waves className="h-4 w-4" />
              Spectral Envelope
            </TabsTrigger>
          </TabsList>

          <div className="mt-4">
            <canvas
              ref={canvasRef}
              width={width}
              height={height}
              className="w-full bg-gray-900 rounded-lg"
            />
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { VoiceAnalysisResult, voiceAnalysis } from "@/services/api/voice-analysis";
import { LineChart } from "@/components/ui/charts/LineChart";
import { DoughnutChart } from "@/components/ui/charts/DoughnutChart";
import { Activity, Waves, Mic2, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/useToast";

interface DetailedMetricsProps {
  modelId: number;
}

export function DetailedMetrics({ modelId }: DetailedMetricsProps) {
  const [analysis, setAnalysis] = useState<VoiceAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setIsLoading(true);
        // Use a dummy analysis ID (1) since we're just getting mock data
        const result = await voiceAnalysis.getAnalysisResults(1);
        setAnalysis(result);
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-60">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!analysis) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No analysis data available</p>
        </CardContent>
      </Card>
    );
  }

  const getEmotionalToneData = () => {
    // This would come from additional analysis metrics
    const emotionalMetrics = {
      neutral: 0.6,
      happy: 0.2,
      sad: 0.1,
      angry: 0.05,
      fearful: 0.05,
    };

    return {
      labels: Object.keys(emotionalMetrics),
      datasets: [
        {
          data: Object.values(emotionalMetrics),
          backgroundColor: [
            "#94A3B8",
            "#4ADE80",
            "#60A5FA",
            "#F87171",
            "#818CF8",
          ],
        },
      ],
    };
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Frequency Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <LineChart
              data={{
                labels: Array.from({ length: 20 }, (_, i) => `${i * 100}`),
                datasets: [
                  {
                    label: "Frequency Power",
                    data: Array.from({ length: 20 }, () => Math.random()),
                  },
                ],
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Waves className="h-5 w-5" />
            Emotional Tone Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <DoughnutChart data={getEmotionalToneData()} />
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic2 className="h-5 w-5" />
            Advanced Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard
              title="Jitter"
              value={(Math.random() * 2).toFixed(2)}
              unit="%"
              description="Variation in the periodicity of the voice"
            />
            <MetricCard
              title="Shimmer"
              value={(Math.random() * 3).toFixed(2)}
              unit="%"
              description="Variation in the amplitude of the voice"
            />
            <MetricCard
              title="Harmonic-to-Noise Ratio"
              value={(Math.random() * 20 + 10).toFixed(1)}
              unit="dB"
              description="Ratio of periodic to non-periodic components"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({
  title,
  value,
  unit,
  description,
}: {
  title: string;
  value: string;
  unit: string;
  description: string;
}) {
  return (
    <div className="p-4 border rounded-lg">
      <h3 className="font-medium">{title}</h3>
      <p className="text-2xl font-bold mt-2">
        {value}
        <span className="text-sm font-normal ml-1">{unit}</span>
      </p>
      <p className="text-sm text-muted-foreground mt-2">{description}</p>
    </div>
  );
}

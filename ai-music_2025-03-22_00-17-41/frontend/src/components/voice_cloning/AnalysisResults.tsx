"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { VoiceAnalysisResult, voiceAnalysis } from "@/services/api/voice-analysis";
import { LineChart } from "@/components/ui/charts";
import { Mic2, Activity, Loader2 } from "lucide-react";
import { WaveformIcon } from "lucide-react";

interface AnalysisResultsProps {
  analysisId: number;
}

export function AnalysisResults({ analysisId }: AnalysisResultsProps) {
  const [result, setResult] = useState<VoiceAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setIsLoading(true);
        const data = await voiceAnalysis.getAnalysisResults(analysisId);
        setResult(data);
        setError(null);
      } catch (err) {
        setError("Failed to fetch analysis results");
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [analysisId]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error || !result) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error || "Failed to load results"}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <WaveformIcon className="h-5 w-5" />
            Voice Characteristics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium">Timbre Score</p>
              <p className="text-2xl font-bold">
                {result.timbre_score.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Pitch Analysis</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Mean</p>
                  <p className="text-lg">
                    {result.pitch_analysis.mean.toFixed(1)} Hz
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Range</p>
                  <p className="text-lg">
                    {result.pitch_analysis.range[0].toFixed(1)} -{" "}
                    {result.pitch_analysis.range[1].toFixed(1)} Hz
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Quality Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(result.quality_metrics).map(([metric, value]) => (
              <div key={metric}>
                <p className="text-sm font-medium capitalize">{metric}</p>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${value * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic2 className="h-5 w-5" />
            Cadence Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <LineChart
              data={{
                labels: result.cadence_metrics.pause_patterns.map(
                  (_, i) => `${i + 1}s`,
                ),
                datasets: [
                  {
                    label: "Speech Pattern",
                    data: result.cadence_metrics.pause_patterns,
                  },
                ],
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

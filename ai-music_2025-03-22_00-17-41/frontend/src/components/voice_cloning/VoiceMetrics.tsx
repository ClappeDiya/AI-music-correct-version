"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import { AudioAnalysisResult } from "@/services/AudioAnalysis";
import { Mic2, Activity, Waves, Volume2 } from "lucide-react";

interface VoiceMetricsProps {
  analysis: AudioAnalysisResult;
}

export function VoiceMetrics({ analysis }: VoiceMetricsProps) {
  const calculateQualityScore = () => {
    // Calculate overall quality score based on various metrics
    const metrics = [
      analysis.spectralCentroid / 5000, // Normalize to 0-1
      analysis.zeroCrossingRate,
      analysis.pitch / 500, // Normalize to 0-1
    ];
    return (metrics.reduce((sum, m) => sum + m, 0) / metrics.length) * 100;
  };

  const metrics = [
    {
      label: "Pitch Stability",
      value: calculatePitchStability(),
      icon: Mic2,
      description: "Consistency of vocal pitch",
    },
    {
      label: "Voice Clarity",
      value: calculateClarity(),
      icon: Activity,
      description: "Clarity and definition of speech",
    },
    {
      label: "Dynamic Range",
      value: calculateDynamicRange(),
      icon: Waves,
      description: "Range of volume variation",
    },
    {
      label: "Voice Power",
      value: calculateVoicePower(),
      icon: Volume2,
      description: "Overall vocal strength",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Overall Voice Quality</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">
                {Math.round(calculateQualityScore())}%
              </span>
              <span className="text-sm text-muted-foreground">
                Quality Score
              </span>
            </div>
            <Progress value={calculateQualityScore()} />
          </div>
        </CardContent>
      </Card>

      {metrics.map((metric) => (
        <Card key={metric.label}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <metric.icon className="h-5 w-5" />
              {metric.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  {Math.round(metric.value)}%
                </span>
                <span className="text-sm text-muted-foreground">
                  {metric.description}
                </span>
              </div>
              <Progress value={metric.value} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  function calculatePitchStability(): number {
    // Calculate pitch stability from frequency data
    const pitchVariance =
      analysis.frequencies.reduce((variance, freq, i, arr) => {
        const mean = arr.reduce((sum, f) => sum + f, 0) / arr.length;
        return variance + Math.pow(freq - mean, 2);
      }, 0) / analysis.frequencies.length;

    return Math.max(0, 100 - pitchVariance / 100);
  }

  function calculateClarity(): number {
    // Calculate clarity based on spectral centroid and zero crossing rate
    const normalizedCentroid = analysis.spectralCentroid / 5000;
    const normalizedZCR = analysis.zeroCrossingRate;
    return ((normalizedCentroid + normalizedZCR) / 2) * 100;
  }

  function calculateDynamicRange(): number {
    // Calculate dynamic range from amplitude data
    const amplitudes = analysis.amplitudes;
    const max = Math.max(...amplitudes);
    const min = Math.min(...amplitudes);
    return ((max - min) / 2) * 100;
  }

  function calculateVoicePower(): number {
    // Calculate voice power from RMS of amplitudes
    const rms = Math.sqrt(
      analysis.amplitudes.reduce((sum, amp) => sum + Math.pow(amp, 2), 0) /
        analysis.amplitudes.length,
    );
    return rms * 100;
  }
}

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { RadarChart, BarChart } from "@/components/ui/charts";
import { VoiceAnalysisResult } from "@/services/api/voice-analysis";
import { Download, ArrowLeftRight } from "lucide-react";
import { useState } from "react";

interface AnalysisComparisonProps {
  currentAnalysis: VoiceAnalysisResult;
  previousAnalyses: VoiceAnalysisResult[];
}

export function AnalysisComparison({
  currentAnalysis,
  previousAnalyses,
}: AnalysisComparisonProps) {
  const [comparisonId, setComparisonId] = useState<string>("");

  const comparisonAnalysis = previousAnalyses.find(
    (a) => a.id.toString() === comparisonId,
  );

  const getComparisonData = () => {
    if (!comparisonAnalysis) return null;

    const metrics = [
      "timbre_score",
      "clarity",
      "stability",
      "naturalness",
      "rhythm_consistency",
    ];

    return {
      labels: metrics.map((m) =>
        m
          .split("_")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" "),
      ),
      datasets: [
        {
          label: "Current Analysis",
          data: metrics.map((m) => getMetricValue(currentAnalysis, m)),
        },
        {
          label: "Comparison Analysis",
          data: metrics.map((m) => getMetricValue(comparisonAnalysis, m)),
        },
      ],
    };
  };

  const getMetricValue = (
    analysis: VoiceAnalysisResult,
    metric: string,
  ): number => {
    switch (metric) {
      case "timbre_score":
        return analysis.timbre_score;
      case "clarity":
        return analysis.quality_metrics.clarity;
      case "stability":
        return analysis.quality_metrics.stability;
      case "naturalness":
        return analysis.quality_metrics.naturalness;
      case "rhythm_consistency":
        return analysis.cadence_metrics.rhythm_consistency;
      default:
        return 0;
    }
  };

  const handleExport = () => {
    const data = {
      current: currentAnalysis,
      comparison: comparisonAnalysis,
      timestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `voice-analysis-comparison-${data.timestamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Select value={comparisonId} onValueChange={setComparisonId}>
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder="Select analysis for comparison" />
          </SelectTrigger>
          <SelectContent>
            {previousAnalyses.map((analysis) => (
              <SelectItem key={analysis.id} value={analysis.id.toString()}>
                Analysis from{" "}
                {new Date(analysis.created_at).toLocaleDateString()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={handleExport}
          disabled={!comparisonAnalysis}
        >
          <Download className="h-4 w-4 mr-2" />
          Export Comparison
        </Button>
      </div>

      {comparisonAnalysis && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowLeftRight className="h-5 w-5" />
                Metrics Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <RadarChart data={getComparisonData()!} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pitch Range Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <BarChart
                  data={{
                    labels: ["Minimum", "Mean", "Maximum"],
                    datasets: [
                      {
                        label: "Current Analysis",
                        data: [
                          currentAnalysis.pitch_analysis.range[0],
                          currentAnalysis.pitch_analysis.mean,
                          currentAnalysis.pitch_analysis.range[1],
                        ],
                      },
                      {
                        label: "Comparison Analysis",
                        data: [
                          comparisonAnalysis.pitch_analysis.range[0],
                          comparisonAnalysis.pitch_analysis.mean,
                          comparisonAnalysis.pitch_analysis.range[1],
                        ],
                      },
                    ],
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

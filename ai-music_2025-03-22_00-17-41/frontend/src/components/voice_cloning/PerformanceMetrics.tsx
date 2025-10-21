"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import { VoiceCloningWebSocket } from "@/services/websocket/voice_cloning";
import { LineChart } from "@/components/ui/charts";
import { Activity, Waveform, Mic2 } from "lucide-react";

interface MetricData {
  timestamp: number;
  value: number;
}

interface PerformanceMetrics {
  accuracy: number;
  similarity: number;
  naturalness: number;
  latency: MetricData[];
  qualityScores: MetricData[];
}

interface Props {
  modelId: number;
}

export function PerformanceMetrics({ modelId }: Props) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    accuracy: 0,
    similarity: 0,
    naturalness: 0,
    latency: [],
    qualityScores: [],
  });

  useEffect(() => {
    const ws = new VoiceCloningWebSocket(modelId);

    ws.subscribe("model_performance", (data) => {
      setMetrics((prev) => ({
        ...prev,
        ...data,
      }));
    });

    ws.connect();

    return () => ws.disconnect();
  }, [modelId]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Accuracy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">
                {(metrics.accuracy * 100).toFixed(1)}%
              </div>
              <Progress value={metrics.accuracy * 100} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Waveform className="h-4 w-4" />
              Similarity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">
                {(metrics.similarity * 100).toFixed(1)}%
              </div>
              <Progress value={metrics.similarity * 100} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic2 className="h-4 w-4" />
              Naturalness
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">
                {(metrics.naturalness * 100).toFixed(1)}%
              </div>
              <Progress value={metrics.naturalness * 100} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Latency Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <LineChart
              data={{
                labels: metrics.latency.map((d) =>
                  new Date(d.timestamp).toLocaleTimeString(),
                ),
                datasets: [
                  {
                    label: "Latency (ms)",
                    data: metrics.latency.map((d) => d.value),
                  },
                ],
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quality Scores Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <LineChart
              data={{
                labels: metrics.qualityScores.map((d) =>
                  new Date(d.timestamp).toLocaleTimeString(),
                ),
                datasets: [
                  {
                    label: "Quality Score",
                    data: metrics.qualityScores.map((d) => d.value),
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

"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { VoiceCloningWebSocket } from "@/services/websocket/voice_cloning";
import { BarChart, PieChart } from "@/components/ui/charts";
import { AlertTriangle, Bug, RefreshCcw } from "lucide-react";

interface ErrorData {
  type: string;
  count: number;
  timestamp: number;
  details?: string;
}

interface ErrorAnalytics {
  recentErrors: ErrorData[];
  errorsByType: Record<string, number>;
  totalErrors: number;
  errorRate: number;
}

interface Props {
  modelId: number;
}

export function ErrorAnalysis({ modelId }: Props) {
  const [analytics, setAnalytics] = useState<ErrorAnalytics>({
    recentErrors: [],
    errorsByType: {},
    totalErrors: 0,
    errorRate: 0,
  });

  useEffect(() => {
    const ws = new VoiceCloningWebSocket(modelId);

    ws.subscribe("error_report", (data) => {
      setAnalytics((prev) => ({
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
              <AlertTriangle className="h-4 w-4" />
              Total Errors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalErrors}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCcw className="h-4 w-4" />
              Error Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(analytics.errorRate * 100).toFixed(2)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bug className="h-4 w-4" />
              Error Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.keys(analytics.errorsByType).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Errors by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <PieChart
                data={{
                  labels: Object.keys(analytics.errorsByType),
                  datasets: [
                    {
                      data: Object.values(analytics.errorsByType),
                    },
                  ],
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Errors Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <BarChart
                data={{
                  labels: analytics.recentErrors.map((e) =>
                    new Date(e.timestamp).toLocaleTimeString(),
                  ),
                  datasets: [
                    {
                      label: "Error Count",
                      data: analytics.recentErrors.map((e) => e.count),
                    },
                  ],
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Error Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.recentErrors.map((error, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{error.type}</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(error.timestamp).toLocaleString()}
                  </span>
                </div>
                {error.details && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {error.details}
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

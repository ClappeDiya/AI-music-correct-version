"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { DatePickerRange } from "@/components/ui/DateRangePicker";
import { LineChart } from "@/components/ui/LineChart";
import { BarChart } from "@/components/ui/BarChart";
import { useToast } from "@/components/ui/useToast";
import { VoiceModel, voiceCloning } from "@/services/api/voice_cloning";
import { Activity, Clock, Users, Download } from "lucide-react";

interface ModelAnalyticsProps {
  modelId: number;
}

interface AnalyticsData {
  usageByDay: {
    date: string;
    count: number;
  }[];
  usageByContext: {
    context: string;
    count: number;
  }[];
  totalUsage: number;
  averageDuration: number;
  uniqueUsers: number;
}

export function ModelAnalytics({ modelId }: ModelAnalyticsProps) {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("7d");
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadAnalytics();
  }, [modelId, timeRange]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      const response = await voiceCloning.getModelAnalytics(modelId, timeRange);
      setAnalytics(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await voiceCloning.exportAnalytics(modelId, timeRange);
      const blob = new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `model-${modelId}-analytics.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export analytics data",
        variant: "destructive",
      });
    }
  };

  if (!analytics) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Select
          value={timeRange}
          onValueChange={(value: "7d" | "30d" | "90d") => setTimeRange(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="90d">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Total Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalUsage}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Average Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.averageDuration.toFixed(1)}s
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Unique Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.uniqueUsers}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usage Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <LineChart
              data={{
                labels: analytics.usageByDay.map((d) => d.date),
                datasets: [
                  {
                    label: "Usage Count",
                    data: analytics.usageByDay.map((d) => d.count),
                  },
                ],
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usage by Context</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <BarChart
              data={{
                labels: analytics.usageByContext.map((d) => d.context),
                datasets: [
                  {
                    label: "Usage Count",
                    data: analytics.usageByContext.map((d) => d.count),
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

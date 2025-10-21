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
import { LineChart } from "@/components/ui/charts";
import { VoiceAnalysisResult } from "@/services/api/voice-analysis";
import { Download, TrendingUp, Calendar } from "lucide-react";
import { useState, useMemo } from "react";
import { format } from "date-fns";

interface TrendAnalysisProps {
  analyses: VoiceAnalysisResult[];
}

type MetricKey =
  | "timbre_score"
  | "clarity"
  | "stability"
  | "naturalness"
  | "rhythm_consistency";
type TimeRange = "7d" | "30d" | "90d" | "all";

export function TrendAnalysis({ analyses }: TrendAnalysisProps) {
  const [selectedMetric, setSelectedMetric] =
    useState<MetricKey>("timbre_score");
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [exportFormat, setExportFormat] = useState<"json" | "csv" | "xlsx">(
    "json",
  );

  const filteredAnalyses = useMemo(() => {
    const now = new Date();
    const ranges: Record<TimeRange, number> = {
      "7d": 7 * 24 * 60 * 60 * 1000,
      "30d": 30 * 24 * 60 * 60 * 1000,
      "90d": 90 * 24 * 60 * 60 * 1000,
      all: Infinity,
    };

    return analyses
      .filter((a) => {
        const analysisDate = new Date(a.created_at);
        return now.getTime() - analysisDate.getTime() <= ranges[timeRange];
      })
      .sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      );
  }, [analyses, timeRange]);

  const getMetricValue = (
    analysis: VoiceAnalysisResult,
    metric: MetricKey,
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
    }
  };

  const trendData = useMemo(
    () => ({
      labels: filteredAnalyses.map((a) =>
        format(new Date(a.created_at), "MMM d"),
      ),
      datasets: [
        {
          label: selectedMetric
            .split("_")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" "),
          data: filteredAnalyses.map((a) => getMetricValue(a, selectedMetric)),
        },
      ],
    }),
    [filteredAnalyses, selectedMetric],
  );

  const handleExport = () => {
    const data = filteredAnalyses.map((analysis) => ({
      date: format(new Date(analysis.created_at), "yyyy-MM-dd"),
      metric: selectedMetric,
      value: getMetricValue(analysis, selectedMetric),
    }));

    switch (exportFormat) {
      case "json":
        exportJSON(data);
        break;
      case "csv":
        exportCSV(data);
        break;
      case "xlsx":
        exportXLSX(data);
        break;
    }
  };

  const exportJSON = (data: any) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    downloadFile(blob, "trend-analysis.json");
  };

  const exportCSV = (data: any) => {
    const headers = ["date", "metric", "value"];
    const csv = [
      headers.join(","),
      ...data.map((row: any) => headers.map((header) => row[header]).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    downloadFile(blob, "trend-analysis.csv");
  };

  const exportXLSX = async (data: any) => {
    const XLSX = await import("xlsx");
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Trend Analysis");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    downloadFile(blob, "trend-analysis.xlsx");
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Trend Analysis
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={timeRange}
              onValueChange={(value) => setTimeRange(value as TimeRange)}
            >
              <SelectTrigger className="w-[120px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 Days</SelectItem>
                <SelectItem value="30d">30 Days</SelectItem>
                <SelectItem value="90d">90 Days</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={selectedMetric}
              onValueChange={(value) => setSelectedMetric(value as MetricKey)}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="timbre_score">Timbre Score</SelectItem>
                <SelectItem value="clarity">Clarity</SelectItem>
                <SelectItem value="stability">Stability</SelectItem>
                <SelectItem value="naturalness">Naturalness</SelectItem>
                <SelectItem value="rhythm_consistency">
                  Rhythm Consistency
                </SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={exportFormat}
              onValueChange={(value) =>
                setExportFormat(value as "json" | "csv" | "xlsx")
              }
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="xlsx">Excel</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <LineChart data={trendData} />
        </div>
      </CardContent>
    </Card>
  );
}

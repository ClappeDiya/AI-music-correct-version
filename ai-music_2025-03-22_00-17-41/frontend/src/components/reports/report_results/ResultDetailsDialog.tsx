"use client";

import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { reportResultsApi } from "@/lib/api/reports";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ResultVisualization } from "@/components/reports/result-visualization";
import { MetricCard } from "@/components/reports/metric-card";
import { ExportDialog } from "@/components/reports/export/ExportDialog";

function formatMetricName(key: string): string {
  return key
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getMetricTrend(data: any, key: string): any[] | undefined {
  // Look for trend data in common formats
  const trendKeys = [
    `${key}_trend`,
    `${key}_history`,
    `${key}_over_time`,
    `${key}_data`,
  ];

  for (const trendKey of trendKeys) {
    if (data[trendKey] && Array.isArray(data[trendKey])) {
      return data[trendKey];
    }
  }

  return undefined;
}

interface ResultDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resultId: number;
}

export function ResultDetailsDialog({
  open,
  onOpenChange,
  resultId,
}: ResultDetailsDialogProps) {
  const { data: result, isLoading } = useQuery({
    queryKey: ["report-result", resultId],
    queryFn: async () => {
      const response = await reportResultsApi.get(resultId);
      return response.data;
    },
  });

  const handleDownload = () => {
    if (!result) return;

    const blob = new Blob([JSON.stringify(result.generated_data, null, 2)], {
      type: "application/json",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report-result-${resultId}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading || !result) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl">
        <DialogHeader>
          <DialogTitle>Report Result Details</DialogTitle>
          <DialogDescription>
            View and analyze the detailed results of this report.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">
                Generated at: {new Date(result.generated_at).toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">
                Report ID: {result.report}
              </p>
            </div>
            <div className="space-x-2">
              <Button onClick={handleDownload} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download JSON
              </Button>
              <ExportDialog reportId={result.report} resultId={result.id} />
            </div>
          </div>

          {/* High-level metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(result.generated_data || {}).map(([key, value]) => {
              if (typeof value === "number") {
                return (
                  <MetricCard
                    key={key}
                    reportId={result.id}
                    title={formatMetricName(key)}
                    value={value}
                    metricKey={key}
                    chartData={getMetricTrend(result.generated_data, key)}
                  />
                );
              }
              return null;
            })}
          </div>

          {/* Detailed visualizations */}
          <ResultVisualization data={result.generated_data || {}} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

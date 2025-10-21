"use client";

import { useState } from "react";
import { ArrowRight, ExternalLink, Maximize2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { MetricDrillDown } from "./metric-drill-down";
import { MetricChart } from "../charts/metric-chart";
import { ChartType } from "../charts/chart-types";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  reportId: number;
  title: string;
  description?: string;
  value: number;
  change?: number;
  chartData?: any[];
  metricKey: string;
  defaultChartType?: ChartType;
  formatValue?: (value: number) => string;
  className?: string;
}

export function MetricCard({
  reportId,
  title,
  description,
  value,
  change,
  chartData,
  metricKey,
  defaultChartType = "line",
  formatValue = (v) => v.toString(),
  className,
}: MetricCardProps) {
  const [showDrillDown, setShowDrillDown] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [chartType, setChartType] = useState<ChartType>(defaultChartType);

  // Format the change value
  const changeText = change
    ? `${change > 0 ? "+" : ""}${change.toFixed(1)}%`
    : null;
  const changeColor = change
    ? change > 0
      ? "text-green-500"
      : "text-red-500"
    : "text-muted-foreground";

  return (
    <>
      <Card className={cn("hover:shadow-md transition-shadow", className)}>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold">{formatValue(value)}</div>
              {changeText && (
                <div className={cn("text-sm", changeColor)}>{changeText}</div>
              )}
            </div>
            {chartData && (
              <div className="h-32">
                <MetricChart
                  title=""
                  data={chartData}
                  type={chartType}
                  onTypeChange={setChartType}
                  xKey={Object.keys(chartData[0])[0]}
                  yKey={Object.keys(chartData[0])[1]}
                  height={128}
                />
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDrillDown(true)}
          >
            View Details
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setIsExpanded(true)}>
            <Maximize2 className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>

      {/* Drill-down Dialog */}
      <Dialog open={showDrillDown} onOpenChange={setShowDrillDown}>
        <DialogContent className="max-w-7xl">
          <DialogHeader>
            <DialogTitle>{title} - Detailed Analysis</DialogTitle>
            <DialogDescription>
              Explore detailed metrics and trends
            </DialogDescription>
          </DialogHeader>
          <MetricDrillDown
            reportId={reportId}
            metricKey={metricKey}
            onBack={() => setShowDrillDown(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Expanded Chart Dialog */}
      <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
        <DialogContent className="max-w-7xl">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          {chartData && (
            <div className="h-[600px]">
              <MetricChart
                title=""
                data={chartData}
                type={chartType}
                onTypeChange={setChartType}
                xKey={Object.keys(chartData[0])[0]}
                yKey={Object.keys(chartData[0])[1]}
                height={600}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

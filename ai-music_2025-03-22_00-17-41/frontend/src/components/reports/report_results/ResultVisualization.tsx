"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { ChartType } from "../charts/chart-types";
import { MetricChart } from "../charts/metric-chart";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";

interface ResultVisualizationProps {
  data: Record<string, any>;
}

export function ResultVisualization({ data }: ResultVisualizationProps) {
  const [chartTypes, setChartTypes] = useState<Record<string, ChartType>>({});

  const getChartData = (metric: string) => {
    if (!data[metric] || !Array.isArray(data[metric])) return [];
    return data[metric];
  };

  const handleChartTypeChange = (metric: string, type: ChartType) => {
    setChartTypes((prev) => ({ ...prev, [metric]: type }));
  };

  const renderDataTable = (metric: string) => {
    const chartData = getChartData(metric);
    if (!chartData.length) return null;

    const columns = Object.keys(chartData[0]);

    return (
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column}>{column}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {chartData.map((row, i) => (
            <TableRow key={i}>
              {columns.map((column) => (
                <TableCell key={column}>{row[column]}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="space-y-8">
      {Object.keys(data).map((metric) => {
        const chartData = getChartData(metric);
        if (!chartData.length) return null;

        return (
          <ResizablePanelGroup
            key={metric}
            direction="horizontal"
            className="min-h-[400px] rounded-lg border"
          >
            <ResizablePanel defaultSize={70}>
              <div className="p-4">
                <MetricChart
                  title={metric}
                  data={chartData}
                  type={chartTypes[metric] || "line"}
                  onTypeChange={(type) => handleChartTypeChange(metric, type)}
                  xKey={Object.keys(chartData[0])[0]}
                  yKey={Object.keys(chartData[0])[1]}
                />
              </div>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={30}>
              <ScrollArea className="h-[400px]">
                <div className="p-4">{renderDataTable(metric)}</div>
              </ScrollArea>
            </ResizablePanel>
          </ResizablePanelGroup>
        );
      })}
    </div>
  );
}

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/componen../ui/card";
import { LineChart, BarChart, PieChart } from "@/components/ui/charts";

interface AnalyticsChartProps {
  type: "line" | "bar" | "pie";
  data: any[];
  title: string;
  xAxis: string;
  yAxis: string;
}

export function AnalyticsChart({
  type,
  data,
  title,
  xAxis,
  yAxis,
}: AnalyticsChartProps) {
  const renderChart = () => {
    switch (type) {
      case "line":
        return <LineChart data={data} xAxis={xAxis} yAxis={yAxis} />;
      case "bar":
        return <BarChart data={data} xAxis={xAxis} yAxis={yAxis} />;
      case "pie":
        return <PieChart data={data} />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{renderChart()}</CardContent>
    </Card>
  );
}

"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from "recharts";
import { useTheme } from "next-themes";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ChartType, ChartTypeSelector } from "./chart-types";

interface MetricChartProps {
  title: string;
  data: any[];
  type: ChartType;
  onTypeChange: (type: ChartType) => void;
  xKey: string;
  yKey: string;
  height?: number;
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "hsl(var(--accent))",
  "hsl(var(--muted))",
];

export function MetricChart({
  title,
  data,
  type,
  onTypeChange,
  xKey,
  yKey,
  height = 400,
}: MetricChartProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const chartProps = useMemo(
    () => ({
      data,
      margin: { top: 10, right: 30, left: 0, bottom: 0 },
    }),
    [data],
  );

  const renderChart = () => {
    switch (type) {
      case "line":
        return (
          <LineChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis
              dataKey={xKey}
              stroke="hsl(var(--foreground))"
              fontSize={12}
            />
            <YAxis stroke="hsl(var(--foreground))" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? "hsl(var(--background))" : "white",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey={yKey}
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        );

      case "bar":
        return (
          <BarChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis
              dataKey={xKey}
              stroke="hsl(var(--foreground))"
              fontSize={12}
            />
            <YAxis stroke="hsl(var(--foreground))" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? "hsl(var(--background))" : "white",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
            />
            <Legend />
            <Bar
              dataKey={yKey}
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        );

      case "area":
        return (
          <AreaChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis
              dataKey={xKey}
              stroke="hsl(var(--foreground))"
              fontSize={12}
            />
            <YAxis stroke="hsl(var(--foreground))" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? "hsl(var(--background))" : "white",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey={yKey}
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.2}
            />
          </AreaChart>
        );

      case "pie":
        return (
          <PieChart>
            <Pie
              data={data}
              dataKey={yKey}
              nameKey={xKey}
              cx="50%"
              cy="50%"
              outerRadius={height / 3}
              label
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? "hsl(var(--background))" : "white",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
            />
            <Legend />
          </PieChart>
        );

      case "scatter":
        return (
          <ScatterChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis
              dataKey={xKey}
              stroke="hsl(var(--foreground))"
              fontSize={12}
            />
            <YAxis stroke="hsl(var(--foreground))" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? "hsl(var(--background))" : "white",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
            />
            <Legend />
            <Scatter name={yKey} data={data} fill="hsl(var(--primary))" />
          </ScatterChart>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-normal">{title}</CardTitle>
        <ChartTypeSelector value={type} onValueChange={onTypeChange} />
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

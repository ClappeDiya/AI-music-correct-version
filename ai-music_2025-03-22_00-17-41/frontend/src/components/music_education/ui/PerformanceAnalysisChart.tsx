"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";

interface PerformanceData {
  date: string;
  accuracy: number;
  rhythm: number;
  expression: number;
}

interface PerformanceAnalysisChartProps {
  title?: string;
  data: PerformanceData[];
  height?: number;
  showLegend?: boolean;
  className?: string;
}

export function PerformanceAnalysisChart({
  title = "Performance Analysis",
  data,
  height = 400,
  showLegend = true,
  className,
}: PerformanceAnalysisChartProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  const formatValue = (value: number) => `${Math.round(value)}%`;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Card className="border shadow-lg">
          <CardContent className="p-3 space-y-2">
            <p className="text-sm font-medium">{formatDate(label)}</p>
            <div className="space-y-1">
              {payload.map((entry: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between space-x-8"
                >
                  <span className="text-sm" style={{ color: entry.color }}>
                    {entry.name}:
                  </span>
                  <span className="text-sm font-medium">
                    {formatValue(entry.value)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      );
    }
    return null;
  };

  return (
    <Card className={cn("w-full", className)}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div style={{ width: "100%", height }}>
          <ResponsiveContainer>
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 10,
                left: 0,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={formatDate} fontSize={12} />
              <YAxis
                tickFormatter={formatValue}
                domain={[0, 100]}
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              {showLegend && (
                <Legend
                  verticalAlign="top"
                  height={36}
                  iconType="circle"
                  fontSize={12}
                />
              )}
              <Line
                type="monotone"
                dataKey="accuracy"
                name="Accuracy"
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="rhythm"
                name="Rhythm"
                stroke="#16a34a"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="expression"
                name="Expression"
                stroke="#9333ea"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { useState, useEffect } from "react";
import { UserProgressData } from "@/types/progress";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

interface ProgressData {
  date: string;
  lessons: number;
  quizScore: number;
  practiceTime: number;
}

interface UserProgressChartProps {
  data: ProgressData[];
  title?: string;
  className?: string;
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <p className="text-sm font-medium">{label}</p>
        <div className="mt-1 space-y-1">
          {payload.map((entry) => (
            <p
              key={entry.name}
              className="text-xs"
              style={{ color: entry.color }}
            >
              {entry.name}: {entry.value}
              {entry.name === "Quiz Score" ? "%" : ""}
              {entry.name === "Practice Hours" ? "h" : ""}
            </p>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export function UserProgressChart({
  data,
  title = "Learning Progress",
  className,
}: UserProgressChartProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="lessons"
                name="Lessons Completed"
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="quizScore"
                name="Quiz Score"
                stroke="#16a34a"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="practiceTime"
                name="Practice Hours"
                stroke="#9333ea"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function useUserProgressChart(userId: string) {
  const [chartData, setChartData] = useState<UserProgressData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await fetch(`/api/users/${userId}/progress/chart`);
        if (!response.ok) {
          throw new Error("Failed to fetch progress chart data");
        }
        const data = await response.json();
        setChartData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchChartData();
    }
  }, [userId]);

  return { chartData, loading, error };
}

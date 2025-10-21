"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { LineChart } from "@/components/ui/LineChart";
import { musicEducationApi } from '@/services/music_education_api";
import { toast } from "sonner";
import { Award, TrendingDown, TrendingUp, Minus, Brain } from "lucide-react";
import { AIFeedback } from '@/types/music_education";

export function AIFeedbackSection() {
  const [feedback, setFeedback] = useState<AIFeedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFeedback();
  }, []);

  const loadFeedback = async () => {
    try {
      setIsLoading(true);
      const data = await musicEducationApi.getAIFeedback();
      setFeedback(data);
    } catch (error) {
      toast.error("Failed to load AI feedback");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="h-32" />
          </Card>
        ))}
      </div>
    );
  }

  if (!feedback.length) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No AI feedback available yet. Complete some practice sessions to receive feedback.
        </CardContent>
      </Card>
    );
  }

  const latestFeedback = feedback[0];
  const previousFeedback = feedback[1];

  const getPerformanceTrend = (current: number, previous?: number) => {
    if (!previous) return { icon: Minus, color: "text-gray-500" };
    const diff = current - previous;
    if (diff > 0) return { icon: TrendingUp, color: "text-green-500" };
    if (diff < 0) return { icon: TrendingDown, color: "text-red-500" };
    return { icon: Minus, color: "text-gray-500" };
  };

  const performanceHistory = feedback
    .slice(0, 10)
    .map((f) => ({
      date: new Date(f.timestamp).toLocaleDateString(),
      accuracy: f.performance_metrics.accuracy,
      rhythm: f.performance_metrics.rhythm,
      expression: f.performance_metrics.expression,
    }))
    .reverse();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-primary hidden sm:block" />
          <h2 className="text-xl sm:text-2xl font-bold">AI Performance Analysis</h2>
        </div>
        <Tabs defaultValue="overview" className="w-full sm:w-auto">
          <TabsList className="grid w-full sm:w-auto grid-cols-2 h-auto sm:h-10 sm:flex">
            <TabsTrigger value="overview" className="text-sm sm:text-base py-2 sm:py-0">Overview</TabsTrigger>
            <TabsTrigger value="trends" className="text-sm sm:text-base py-2 sm:py-0">Performance Trends</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(latestFeedback.performance_metrics).map(([key, value]) => {
          const previous = previousFeedback?.performance_metrics[key as keyof typeof previousFeedback.performance_metrics];
          const trend = getPerformanceTrend(value, previous);
          const TrendIcon = trend.icon;

          return (
            <Card key={key} className="transition-all hover:shadow-md">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm sm:text-base font-medium text-muted-foreground capitalize">
                    {key}
                  </h3>
                  <TrendIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${trend.color}`} />
                </div>
                <div className="text-xl sm:text-2xl font-bold mb-1">{value.toFixed(0)}%</div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  {previous
                    ? `${Math.abs(value - previous).toFixed(1)}% ${
                        value >= previous ? "improvement" : "decrease"
                      }`
                    : "No previous data"}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <TabsContent value="overview" className="mt-0">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Suggestions</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <ul className="space-y-2 sm:space-y-3">
              {latestFeedback.suggestions.map((suggestion, i) => (
                <li key={i} className="flex items-start gap-2 sm:gap-3">
                  <Award className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0 mt-1" />
                  <span className="text-sm sm:text-base text-muted-foreground">
                    {suggestion}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="trends" className="mt-0">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="h-[300px] sm:h-[400px]">
              <LineChart
                data={performanceHistory}
                title="Performance Trends"
                lines={[
                  {
                    name: "Accuracy",
                    dataKey: "accuracy",
                    stroke: "#2563eb",
                  },
                  {
                    name: "Rhythm",
                    dataKey: "rhythm",
                    stroke: "#16a34a",
                  },
                  {
                    name: "Expression",
                    dataKey: "expression",
                    stroke: "#d946ef",
                  },
                ]}
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </div>
  );
} 


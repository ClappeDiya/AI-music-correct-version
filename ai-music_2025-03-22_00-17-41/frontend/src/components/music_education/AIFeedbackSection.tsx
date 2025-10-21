"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { LineChart } from "@/components/ui/LineChart";
import { musicEducationApi } from '@/services/music_education_api";
import { toast } from "sonner";
import { Award, TrendingDown, TrendingUp, Minus } from "lucide-react";

interface AIFeedback {
  id: string;
  timestamp: string;
  performance_metrics: {
    accuracy: number;
    rhythm: number;
    expression: number;
  };
  detailed_feedback: string;
  suggestions: string[];
  strengths: string[];
  areas_for_improvement: string[];
}

interface PerformanceHistory {
  date: string;
  accuracy: number;
  rhythm: number;
  expression: number;
}

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

  const performanceHistory: PerformanceHistory[] = feedback
    .slice(0, 10)
    .map((f) => ({
      date: new Date(f.timestamp).toLocaleDateString(),
      accuracy: f.performance_metrics.accuracy,
      rhythm: f.performance_metrics.rhythm,
      expression: f.performance_metrics.expression,
    }))
    .reverse();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(latestFeedback.performance_metrics).map(([key, value]) => {
          const previous = previousFeedback?.performance_metrics[key as keyof typeof previousFeedback.performance_metrics];
          const trend = getPerformanceTrend(value, previous);
          const TrendIcon = trend.icon;

          return (
            <Card key={key}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-muted-foreground capitalize">
                    {key}
                  </h3>
                  <TrendIcon className={`w-4 h-4 ${trend.color}`} />
                </div>
                <div className="text-2xl font-bold mb-1">{value.toFixed(0)}%</div>
                <div className="text-sm text-muted-foreground">
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

      <Card>
        <CardHeader>
          <CardTitle>Latest Feedback</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground mb-4">
            {latestFeedback.detailed_feedback}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center">
                <Award className="w-4 h-4 mr-2 text-green-500" />
                Strengths
              </h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                {latestFeedback.strengths.map((strength, i) => (
                  <li key={i}>{strength}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">Areas for Improvement</h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                {latestFeedback.areas_for_improvement.map((area, i) => (
                  <li key={i}>{area}</li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Performance Trends</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Suggestions</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ul className="space-y-2">
                {latestFeedback.suggestions.map((suggestion, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-sm text-muted-foreground">
                      {suggestion}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="trends">
          <Card>
            <CardContent className="p-6">
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 


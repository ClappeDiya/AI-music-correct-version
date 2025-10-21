"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { useToast } from "@/components/ui/useToast";
import {
  BarChart3,
  PieChart,
  Activity,
  ThumbsUp,
  ThumbsDown,
  History,
  Timer,
  Music2,
  Sliders,
  Wand2,
} from "lucide-react";
import { hybridDjService, HumanDJAction } from "@/services/hybridDjService";
import { cn } from "@/lib/utils";

interface SessionAnalyticsProps {
  sessionId: string;
  className?: string;
  refreshInterval?: number;
}

interface SessionSummary {
  total_actions: number;
  actions_by_type: Record<string, number>;
  suggestions_accepted: number;
  suggestions_rejected: number;
}

export function SessionAnalytics({
  sessionId,
  className,
  refreshInterval = 10000,
}: SessionAnalyticsProps) {
  const { toast } = useToast();
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [recentActions, setRecentActions] = useState<HumanDJAction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryData, actionsData] = await Promise.all([
          hybridDjService.getSessionSummary(sessionId),
          hybridDjService.getSessionActions(sessionId),
        ]);
        setSummary(summaryData);
        setRecentActions(actionsData);
      } catch (error) {
        console.error("Failed to fetch session analytics:", error);
        toast({
          title: "Error",
          description: "Failed to fetch session analytics",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, refreshInterval);

    return () => clearInterval(interval);
  }, [sessionId, refreshInterval, toast]);

  const getActionIcon = (type: string) => {
    switch (type) {
      case "track_select":
        return <Music2 className="h-4 w-4" />;
      case "transition_adjust":
        return <Sliders className="h-4 w-4" />;
      case "effect_adjust":
        return <Wand2 className="h-4 w-4" />;
      case "suggestion_accept":
        return <ThumbsUp className="h-4 w-4" />;
      case "suggestion_reject":
        return <ThumbsDown className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Session Analytics
        </CardTitle>
        <CardDescription>
          Track your session performance and AI collaboration
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="actions">Recent Actions</TabsTrigger>
            <TabsTrigger value="suggestions">AI Suggestions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Action Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {summary &&
                      Object.entries(summary.actions_by_type).map(
                        ([type, count]) => (
                          <div key={type} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {getActionIcon(type.toLowerCase())}
                                <span className="text-sm font-medium">
                                  {type}
                                </span>
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {count}
                              </span>
                            </div>
                            <Progress
                              value={(count / summary.total_actions) * 100}
                            />
                          </div>
                        ),
                      )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">AI Suggestion Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {summary?.suggestions_accepted || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Suggestions Accepted
                      </div>
                    </div>
                    <Progress
                      value={
                        summary
                          ? (summary.suggestions_accepted /
                              (summary.suggestions_accepted +
                                summary.suggestions_rejected)) *
                            100
                          : 0
                      }
                    />
                    <div className="text-center">
                      <div className="text-2xl font-bold text-destructive">
                        {summary?.suggestions_rejected || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Suggestions Rejected
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="actions">
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {recentActions.map((action) => (
                  <Card key={action.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getActionIcon(action.action_type)}
                          <div>
                            <div className="font-medium">
                              {action.action_type_display}
                            </div>
                            {action.track && (
                              <div className="text-sm text-muted-foreground">
                                {action.track_details?.title} -{" "}
                                {action.track_details?.artist}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Timer className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {new Date(action.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                      {action.parameters &&
                        Object.keys(action.parameters).length > 0 && (
                          <div className="mt-2 grid grid-cols-2 gap-2">
                            {Object.entries(action.parameters).map(
                              ([key, value]) => (
                                <Badge
                                  key={key}
                                  variant="secondary"
                                  className="justify-between"
                                >
                                  <span>{key}:</span>
                                  <span>{String(value)}</span>
                                </Badge>
                              ),
                            )}
                          </div>
                        )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="suggestions">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Acceptance Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold">
                          {summary
                            ? Math.round(
                                (summary.suggestions_accepted /
                                  (summary.suggestions_accepted +
                                    summary.suggestions_rejected)) *
                                  100,
                              )
                            : 0}
                          %
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Overall Acceptance Rate
                        </div>
                      </div>
                    </div>
                    <Progress
                      value={
                        summary
                          ? (summary.suggestions_accepted /
                              (summary.suggestions_accepted +
                                summary.suggestions_rejected)) *
                            100
                          : 0
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <ThumbsUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <div className="text-2xl font-bold">
                        {summary?.suggestions_accepted || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Accepted
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <ThumbsDown className="h-8 w-8 mx-auto mb-2 text-destructive" />
                      <div className="text-2xl font-bold">
                        {summary?.suggestions_rejected || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Rejected
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Activity className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <div className="text-2xl font-bold">
                        {(summary?.suggestions_accepted || 0) +
                          (summary?.suggestions_rejected || 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total Suggestions
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

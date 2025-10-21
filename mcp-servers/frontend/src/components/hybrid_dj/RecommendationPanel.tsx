"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/Badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/Tooltip";
import { useToast } from "@/components/ui/useToast";
import {
  ThumbsUp,
  ThumbsDown,
  Music,
  Wand2,
  Sliders,
  Timer,
  Gauge,
  Info,
} from "lucide-react";
import { hybridDjService, AIRecommendation } from "@/services/hybridDjService";
import { cn } from "@/lib/utils";

interface RecommendationPanelProps {
  sessionId: string;
  className?: string;
  refreshInterval?: number;
}

export function RecommendationPanel({
  sessionId,
  className,
  refreshInterval = 5000,
}: RecommendationPanelProps) {
  const { toast } = useToast();
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>(
    [],
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const data = await hybridDjService.getPendingRecommendations(sessionId);
        setRecommendations(data);
      } catch (error) {
        console.error("Failed to fetch recommendations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
    const interval = setInterval(fetchRecommendations, refreshInterval);

    return () => clearInterval(interval);
  }, [sessionId, refreshInterval]);

  const handleAccept = async (id: string) => {
    try {
      await hybridDjService.acceptRecommendation(id);
      const updatedRecs =
        await hybridDjService.getPendingRecommendations(sessionId);
      setRecommendations(updatedRecs);

      toast({
        title: "Success",
        description: "Recommendation accepted successfully",
      });
    } catch (error) {
      console.error("Failed to accept recommendation:", error);
      toast({
        title: "Error",
        description: "Failed to accept recommendation",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (id: string, reason?: string) => {
    try {
      await hybridDjService.rejectRecommendation(id, reason);
      const updatedRecs =
        await hybridDjService.getPendingRecommendations(sessionId);
      setRecommendations(updatedRecs);

      toast({
        title: "Success",
        description: "Recommendation rejected successfully",
      });
    } catch (error) {
      console.error("Failed to reject recommendation:", error);
      toast({
        title: "Error",
        description: "Failed to reject recommendation",
        variant: "destructive",
      });
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case "next_track":
        return <Music className="h-4 w-4" />;
      case "transition":
        return <Sliders className="h-4 w-4" />;
      case "effect":
        return <Wand2 className="h-4 w-4" />;
      case "energy_level":
        return <Gauge className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
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
          <Wand2 className="h-5 w-5" />
          AI Recommendations
        </CardTitle>
        <CardDescription>
          Real-time suggestions from your AI assistant
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px]">
          <div className="space-y-4">
            {recommendations.length === 0 ? (
              <div className="text-center text-muted-foreground p-4">
                No pending recommendations
              </div>
            ) : (
              recommendations.map((rec) => (
                <Card key={rec.id} className="relative">
                  <CardContent className="p-4">
                    <div className="absolute top-2 right-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge
                              variant={
                                rec.confidence_score > 0.8
                                  ? "default"
                                  : rec.confidence_score > 0.5
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {Math.round(rec.confidence_score * 100)}%
                              Confidence
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>AI confidence in this recommendation</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        {getRecommendationIcon(rec.recommendation_type)}
                        <span className="font-medium">
                          {rec.recommendation_type_display}
                        </span>
                      </div>

                      {rec.suggested_track && (
                        <div className="flex items-center justify-between p-2 bg-accent/50 rounded-md">
                          <div className="space-y-1">
                            <p className="font-medium">
                              {rec.suggested_track.title}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {rec.suggested_track.artist}
                            </p>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Timer className="h-4 w-4" />
                              {Math.floor(rec.suggested_track.duration / 60)}:
                              {String(
                                Math.floor(rec.suggested_track.duration % 60),
                              ).padStart(2, "0")}
                            </div>
                            <div className="flex items-center gap-1">
                              <Music className="h-4 w-4" />
                              {rec.suggested_track.bpm} BPM
                            </div>
                          </div>
                        </div>
                      )}

                      {rec.parameters &&
                        Object.keys(rec.parameters).length > 0 && (
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            {Object.entries(rec.parameters).map(
                              ([key, value]) => (
                                <div
                                  key={key}
                                  className="flex items-center justify-between p-2 bg-accent/30 rounded-md"
                                >
                                  <span className="text-muted-foreground">
                                    {key
                                      .split("_")
                                      .map(
                                        (word) =>
                                          word.charAt(0).toUpperCase() +
                                          word.slice(1),
                                      )
                                      .join(" ")}
                                  </span>
                                  <span>{value}</span>
                                </div>
                              ),
                            )}
                          </div>
                        )}

                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReject(rec.id)}
                        >
                          <ThumbsDown className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                        <Button size="sm" onClick={() => handleAccept(rec.id)}>
                          <ThumbsUp className="h-4 w-4 mr-2" />
                          Accept
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

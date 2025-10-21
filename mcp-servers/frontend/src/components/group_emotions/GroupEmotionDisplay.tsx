"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import { Badge } from "@/components/ui/Badge";
import { Users, Heart, Activity, Brain } from "lucide-react";
import {
  groupEmotionService,
  GroupEmotionalState,
} from "@/services/groupEmotionService";
import { cn } from "@/lib/utils";

interface GroupEmotionDisplayProps {
  sessionId: string;
  className?: string;
  refreshInterval?: number;
}

export function GroupEmotionDisplay({
  sessionId,
  className,
  refreshInterval = 5000,
}: GroupEmotionDisplayProps) {
  const [groupState, setGroupState] = useState<GroupEmotionalState | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGroupState = async () => {
      try {
        const state = await groupEmotionService.getCurrentState(sessionId);
        setGroupState(state);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch group state:", err);
        setError("Failed to fetch group emotional state");
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchGroupState();

    // Set up polling
    const interval = setInterval(fetchGroupState, refreshInterval);

    return () => clearInterval(interval);
  }, [sessionId, refreshInterval]);

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

  if (error || !groupState) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            {error || "No group emotional state available"}
          </div>
        </CardContent>
      </Card>
    );
  }

  const emotionColors: Record<string, string> = {
    energetic: "bg-yellow-500",
    calm: "bg-blue-500",
    happy: "bg-green-500",
    focused: "bg-purple-500",
    relaxed: "bg-teal-500",
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Group Emotional State
        </CardTitle>
        <CardDescription>
          Real-time emotional analysis of {groupState.participant_count}{" "}
          participants
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Dominant Emotion */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Dominant Emotion</span>
            <Badge
              variant="secondary"
              className={cn(
                "text-white",
                emotionColors[groupState.dominant_emotion] || "bg-gray-500",
              )}
            >
              {groupState.dominant_emotion}
            </Badge>
          </div>
          <Progress
            value={groupState.consensus_strength * 100}
            className="h-2"
          />
          <p className="text-xs text-muted-foreground">
            {Math.round(groupState.consensus_strength * 100)}% consensus
          </p>
        </div>

        {/* Biometric Averages */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {groupState.median_heart_rate && (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium">Heart Rate</span>
              </div>
              <p className="text-2xl font-bold">
                {Math.round(groupState.median_heart_rate)} BPM
              </p>
            </div>
          )}

          {groupState.median_energy_level && (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">Energy Level</span>
              </div>
              <p className="text-2xl font-bold">
                {Math.round(groupState.median_energy_level)}%
              </p>
            </div>
          )}

          {groupState.median_stress_level && (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium">Stress Level</span>
              </div>
              <p className="text-2xl font-bold">
                {Math.round(groupState.median_stress_level)}%
              </p>
            </div>
          )}
        </div>

        {/* Emotion Distribution */}
        <div className="space-y-2">
          <span className="text-sm font-medium">Emotion Distribution</span>
          <div className="space-y-1">
            {Object.entries(groupState.emotion_distribution)
              .sort(([, a], [, b]) => b - a)
              .map(([emotion, percentage]) => (
                <div key={emotion} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{emotion}</span>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(percentage * 100)}%
                    </span>
                  </div>
                  <Progress
                    value={percentage * 100}
                    className={cn(
                      "h-1",
                      emotionColors[emotion] || "bg-gray-500",
                    )}
                  />
                </div>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

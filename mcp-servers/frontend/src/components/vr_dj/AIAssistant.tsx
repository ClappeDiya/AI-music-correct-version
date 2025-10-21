"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useVRDJStore, vrDjService } from "@/services/vrDjService";
import { cn } from "@/lib/utils";
import {
  Brain,
  Music,
  ThumbsUp,
  ThumbsDown,
  Lightbulb,
  Waveform,
} from "lucide-react";

interface Suggestion {
  id: string;
  type: "track" | "transition" | "effect";
  content: string;
  confidence: number;
  timestamp: string;
}

export function AIAssistant({ className }: { className?: string }) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLearning, setIsLearning] = useState(false);
  const session = useVRDJStore((state) => state.session);

  useEffect(() => {
    // Simulate AI suggestions
    const suggestionTypes = ["track", "transition", "effect"];
    const interval = setInterval(() => {
      if (session?.id && Math.random() > 0.7) {
        const type =
          suggestionTypes[Math.floor(Math.random() * suggestionTypes.length)];
        const newSuggestion: Suggestion = {
          id: Math.random().toString(36).substr(2, 9),
          type: type as "track" | "transition" | "effect",
          content: generateSuggestionContent(type),
          confidence: Math.random(),
          timestamp: new Date().toISOString(),
        };

        setSuggestions((prev) => [newSuggestion, ...prev].slice(0, 10));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [session?.id]);

  const generateSuggestionContent = (type: string): string => {
    switch (type) {
      case "track":
        return 'Consider mixing in "Summer Vibes" - matches current BPM and key';
      case "transition":
        return "Gradual 16-beat fade with high-pass filter sweep";
      case "effect":
        return "Add reverb build-up for dramatic impact";
      default:
        return "";
    }
  };

  const handleFeedback = async (suggestionId: string, isPositive: boolean) => {
    if (!session?.id) return;

    try {
      await vrDjService.recordInteraction({
        session: session.id,
        interaction_type: "ai_suggestion_response",
        details: {
          suggestion_id: suggestionId,
          feedback: isPositive ? "positive" : "negative",
        },
        success_rating: isPositive ? 1 : 0,
      });

      // Remove suggestion after feedback
      setSuggestions((prev) => prev.filter((s) => s.id !== suggestionId));
    } catch (error) {
      console.error("Failed to record feedback:", error);
    }
  };

  const toggleLearning = async () => {
    if (!session?.id) return;

    setIsLearning(!isLearning);
    try {
      await vrDjService.recordInteraction({
        session: session.id,
        interaction_type: "ai_learning_toggle",
        details: {
          enabled: !isLearning,
        },
      });
    } catch (error) {
      console.error("Failed to toggle learning mode:", error);
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Assistant
          </div>
          <Button
            variant={isLearning ? "default" : "outline"}
            size="sm"
            onClick={toggleLearning}
          >
            <Lightbulb className="h-4 w-4 mr-2" />
            {isLearning ? "Learning" : "Start Learning"}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="p-4 rounded-lg border bg-card"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {suggestion.type === "track" && (
                        <Music className="h-4 w-4" />
                      )}
                      {suggestion.type === "transition" && (
                        <Waveform className="h-4 w-4" />
                      )}
                      {suggestion.type === "effect" && (
                        <Lightbulb className="h-4 w-4" />
                      )}
                      <Badge variant="outline" className="capitalize">
                        {suggestion.type}
                      </Badge>
                      <Badge
                        variant={
                          suggestion.confidence > 0.7 ? "default" : "secondary"
                        }
                      >
                        {Math.round(suggestion.confidence * 100)}% confident
                      </Badge>
                    </div>
                    <p className="text-sm">{suggestion.content}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleFeedback(suggestion.id, true)}
                    >
                      <ThumbsUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleFeedback(suggestion.id, false)}
                    >
                      <ThumbsDown className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

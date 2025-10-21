"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { formatDistanceToNow } from "date-fns";
import {
  VoiceModelAdaptiveEvent,
  voiceCloning,
} from "@/services/api/voice_cloning";
import { History, AlertTriangle } from "lucide-react";

interface ModelHistoryProps {
  modelId: number;
}

export function ModelHistory({ modelId }: ModelHistoryProps) {
  const [events, setEvents] = useState<VoiceModelAdaptiveEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, [modelId]);

  const loadHistory = async () => {
    try {
      const response = await voiceCloning.getVoiceModelEvents(modelId);
      setEvents(response.data);
    } catch (error) {
      console.error("Failed to load model history:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Model History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex items-start gap-4 border-b pb-4 last:border-0"
              >
                <Badge
                  variant={event.type === "error" ? "destructive" : "default"}
                >
                  {event.type === "error" ? (
                    <AlertTriangle className="h-3 w-3 mr-1" />
                  ) : null}
                  {event.type}
                </Badge>
                <div className="flex-1">
                  <p className="text-sm font-medium">{event.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(event.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

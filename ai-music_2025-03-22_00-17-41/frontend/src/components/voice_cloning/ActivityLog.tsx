"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { formatDistanceToNow } from "date-fns";
import { CollaborationService } from "@/services/websocket/collaboration";

interface ActivityEvent {
  id: string;
  type: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  details: string;
  timestamp: string;
}

interface ActivityLogProps {
  modelId: number;
  userId: string;
}

export function ActivityLog({ modelId, userId }: ActivityLogProps) {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [collaboration, setCollaboration] =
    useState<CollaborationService | null>(null);

  useEffect(() => {
    const service = new CollaborationService(modelId, userId);

    const handleEvent = (event: any) => {
      setEvents((prev) =>
        [
          {
            id: crypto.randomUUID(),
            type: event.type,
            user: event.user,
            details: getEventDetails(event),
            timestamp: event.timestamp,
          },
          ...prev,
        ].slice(0, 50),
      ); // Keep last 50 events
    };

    // Subscribe to all relevant events
    [
      "user_joined",
      "user_left",
      "parameter_change",
      "model_update",
      "comment_added",
    ].forEach((type) => service.subscribe(type as any, handleEvent));

    service.connect();
    setCollaboration(service);

    return () => service.disconnect();
  }, [modelId, userId]);

  const getEventDetails = (event: any) => {
    switch (event.type) {
      case "user_joined":
        return "joined the session";
      case "user_left":
        return "left the session";
      case "parameter_change":
        return `updated ${event.data.parameter} to ${event.data.value}`;
      case "model_update":
        return "updated the model";
      case "comment_added":
        return `commented: ${event.data.comment}`;
      default:
        return "performed an action";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Log</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event.id} className="flex items-start space-x-4">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={event.user.avatar} />
                  <AvatarFallback>{event.user.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <p className="text-sm">
                    <span className="font-medium">{event.user.name}</span>{" "}
                    {event.details}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(event.timestamp), {
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

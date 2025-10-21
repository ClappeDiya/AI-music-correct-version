"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/Tooltip";
import { CollaborationService } from "@/services/websocket/collaboration";

interface User {
  id: string;
  name: string;
  avatar?: string;
  lastActive: Date;
}

interface CollaborationPresenceProps {
  modelId: number;
  userId: string;
}

export function CollaborationPresence({
  modelId,
  userId,
}: CollaborationPresenceProps) {
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [collaboration, setCollaboration] =
    useState<CollaborationService | null>(null);

  useEffect(() => {
    const service = new CollaborationService(modelId, userId);

    service.subscribe("user_joined", (event) => {
      setActiveUsers((prev) => {
        const exists = prev.find((u) => u.id === event.user.id);
        if (exists) {
          return prev.map((u) =>
            u.id === event.user.id ? { ...u, lastActive: new Date() } : u,
          );
        }
        return [
          ...prev,
          {
            id: event.user.id,
            name: event.user.name,
            avatar: event.user.avatar,
            lastActive: new Date(),
          },
        ];
      });
    });

    service.subscribe("user_left", (event) => {
      setActiveUsers((prev) => prev.filter((u) => u.id !== event.user.id));
    });

    service.connect();
    setCollaboration(service);

    return () => service.disconnect();
  }, [modelId, userId]);

  // Clean up inactive users
  useEffect(() => {
    const interval = setInterval(() => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      setActiveUsers((prev) =>
        prev.filter((user) => user.lastActive > fiveMinutesAgo),
      );
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex -space-x-2">
      {activeUsers.map((user) => (
        <Tooltip key={user.id}>
          <TooltipTrigger>
            <Avatar className="h-8 w-8 border-2 border-background">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>
          </TooltipTrigger>
          <TooltipContent>
            <p>{user.name}</p>
            <p className="text-xs text-muted-foreground">
              Active {new Date(user.lastActive).toLocaleTimeString()}
            </p>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}

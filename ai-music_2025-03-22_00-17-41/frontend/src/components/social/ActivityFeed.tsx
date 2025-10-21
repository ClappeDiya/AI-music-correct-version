"use client";

import { useEffect, useState } from "react";
import { Card } from "@/componen../ui/card";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Music, MessageSquare, Heart } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Activity {
  id: string;
  type: "POST" | "COMMENT" | "LIKE";
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  timestamp: string;
  metadata?: {
    trackTitle?: string;
    commentText?: string;
  };
}

export function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch("/api/social/activity-feed");
        if (!response.ok) throw new Error("Failed to fetch activity feed");
        const data = await response.json();
        setActivities(data);
      } catch (error) {
        console.error("Error fetching activity feed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
    // Set up WebSocket connection for real-time updates
    const ws = new WebSocket(
      `${process.env.NEXT_PUBLIC_WS_URL}/ws/activity-feed/`,
    );

    ws.onmessage = (event) => {
      const newActivity = JSON.parse(event.data);
      setActivities((prev) => [newActivity, ...prev]);
    };

    return () => {
      ws.close();
    };
  }, []);

  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "POST":
        return <Music className="w-4 h-4" />;
      case "COMMENT":
        return <MessageSquare className="w-4 h-4" />;
      case "LIKE":
        return <Heart className="w-4 h-4" />;
    }
  };

  const getActivityText = (activity: Activity) => {
    switch (activity.type) {
      case "POST":
        return `shared a new track: ${activity.metadata?.trackTitle}`;
      case "COMMENT":
        return `commented: ${activity.metadata?.commentText}`;
      case "LIKE":
        return `liked ${activity.metadata?.trackTitle}`;
    }
  };

  if (isLoading) {
    return <div className="p-4">Loading activity feed...</div>;
  }

  return (
    <ScrollArea className="h-[600px] rounded-md border">
      <div className="p-4 space-y-4">
        {activities.map((activity) => (
          <Card key={activity.id} className="p-4">
            <div className="flex items-start space-x-4">
              <Avatar>
                <AvatarImage
                  src={activity.user.avatar}
                  alt={activity.user.name}
                />
                <AvatarFallback>{activity.user.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{activity.user.name}</span>
                  <span className="text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.timestamp), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <p className="text-sm flex items-center space-x-2">
                  {getActivityIcon(activity.type)}
                  <span>{getActivityText(activity)}</span>
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}

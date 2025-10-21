"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { MessageCircle, Clock, User } from "lucide-react";
import { SessionChat } from "./session-chat";

interface PeerTutoringCardProps {
  match: {
    id: string;
    peer: {
      id: string;
      name: string;
      skill_level: string;
      instruments: string[];
    };
    topic: string;
    description: string;
    preferred_time: string;
    status: "pending" | "accepted" | "completed";
    created_at: string;
  };
  onAccept: (id: string) => void;
  onMessage: (peerId: string) => void;
  className?: string;
}

export function PeerTutoringCard({
  match,
  onAccept,
  onMessage,
  className,
}: PeerTutoringCardProps) {
  const [showChat, setShowChat] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-500";
      case "accepted":
        return "bg-green-500/10 text-green-500";
      case "completed":
        return "bg-blue-500/10 text-blue-500";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

  return (
    <Card className={cn("transition-all hover:shadow-md", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{match.topic}</span>
            <Badge
              variant="secondary"
              className={cn("capitalize", getStatusColor(match.status))}
            >
              {match.status}
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            {match.status === "pending" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAccept(match.id)}
              >
                Accept
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowChat(!showChat)}
            >
              <MessageCircle className="w-4 h-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{match.description}</p>
        <div className="flex justify-between text-sm">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>Skill Level: {match.peer.skill_level}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>Preferred: {formatDate(match.preferred_time)}</span>
          </div>
        </div>

        {showChat && match.status !== "pending" && (
          <div className="pt-4">
            <SessionChat
              sessionId={match.id}
              sessionType="peer"
              participants={[
                {
                  id: "currentUser",
                  name: "You",
                },
                {
                  id: match.peer.id,
                  name: match.peer.name,
                },
              ]}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

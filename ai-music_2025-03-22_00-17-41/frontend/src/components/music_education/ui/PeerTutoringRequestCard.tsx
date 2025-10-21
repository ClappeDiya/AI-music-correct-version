"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Clock,
  MessageSquare,
  CheckCircle2,
  XCircle,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PeerTutoringRequestCardProps {
  request: {
    id: number;
    topic: string;
    description: string;
    status: "pending" | "accepted" | "rejected" | "completed";
    skillLevel: "beginner" | "intermediate" | "advanced";
    preferredTime: string;
    tutor?: {
      id: number;
      name: string;
      rating: number;
    };
  };
  onAccept?: (id: number) => Promise<void>;
  onReject?: (id: number) => Promise<void>;
  onMessage?: (id: number) => void;
  className?: string;
}

export function PeerTutoringRequestCard({
  request,
  onAccept,
  onReject,
  onMessage,
  className,
}: PeerTutoringRequestCardProps) {
  const statusColors = {
    pending: "bg-yellow-500",
    accepted: "bg-green-500",
    rejected: "bg-red-500",
    completed: "bg-blue-500",
  };

  const statusLabels = {
    pending: "Pending",
    accepted: "Accepted",
    rejected: "Rejected",
    completed: "Completed",
  };

  const skillLevelColors = {
    beginner: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    intermediate:
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    advanced:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  };

  return (
    <Card className={cn("transition-all", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <span>{request.topic}</span>
            <Badge
              variant="secondary"
              className={skillLevelColors[request.skillLevel]}
            >
              {request.skillLevel.charAt(0).toUpperCase() +
                request.skillLevel.slice(1)}
            </Badge>
          </CardTitle>
          <Badge className={cn("capitalize", statusColors[request.status])}>
            {statusLabels[request.status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{request.description}</p>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Preferred Time: {request.preferredTime}</span>
          </div>
          {request.tutor && (
            <div className="flex items-center space-x-2 text-muted-foreground">
              <User className="w-4 h-4" />
              <span>Tutor: {request.tutor.name}</span>
            </div>
          )}
        </div>

        {request.status === "pending" && (onAccept || onReject) && (
          <div className="flex justify-end space-x-2">
            {onReject && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onReject(request.id)}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
            )}
            {onAccept && (
              <Button size="sm" onClick={() => onAccept(request.id)}>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Accept
              </Button>
            )}
          </div>
        )}

        {(request.status === "accepted" || request.status === "completed") &&
          onMessage && (
            <Button
              className="w-full"
              variant={request.status === "completed" ? "outline" : "default"}
              onClick={() => onMessage(request.id)}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              {request.status === "completed" ? "View Chat" : "Open Chat"}
            </Button>
          )}
      </CardContent>
    </Card>
  );
}

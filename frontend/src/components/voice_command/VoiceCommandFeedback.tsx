"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/Badge";
import { MessageSquare, Check, X, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Command {
  id: string;
  text: string;
  status: "success" | "error" | "processing";
  timestamp: string;
}

interface VoiceCommandFeedbackProps {
  commands: Command[];
  className?: string;
}

export function VoiceCommandFeedback({
  commands,
  className,
}: VoiceCommandFeedbackProps) {
  const getStatusIcon = (status: Command["status"]) => {
    switch (status) {
      case "success":
        return <Check className="h-4 w-4 text-success" />;
      case "error":
        return <X className="h-4 w-4 text-destructive" />;
      case "processing":
        return <Clock className="h-4 w-4 text-muted-foreground animate-spin" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: Command["status"]) => {
    switch (status) {
      case "success":
        return "bg-success/10 text-success border-success/20";
      case "error":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "processing":
        return "bg-muted/10 text-muted-foreground border-muted/20";
      default:
        return "bg-muted border-muted/20";
    }
  };

  return (
    <Card className={cn("w-full max-w-md", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Command History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] sm:h-[400px] pr-4">
          <div className="space-y-2">
            {commands.length === 0 ? (
              <div className="flex items-center justify-center h-24 text-muted-foreground text-sm">
                No commands yet
              </div>
            ) : (
              commands.map((command) => (
                <div
                  key={command.id}
                  className="flex items-start gap-2 p-3 rounded-lg border bg-card"
                >
                  <Badge
                    variant="outline"
                    className={cn(
                      "h-6 w-6 p-1 flex items-center justify-center rounded-full",
                      getStatusColor(command.status),
                    )}
                  >
                    {getStatusIcon(command.status)}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {command.text}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(command.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

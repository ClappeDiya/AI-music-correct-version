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
import { useToast } from "@/components/ui/useToast";
import {
  Radio,
  ThumbsUp,
  Star,
  Music,
  Sparkles,
  MessageCircle,
  ArrowRight,
} from "lucide-react";
import { voiceChatService, DjComment } from "@/services/voiceChatService";
import { cn } from "@/lib/utils";

interface DjCommentaryProps {
  sessionId: string;
  className?: string;
  refreshInterval?: number;
}

export function DjCommentary({
  sessionId,
  className,
  refreshInterval = 5000,
}: DjCommentaryProps) {
  const { toast } = useToast();
  const [comments, setComments] = useState<DjComment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const recentComments =
          await voiceChatService.getRecentComments(sessionId);
        setComments(recentComments);
      } catch (error) {
        console.error("Failed to fetch DJ comments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
    const interval = setInterval(fetchComments, refreshInterval);

    return () => clearInterval(interval);
  }, [sessionId, refreshInterval]);

  const handleReaction = async (commentId: string) => {
    try {
      const updatedComment = await voiceChatService.reactToComment(commentId);
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === commentId ? updatedComment : comment,
        ),
      );
    } catch (error) {
      console.error("Failed to react to comment:", error);
      toast({
        title: "Error",
        description: "Failed to react to comment",
        variant: "destructive",
      });
    }
  };

  const handleMarkHelpful = async (commentId: string) => {
    try {
      const updatedComment =
        await voiceChatService.markCommentHelpful(commentId);
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === commentId ? updatedComment : comment,
        ),
      );
    } catch (error) {
      console.error("Failed to mark comment as helpful:", error);
      toast({
        title: "Error",
        description: "Failed to mark comment as helpful",
        variant: "destructive",
      });
    }
  };

  const getCommentIcon = (type: string) => {
    switch (type) {
      case "trackInfo":
        return <Music className="h-4 w-4" />;
      case "transition":
        return <ArrowRight className="h-4 w-4" />;
      case "trivia":
        return <Sparkles className="h-4 w-4" />;
      case "mood":
        return <MessageCircle className="h-4 w-4" />;
      default:
        return <Radio className="h-4 w-4" />;
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
          <Radio className="h-5 w-5" />
          AI DJ Commentary
        </CardTitle>
        <CardDescription>
          Real-time updates and insights from your AI DJ
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] w-full rounded-md border p-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className={cn(
                "mb-4 p-4 rounded-lg border",
                comment.priority > 0 && "bg-primary/5",
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getCommentIcon(comment.comment_type)}
                    <Badge variant="secondary">
                      {comment.comment_type_display}
                    </Badge>
                    {comment.track_id && (
                      <Badge variant="outline" className="ml-2">
                        Track Info
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm mb-2">{comment.content}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReaction(comment.id)}
                      className="flex items-center gap-1"
                    >
                      <ThumbsUp className="h-4 w-4" />
                      {comment.reaction_count}
                    </Button>
                    {!comment.was_helpful && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkHelpful(comment.id)}
                        className="flex items-center gap-1"
                      >
                        <Star className="h-4 w-4" />
                        Mark as Helpful
                      </Button>
                    )}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(comment.created_at).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

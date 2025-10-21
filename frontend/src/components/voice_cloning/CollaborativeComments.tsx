"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { formatDistanceToNow } from "date-fns";
import { CollaborationService } from "@/services/websocket/collaboration";
import { MessageSquare, Reply } from "lucide-react";

interface Comment {
  id: string;
  content: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: string;
  parentId?: string;
  replies?: Comment[];
}

interface CollaborativeCommentsProps {
  modelId: number;
  userId: string;
  userName: string;
  userAvatar?: string;
}

export function CollaborativeComments({
  modelId,
  userId,
  userName,
  userAvatar,
}: CollaborativeCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [collaboration, setCollaboration] =
    useState<CollaborationService | null>(null);

  useEffect(() => {
    const service = new CollaborationService(modelId, userId);

    service.subscribe("comment_added", (event) => {
      const comment: Comment = {
        id: crypto.randomUUID(),
        content: event.data.content,
        user: event.user,
        timestamp: event.timestamp,
        parentId: event.data.parentId,
      };

      setComments((prev) => {
        if (comment.parentId) {
          return prev.map((c) => {
            if (c.id === comment.parentId) {
              return {
                ...c,
                replies: [...(c.replies || []), comment],
              };
            }
            return c;
          });
        }
        return [...prev, comment];
      });
    });

    service.connect();
    setCollaboration(service);

    return () => service.disconnect();
  }, [modelId, userId]);

  const handleSubmit = () => {
    if (!newComment.trim() || !collaboration) return;

    collaboration.sendEvent("comment_added", {
      content: newComment,
      parentId: replyTo,
      user: {
        id: userId,
        name: userName,
        avatar: userAvatar,
      },
    });

    setNewComment("");
    setReplyTo(null);
  };

  const CommentComponent = ({ comment }: { comment: Comment }) => (
    <div className="space-y-2">
      <div className="flex items-start space-x-4">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.user.avatar} />
          <AvatarFallback>{comment.user.name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{comment.user.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.timestamp), {
                addSuffix: true,
              })}
            </p>
          </div>
          <p className="text-sm text-muted-foreground">{comment.content}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setReplyTo(comment.id)}
            className="text-xs"
          >
            <Reply className="h-3 w-3 mr-1" />
            Reply
          </Button>
        </div>
      </div>
      {comment.replies && (
        <div className="ml-8 space-y-2">
          {comment.replies.map((reply) => (
            <CommentComponent key={reply.id} comment={reply} />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comments
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {comments.map((comment) => (
                <CommentComponent key={comment.id} comment={comment} />
              ))}
            </div>
          </ScrollArea>

          <div className="space-y-2">
            {replyTo && (
              <div className="flex items-center justify-between bg-muted p-2 rounded-md">
                <p className="text-sm">Replying to comment</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyTo(null)}
                >
                  Cancel
                </Button>
              </div>
            )}
            <div className="flex space-x-2">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1"
              />
              <Button onClick={handleSubmit}>Send</Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

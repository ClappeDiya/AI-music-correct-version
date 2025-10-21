"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/componen../ui/card";
import { Textarea } from "@/components/ui/Textarea";
import { MessageCircle, Heart, Flag } from "lucide-react";
import { useToast } from "@/components/ui/usetoast";

interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  likes: number;
  replies: Comment[];
  createdAt: string;
}

interface CommentThreadProps {
  comment: Comment;
  onReply: (commentId: string, content: string) => Promise<void>;
  onLike: (commentId: string) => Promise<void>;
  onReport: (commentId: string) => Promise<void>;
}

export function CommentThread({
  comment,
  onReply,
  onLike,
  onReport,
}: CommentThreadProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const { toast } = useToast();

  const handleReply = async () => {
    try {
      await onReply(comment.id, replyContent);
      setReplyContent("");
      setIsReplying(false);
      toast({
        title: "Reply posted",
        description: "Your reply has been posted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post reply. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-4 mb-4">
      <div className="flex items-start space-x-4">
        <Avatar>
          <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
          <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h4 className="font-semibold">{comment.author.name}</h4>
            <span className="text-sm text-gray-500">
              {new Date(comment.createdAt).toLocaleDateString()}
            </span>
          </div>
          <p className="mt-1">{comment.content}</p>
          <div className="flex items-center space-x-4 mt-2">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-1"
              onClick={() => onLike(comment.id)}
            >
              <Heart className="w-4 h-4" />
              <span>{comment.likes}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-1"
              onClick={() => setIsReplying(!isReplying)}
            >
              <MessageCircle className="w-4 h-4" />
              <span>Reply</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-1"
              onClick={() => onReport(comment.id)}
            >
              <Flag className="w-4 h-4" />
              <span>Report</span>
            </Button>
          </div>

          {isReplying && (
            <div className="mt-4">
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write your reply..."
                className="mb-2"
              />
              <div className="flex space-x-2">
                <Button onClick={handleReply}>Post Reply</Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsReplying(false);
                    setReplyContent("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {comment.replies?.length > 0 && (
            <div className="mt-4 ml-8">
              {comment.replies.map((reply) => (
                <CommentThread
                  key={reply.id}
                  comment={reply}
                  onReply={onReply}
                  onLike={onLike}
                  onReport={onReport}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

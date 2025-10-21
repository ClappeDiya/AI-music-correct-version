"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/textarea";
import { CommentThread } from "./comment-thread";
import { useToast } from "@/components/ui/useToast";

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

interface CommentSectionProps {
  contentId: string;
  initialComments: Comment[];
}

export function CommentSection({
  contentId,
  initialComments,
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState("");
  const { toast } = useToast();

  const handlePostComment = async () => {
    try {
      const response = await fetch(`/api/comments/content/${contentId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newComment }),
      });

      if (!response.ok) throw new Error("Failed to post comment");

      const data = await response.json();
      setComments([data, ...comments]);
      setNewComment("");
      toast({
        title: "Comment posted",
        description: "Your comment has been posted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReply = async (id: string, content: string) => {
    try {
      const response = await fetch(
        `/api/comments/content/${contentId}/${id}/reply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content }),
        },
      );

      if (!response.ok) throw new Error("Failed to post reply");

      const data = await response.json();
      const updatedComments = updateCommentReplies(comments, id, data);
      setComments(updatedComments);
    } catch (error) {
      throw error;
    }
  };

  const handleLike = async (id: string) => {
    try {
      const response = await fetch(
        `/api/comments/content/${contentId}/${id}/like`,
        {
          method: "POST",
        },
      );

      if (!response.ok) throw new Error("Failed to like comment");

      const data = await response.json();
      const updatedComments = updateCommentLikes(comments, id, data.likes);
      setComments(updatedComments);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to like comment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReport = async (id: string) => {
    try {
      const response = await fetch(
        `/api/comments/content/${contentId}/${id}/report`,
        {
          method: "POST",
        },
      );

      if (!response.ok) throw new Error("Failed to report comment");

      toast({
        title: "Report submitted",
        description:
          "Thank you for reporting this comment. We will review it shortly.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to report comment. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="min-h-[100px]"
        />
        <Button onClick={handlePostComment} disabled={!newComment.trim()}>
          Post Comment
        </Button>
      </div>

      <div className="space-y-4">
        {comments.map((comment) => (
          <CommentThread
            key={comment.id}
            comment={comment}
            onReply={handleReply}
            onLike={handleLike}
            onReport={handleReport}
          />
        ))}
      </div>
    </div>
  );
}

// Helper functions to update comment state
function updateCommentReplies(
  comments: Comment[],
  id: string,
  newReply: Comment,
): Comment[] {
  return comments.map((comment) => {
    if (comment.id === id) {
      return {
        ...comment,
        replies: [...(comment.replies || []), newReply],
      };
    }
    if (comment.replies?.length) {
      return {
        ...comment,
        replies: updateCommentReplies(comment.replies, id, newReply),
      };
    }
    return comment;
  });
}

function updateCommentLikes(
  comments: Comment[],
  id: string,
  newLikes: number,
): Comment[] {
  return comments.map((comment) => {
    if (comment.id === id) {
      return {
        ...comment,
        likes: newLikes,
      };
    }
    if (comment.replies?.length) {
      return {
        ...comment,
        replies: updateCommentLikes(comment.replies, id, newLikes),
      };
    }
    return comment;
  });
}

"use client";

import { useState, useEffect } from "react";
import { Card } from "@/componen../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { MoreVertical, Pin, Flag, MessageSquare } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/components/ui/usetoast";

interface Post {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  isPinned: boolean;
  isModeratorPost: boolean;
}

interface GroupDiscussionProps {
  groupId: string;
  isUserModerator: boolean;
}

export function GroupDiscussion({
  groupId,
  isUserModerator,
}: GroupDiscussionProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`/api/groups/${groupId}/posts`);
        if (!response.ok) throw new Error("Failed to fetch posts");
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchPosts();

    // Set up WebSocket connection for real-time updates
    const ws = new WebSocket(
      `${process.env.NEXT_PUBLIC_WS_URL}/ws/groups/${groupId}/`,
    );

    ws.onmessage = (event) => {
      const newPost = JSON.parse(event.data);
      setPosts((prev) => [newPost, ...prev]);
    };

    return () => {
      ws.close();
    };
  }, [groupId]);

  const handleSubmitPost = async () => {
    if (!newPost.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/groups/${groupId}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newPost }),
      });

      if (!response.ok) throw new Error("Failed to create post");

      setNewPost("");
      toast({
        title: "Post Created",
        description: "Your post has been published successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePinPost = async (postId: string) => {
    try {
      const response = await fetch(
        `/api/groups/${groupId}/posts/${postId}/pin`,
        {
          method: "POST",
        },
      );

      if (!response.ok) throw new Error("Failed to pin post");

      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId ? { ...post, isPinned: !post.isPinned } : post,
        ),
      );

      toast({
        title: "Post Updated",
        description: "Post pin status has been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReportPost = async (postId: string) => {
    try {
      const response = await fetch(
        `/api/groups/${groupId}/posts/${postId}/report`,
        {
          method: "POST",
        },
      );

      if (!response.ok) throw new Error("Failed to report post");

      toast({
        title: "Post Reported",
        description:
          "Thank you for reporting this post. Our moderators will review it.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to report post. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <Textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="Share something with the group..."
          className="min-h-[100px] mb-4"
        />
        <Button
          onClick={handleSubmitPost}
          disabled={isSubmitting || !newPost.trim()}
          className="w-full"
        >
          {isSubmitting ? "Posting..." : "Post"}
        </Button>
      </Card>

      <ScrollArea className="h-[600px]">
        <div className="space-y-4">
          {posts.map((post) => (
            <Card
              key={post.id}
              className={`p-4 ${post.isPinned ? "border-primary" : ""}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <Avatar>
                    <AvatarImage
                      src={post.author.avatar}
                      alt={post.author.name}
                    />
                    <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{post.author.name}</span>
                      {post.isModeratorPost && (
                        <Badge variant="secondary">Moderator</Badge>
                      )}
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(post.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <p className="mt-2">{post.content}</p>
                    <div className="mt-4 flex items-center space-x-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Reply
                      </Button>
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {isUserModerator && (
                      <DropdownMenuItem onClick={() => handlePinPost(post.id)}>
                        <Pin className="w-4 h-4 mr-2" />
                        {post.isPinned ? "Unpin" : "Pin"}
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => handleReportPost(post.id)}>
                      <Flag className="w-4 h-4 mr-2" />
                      Report
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

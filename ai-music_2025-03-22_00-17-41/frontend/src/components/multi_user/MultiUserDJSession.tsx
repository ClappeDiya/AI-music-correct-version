"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/Tooltip";
import {
  Users,
  Crown,
  Music2,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Settings,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useMultiUserDJ } from "@/hooks/useMultiUserDJ";
import { TrackRequestDialog } from "./TrackRequestDialog";

interface User {
  id: string;
  name: string;
  avatar?: string;
  isHost: boolean;
  isOnline: boolean;
}

interface Track {
  id: string;
  title: string;
  artist: string;
  requestedBy: User;
  votes: {
    up: number;
    down: number;
  };
  status: "pending" | "approved" | "rejected" | "playing";
}

interface MultiUserDJSessionProps {
  sessionId: string;
  currentUser: User;
  className?: string;
}

export function MultiUserDJSession({
  sessionId,
  currentUser,
  className,
}: MultiUserDJSessionProps) {
  const {
    session,
    loading,
    error,
    requestTrack,
    voteTrack,
    updateTrackStatus,
    leaveSession,
  } = useMultiUserDJ(sessionId);

  const handleTrackRequest = async (trackData: {
    track_id: string;
    title: string;
    artist: string;
  }) => {
    await requestTrack(trackData);
  };

  const handleVote = async (trackRequestId: string, vote: "up" | "down") => {
    await voteTrack(trackRequestId, vote);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <p className="text-destructive">Failed to load session</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <Card className={cn("w-full max-w-4xl", className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Collaborative DJ Session
          </div>
          <Badge variant="outline" className="gap-1">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            {session.participants.length} Online
          </Badge>
        </CardTitle>
        <CardDescription>
          Vote and collaborate on the music queue
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Connected Users */}
          <Card className="col-span-1">
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-medium">
                Connected Users
              </CardTitle>
            </CardHeader>
            <CardContent className="py-0">
              <ScrollArea className="h-[300px]">
                <div className="space-y-4">
                  {session.participants.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>
                            {user.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {user.isOnline ? "Online" : "Offline"}
                          </p>
                        </div>
                      </div>
                      {user.isHost && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Crown className="h-4 w-4 text-yellow-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Session Host</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Track Queue */}
          <Card className="col-span-1 lg:col-span-2">
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                Track Queue
                {session.host.id === currentUser.id && (
                  <Button variant="outline" size="sm" className="gap-2">
                    <Settings className="h-4 w-4" />
                    Host Controls
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="py-0">
              <ScrollArea className="h-[300px]">
                <div className="space-y-4">
                  {session.queue.map((track) => (
                    <div
                      key={track.id}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg border",
                        track.status === "playing" && "bg-primary/10",
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <Music2 className="h-4 w-4" />
                        <div>
                          <p className="font-medium">{track.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {track.artist}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={track.requestedBy.avatar} />
                              <AvatarFallback>
                                {track.requestedBy.name.substring(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground">
                              Requested by {track.requestedBy.name}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleVote(track.id, "up")}
                          className="h-8 w-8 p-0"
                        >
                          <ThumbsUp className="h-4 w-4" />
                          <span className="sr-only">Vote Up</span>
                        </Button>
                        <span className="text-sm font-medium w-8 text-center">
                          {track.votes.up - track.votes.down}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleVote(track.id, "down")}
                          className="h-8 w-8 p-0"
                        >
                          <ThumbsDown className="h-4 w-4" />
                          <span className="sr-only">Vote Down</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Session Controls */}
        <div className="flex items-center justify-between mt-6">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              const url = `${window.location.origin}/session/${sessionId}`;
              navigator.clipboard.writeText(url);
            }}
          >
            <Share2 className="h-4 w-4" />
            Share Session
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Chat
            </Button>
            <TrackRequestDialog
              onRequest={handleTrackRequest}
              onVoiceCommand={(command) =>
                console.log("Voice command:", command)
              }
              recentTracks={session.queue
                .filter((track) => track.status === "played")
                .slice(0, 5)
                .map((track) => ({
                  id: track.track_id,
                  title: track.track_title,
                  artist: track.track_artist,
                  duration: "3:30", // You might want to add duration to your track model
                }))}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import {
  PlayIcon,
  PauseIcon,
  ShareIcon,
  LockClosedIcon,
  GlobeIcon,
  UsersIcon,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface MusicPreviewCardProps {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  privacy: "private" | "friends" | "public";
  audioUrl: string;
  onShare?: () => void;
  className?: string;
}

export function MusicPreviewCard({
  id,
  title,
  description,
  createdAt,
  user,
  privacy,
  audioUrl,
  onShare,
  className = "",
}: MusicPreviewCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio] = useState(new Audio(audioUrl));

  const togglePlay = () => {
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Cleanup audio on unmount
  useState(() => {
    return () => {
      audio.pause();
      audio.src = "";
    };
  });

  const getBadgeVariant = () => {
    switch (privacy) {
      case "public":
        return "secondary";
      case "friends":
        return "default";
      default:
        return "outline";
    }
  };

  const getBadgeIcon = () => {
    switch (privacy) {
      case "public":
        return <GlobeIcon className="h-3 w-3 mr-1" />;
      case "friends":
        return <UsersIcon className="h-3 w-3 mr-1" />;
      default:
        return <LockClosedIcon className="h-3 w-3 mr-1" />;
    }
  };

  const getBadgeText = () => {
    switch (privacy) {
      case "public":
        return "Public";
      case "friends":
        return "Friends";
      default:
        return "Private";
    }
  };

  return (
    <Card className={`w-full max-w-md ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatarUrl} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <p className="text-xs text-muted-foreground">
              {user.name} •{" "}
              {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
        <Badge variant={getBadgeVariant()}>
          {getBadgeIcon()}
          {getBadgeText()}
        </Badge>
      </CardHeader>

      <CardContent>
        {description && (
          <p className="text-sm text-muted-foreground mb-4">{description}</p>
        )}
        <div className="w-full h-24 bg-secondary rounded-md flex items-center justify-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12"
            onClick={togglePlay}
          >
            {isPlaying ? (
              <PauseIcon className="h-6 w-6" />
            ) : (
              <PlayIcon className="h-6 w-6" />
            )}
          </Button>
        </div>
      </CardContent>

      <CardFooter>
        <div className="flex justify-end w-full">
          {onShare && (
            <Button variant="ghost" size="sm" onClick={onShare}>
              <ShareIcon className="h-4 w-4 mr-2" />
              Share
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

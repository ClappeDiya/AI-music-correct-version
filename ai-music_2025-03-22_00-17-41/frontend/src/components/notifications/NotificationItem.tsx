"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Bell, Heart, MessageSquare, Music2, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export interface NotificationData {
  id: string;
  type: "like" | "comment" | "follow" | "track" | "system";
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  link?: string;
  actionUserId?: string;
  actionUserName?: string;
  contentId?: string;
}

interface NotificationItemProps {
  notification: NotificationData;
  onMarkAsRead: (id: string) => void;
  onClick?: (notification: NotificationData) => void;
}

const notificationIcons = {
  like: Heart,
  comment: MessageSquare,
  follow: User,
  track: Music2,
  system: Bell,
};

export function NotificationItem({
  notification,
  onMarkAsRead,
  onClick,
}: NotificationItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = notificationIcons[notification.type];

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
    onClick?.(notification);
  };

  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start gap-4 p-4 h-auto hover:bg-accent",
        !notification.isRead && "bg-accent/50",
        "relative",
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <div className="flex items-start gap-4 w-full">
        <div
          className={cn(
            "rounded-full p-2",
            notification.isRead ? "bg-muted" : "bg-primary",
          )}
        >
          <Icon
            className={cn(
              "h-4 w-4",
              notification.isRead
                ? "text-muted-foreground"
                : "text-primary-foreground",
            )}
          />
        </div>
        <div className="flex-1 space-y-1 text-left">
          <p className="text-sm font-medium leading-none">
            {notification.title}
          </p>
          <p className="text-sm text-muted-foreground">
            {notification.message}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(notification.createdAt), {
              addSuffix: true,
            })}
          </p>
        </div>
      </div>
      {isHovered && !notification.isRead && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <div className="h-2 w-2 rounded-full bg-primary" />
        </div>
      )}
    </Button>
  );
}

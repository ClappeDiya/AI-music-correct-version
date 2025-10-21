'use client';

import { useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { NotificationItem, NotificationData } from ./notification-item';
import { useToast } from "@/components/ui/usetoast";

interface NotificationListProps {
  notifications: NotificationData[];
  onMarkAsRead: (id: string) => void;
  onNotificationClick?: (notification: NotificationData) => void;
}

export function NotificationList({
  notifications,
  onMarkAsRead,
  onNotificationClick,
}: NotificationListProps) {
  const [sortedNotifications, setSortedNotifications] = useState<NotificationData[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Sort notifications by date (newest first) and read status
    const sorted = [...notifications].sort((a, b) => {
      if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    setSortedNotifications(sorted);
  }, [notifications]);

  const handleNotificationClick = async (notification: NotificationData) => {
    try {
      if (!notification.isRead) {
        await onMarkAsRead(notification.id);
      }
      onNotificationClick?.(notification);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark notification as read',
        variant: 'destructive',
      });
    }
  };

  return (
    <ScrollArea className="h-[calc(100vh-12rem)] px-1">
      <div className="space-y-1">
        {sortedNotifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onMarkAsRead={onMarkAsRead}
            onClick={handleNotificationClick}
          />
        ))}
        {sortedNotifications.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            No notifications yet
          </div>
        )}
      </div>
    </ScrollArea>
  );
}




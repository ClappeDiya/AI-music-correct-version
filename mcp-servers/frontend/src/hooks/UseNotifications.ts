"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { NotificationData } from "@/components/notifications/NotificationItem";
import { useToast } from "@/components/ui/useToast";

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  // Fetch initial notifications
  useEffect(() => {
    fetchNotifications();
  }, []);

  // WebSocket connection
  useEffect(() => {
    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}/ws/notifications/`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "notification") {
        handleNewNotification(data.notification);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        setSocket(new WebSocket(wsUrl));
      }, 5000);
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications");
      if (!response.ok) throw new Error("Failed to fetch notifications");
      const data = await response.json();
      setNotifications(data);
      updateUnreadCount(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      });
    }
  };

  const handleNewNotification = useCallback(
    (notification: NotificationData) => {
      setNotifications((prev) => [notification, ...prev]);
      updateUnreadCount([notification, ...notifications]);
      toast({
        title: notification.title,
        description: notification.message,
      });
    },
    [notifications, toast],
  );

  const updateUnreadCount = (notifs: NotificationData[]) => {
    const count = notifs.filter((n) => !n.isRead).length;
    setUnreadCount(count);
  };

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to mark notification as read");

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      updateUnreadCount(
        notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
    }
  };

  const handleNotificationClick = (notification: NotificationData) => {
    if (notification.link) {
      router.push(notification.link);
    }
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    handleNotificationClick,
  };
}

"use client";

import { useEffect, useState } from "react";
import { NotificationList } from "@/components/notifications/NotificationList";
import { useNotifications } from "@/hooks/useNotifications";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/componen../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Bell } from "lucide-react";

export default function NotificationsPage() {
  const { notifications, markAsRead, handleNotificationClick } =
    useNotifications();

  const unreadNotifications = notifications.filter((n) => !n.isRead);
  const readNotifications = notifications.filter((n) => n.isRead);

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Bell className="h-6 w-6" />
            <CardTitle>Notifications</CardTitle>
          </div>
          <CardDescription>
            Stay updated with your latest activities and interactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="unread" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="unread">
                Unread ({unreadNotifications.length})
              </TabsTrigger>
              <TabsTrigger value="all">
                All ({notifications.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="unread">
              <NotificationList
                notifications={unreadNotifications}
                onMarkAsRead={markAsRead}
                onNotificationClick={handleNotificationClick}
              />
            </TabsContent>
            <TabsContent value="all">
              <NotificationList
                notifications={notifications}
                onMarkAsRead={markAsRead}
                onNotificationClick={handleNotificationClick}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

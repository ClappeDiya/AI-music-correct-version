import { useState, useEffect } from "react";
import { Bell, Check, Clock, AlertTriangle, Info } from "lucide-react";
import { format } from "date-fns";
import { useModerationNotifications } from "@/lib/hooks/use-moderation";
import { Button } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/Badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { DisputeNotification } from "@/lib/api/types";

const PRIORITY_COLORS = {
  low: "bg-blue-500",
  medium: "bg-yellow-500",
  high: "bg-orange-500",
  urgent: "bg-red-500",
};

const TYPE_ICONS = {
  case_update: Info,
  message: Bell,
  resolution: Check,
  appeal: AlertTriangle,
  warning: AlertTriangle,
};

interface NotificationItemProps {
  notification: DisputeNotification;
  onRead: (id: string) => void;
}

function NotificationItem({ notification, onRead }: NotificationItemProps) {
  const Icon = TYPE_ICONS[notification.type] || Info;

  return (
    <div
      className={`p-4 border-b last:border-b-0 ${notification.read ? "opacity-60" : ""}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-grow min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-medium text-sm">{notification.title}</h4>
            <Badge
              variant="outline"
              className={PRIORITY_COLORS[notification.priority]}
            >
              {notification.priority}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {notification.message}
          </p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground">
              {format(new Date(notification.timestamp), "PPp")}
            </span>
            {notification.action_required && (
              <Badge variant="secondary">Action Required</Badge>
            )}
          </div>
          {notification.action_deadline && (
            <div className="flex items-center gap-1 mt-1">
              <Clock className="h-3 w-3" />
              <span className="text-xs text-muted-foreground">
                Due by {format(new Date(notification.action_deadline), "PPp")}
              </span>
            </div>
          )}
        </div>
      </div>
      {!notification.read && (
        <div className="mt-2 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRead(notification.id)}
          >
            Mark as Read
          </Button>
        </div>
      )}
    </div>
  );
}

export function NotificationCenter() {
  const { notifications, isLoading, markAsRead, filters, updateFilters } =
    useModerationNotifications();

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (notifications) {
      setUnreadCount(
        notifications.filter((n: DisputeNotification) => !n.read).length,
      );
    }
  }, [notifications]);

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
  };

  const groupedNotifications = notifications?.reduce(
    (acc: Record<string, DisputeNotification[]>, notification) => {
      const key = notification.read ? "read" : "unread";
      acc[key] = [...(acc[key] || []), notification];
      return acc;
    },
    { unread: [], read: [] },
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          Notifications
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>Notifications</SheetTitle>
                <SheetDescription>
                  View and manage your notifications
                </SheetDescription>
              </SheetHeader>
              <Tabs defaultValue="unread" className="mt-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="unread">
                    Unread ({groupedNotifications?.unread?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="read">
                    Read ({groupedNotifications?.read?.length || 0})
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="unread">
                  <ScrollArea className="h-[calc(100vh-200px)]">
                    {groupedNotifications?.unread?.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onRead={handleMarkAsRead}
                      />
                    ))}
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="read">
                  <ScrollArea className="h-[calc(100vh-200px)]">
                    {groupedNotifications?.read?.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onRead={handleMarkAsRead}
                      />
                    ))}
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </SheetContent>
          </Sheet>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup className="max-h-[300px] overflow-auto">
          {groupedNotifications?.unread?.slice(0, 5).map((notification) => (
            <DropdownMenuItem key={notification.id}>
              <NotificationItem
                notification={notification}
                onRead={handleMarkAsRead}
              />
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

'use client';

import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/Popover';
import { NotificationBadge } from ./notification-badge';
import { NotificationList } from './NotificationList';
import { NotificationData } from ./notification-item';
import { useNotifications } from '@/hooks/useNotifications';

export function NotificationPopover() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    handleNotificationClick,
  } = useNotifications();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Open notifications"
        >
          <Bell className="h-5 w-5" />
          <NotificationBadge count={unreadCount} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[380px] p-0"
        align="end"
        sideOffset={8}
      >
        <div className="p-4 border-b">
          <h4 className="text-sm font-medium">Notifications</h4>
        </div>
        <NotificationList
          notifications={notifications}
          onMarkAsRead={markAsRead}
          onNotificationClick={handleNotificationClick}
        />
      </PopoverContent>
    </Popover>
  );
}




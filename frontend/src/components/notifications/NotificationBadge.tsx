"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface NotificationBadgeProps {
  count: number;
  className?: string;
}

export function NotificationBadge({
  count,
  className,
}: NotificationBadgeProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (count > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [count]);

  if (count === 0) return null;

  return (
    <Badge
      variant="destructive"
      className={cn(
        "absolute -top-1 -right-1 min-w-[1.2rem] h-[1.2rem] px-1 flex items-center justify-center text-xs",
        isAnimating && "animate-bounce",
        className,
      )}
    >
      {count > 99 ? "99+" : count}
    </Badge>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/Button";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResponsiveSidebarProps {
  children: React.ReactNode;
  className?: string;
  side?: "left" | "right";
  breakpoint?: "sm" | "md" | "lg" | "xl" | "2xl";
}

const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
};

export function ResponsiveSidebar({
  children,
  className,
  side = "left",
  breakpoint = "lg",
}: ResponsiveSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isLargeScreen = useMediaQuery(
    `(min-width: ${breakpoints[breakpoint]})`,
  );

  useEffect(() => {
    if (isLargeScreen) {
      setIsOpen(false);
    }
  }, [isLargeScreen]);

  if (isLargeScreen) {
    return (
      <div
        className={cn(
          "h-screen sticky top-0",
          side === "left" ? "border-r" : "border-l",
          className,
        )}
      >
        {children}
      </div>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="fixed bottom-4 bg-background border shadow-lg hover:bg-accent"
          style={{
            [side]: "1rem",
            zIndex: 40,
          }}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side={side} className={className}>
        {children}
      </SheetContent>
    </Sheet>
  );
}

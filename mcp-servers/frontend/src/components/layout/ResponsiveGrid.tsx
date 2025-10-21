"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ResponsiveGridProps {
  children: ReactNode;
  className?: string;
  minChildWidth?: string;
  gap?: string;
}

export function ResponsiveGrid({
  children,
  className,
  minChildWidth = "250px",
  gap = "1rem",
}: ResponsiveGridProps) {
  return (
    <div
      className={cn("grid grid-cols-1 auto-rows-max", className)}
      style={{
        gap,
        gridTemplateColumns: `repeat(auto-fill, minmax(${minChildWidth}, 1fr))`,
      }}
    >
      {children}
    </div>
  );
}

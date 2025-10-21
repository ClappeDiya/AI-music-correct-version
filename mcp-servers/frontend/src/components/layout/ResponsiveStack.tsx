"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ResponsiveStackProps {
  children: ReactNode;
  className?: string;
  direction?: "row" | "column";
  breakpoint?: "sm" | "md" | "lg" | "xl" | "2xl";
  spacing?: "none" | "sm" | "md" | "lg";
  reverse?: boolean;
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between" | "around";
}

const directionClasses = {
  row: {
    base: "flex-col",
    sm: "sm:flex-row",
    md: "md:flex-row",
    lg: "lg:flex-row",
    xl: "xl:flex-row",
    "2xl": "2xl:flex-row",
  },
  column: {
    base: "flex-row",
    sm: "sm:flex-col",
    md: "md:flex-col",
    lg: "lg:flex-col",
    xl: "xl:flex-col",
    "2xl": "2xl:flex-col",
  },
};

const spacingClasses = {
  none: "gap-0",
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
};

const alignClasses = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
};

const justifyClasses = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
};

export function ResponsiveStack({
  children,
  className,
  direction = "row",
  breakpoint = "md",
  spacing = "md",
  reverse = false,
  align = "stretch",
  justify = "start",
}: ResponsiveStackProps) {
  return (
    <div
      className={cn(
        "flex",
        directionClasses[direction].base,
        directionClasses[direction][breakpoint],
        spacingClasses[spacing],
        alignClasses[align],
        justifyClasses[justify],
        reverse && "flex-row-reverse",
        className,
      )}
    >
      {children}
    </div>
  );
}

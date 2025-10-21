"use client";

import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { SunIcon, MoonIcon } from "lucide-react";
import { Switch } from "@/components/ui/Switch";
import { Label } from "@/components/ui/Label";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  variant?: "switch" | "button";
}

export function ThemeToggle({ 
  className,
  variant = "button" 
}: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // To avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isDark = theme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  if (variant === "switch") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <SunIcon className="h-4 w-4 text-muted-foreground" />
        <Switch
          checked={isDark}
          onCheckedChange={toggleTheme}
          className="data-[state=checked]:bg-secondary"
        />
        <MoonIcon className="h-4 w-4 text-muted-foreground" />
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className={cn(
        "rounded-full w-9 h-9 transition-colors", 
        isDark 
          ? "bg-slate-800 text-slate-100" 
          : "bg-slate-100 text-slate-800",
        "hover:bg-primary hover:text-primary-foreground",
        "light:hover:shadow-[0_0_10px_rgba(0,255,255,0.7)]",
        "dark:hover:shadow-[0_0_10px_rgba(232,29,110,0.7)]",
        className
      )}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {isDark ? (
        <SunIcon className="h-4 w-4" />
      ) : (
        <MoonIcon className="h-4 w-4" />
      )}
    </Button>
  );
} 
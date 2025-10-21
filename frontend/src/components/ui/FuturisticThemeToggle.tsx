"use client";

import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface FuturisticThemeToggleProps {
  className?: string;
}

export function FuturisticThemeToggle({ className }: FuturisticThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // To avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-16 h-8 rounded-full bg-muted animate-pulse" />;
  }

  const isDark = theme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "relative w-16 h-8 rounded-full transition-all duration-300 focus:outline-none",
        "bg-gradient-to-r",
        isDark 
          ? "from-[#1A1A2E] to-[#1A1A2E] border-[#E81D6E]" 
          : "from-[#00FFFF] to-[#B200FF] border-transparent",
        className
      )}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <span
        className={cn(
          "absolute top-1 w-6 h-6 rounded-full transition-all duration-300 transform",
          isDark 
            ? "left-1 bg-[#E81D6E] shadow-[0_0_10px_rgba(232,29,110,0.7)]" 
            : "left-9 bg-white shadow-[0_0_10px_rgba(0,255,255,0.7)]"
        )}
      />
      
      {/* Sun/Moon icons */}
      <span
        className={cn(
          "absolute top-2 left-2 w-4 h-4 text-xs flex items-center justify-center transition-opacity",
          isDark ? "opacity-0" : "opacity-100"
        )}
      >
        ☀️
      </span>
      <span
        className={cn(
          "absolute top-2 right-2 w-4 h-4 text-xs flex items-center justify-center transition-opacity",
          isDark ? "opacity-100" : "opacity-0"
        )}
      >
        🌙
      </span>
    </button>
  );
} 
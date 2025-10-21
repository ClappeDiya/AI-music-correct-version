"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { FuturisticThemeToggle } from '@/components/ui/FuturisticThemeToggle';

interface ThemeToggleSectionProps {
  className?: string;
  title?: string;
  description?: string;
  showLabels?: boolean;
}

export function ThemeToggleSection({
  className,
  title = "Experience our new theme",
  description = "Switch between futuristic light and dark modes",
  showLabels = true,
}: ThemeToggleSectionProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-6", className)}>
      {title && <h3 className="text-lg font-medium mb-3">{title}</h3>}
      {description && <p className="text-sm text-muted-foreground mb-4 text-center max-w-xs">{description}</p>}
      
      <div className="flex items-center gap-4">
        {showLabels && <span className="text-sm text-muted-foreground">Dark</span>}
        <FuturisticThemeToggle />
        {showLabels && <span className="text-sm text-muted-foreground">Light</span>}
      </div>
    </div>
  );
} 
"use client";

import React from 'react';
import { useTheme } from 'next-themes';

interface ThemeAwareComponentProps {
  lightComponent: React.ReactNode;
  darkComponent: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ThemeAwareComponent({
  lightComponent,
  darkComponent,
  fallback
}: ThemeAwareComponentProps) {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  
  // Only render after mounting to prevent hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return <>{fallback}</> || null;
  }
  
  const currentTheme = theme === 'system' ? resolvedTheme : theme;
  
  return (
    <>
      {currentTheme === 'light' ? lightComponent : darkComponent}
    </>
  );
} 
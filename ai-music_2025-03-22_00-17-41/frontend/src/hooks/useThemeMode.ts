"use client";

import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

export function useThemeMode() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    
    // Determine if we're in light mode
    const currentTheme = theme === 'system' ? resolvedTheme : theme;
    setIsLightMode(currentTheme === 'light');
  }, [theme, resolvedTheme]);
  
  // Toggle between dark and light mode
  const toggleTheme = () => {
    if (!mounted) return;
    setTheme(isLightMode ? 'dark' : 'light');
  };
  
  // Set a specific theme
  const setLightMode = () => mounted && setTheme('light');
  const setDarkMode = () => mounted && setTheme('dark');
  const setSystemMode = () => mounted && setTheme('system');
  
  return {
    theme,
    resolvedTheme,
    isLightMode,
    isDarkMode: mounted && !isLightMode,
    isMounted: mounted,
    toggleTheme,
    setLightMode,
    setDarkMode,
    setSystemMode
  };
} 
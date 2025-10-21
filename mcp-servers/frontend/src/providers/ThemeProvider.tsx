"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false);

  // useEffect only runs on the client, so we can safely show the UI once
  // the component has mounted without hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Skip rendering anything with theme-specific classNames until mounted on client
  // This prevents hydration mismatch between server and client
  if (!mounted) {
    // Return a placeholder with the same structure but no theme classes
    // This will be replaced when the component mounts on the client
    return <div style={{ visibility: "hidden" }}>{children}</div>;
  }

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
} 
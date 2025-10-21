"use client";

import { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/Toaster";

interface VRMusicExperiencesLayoutProps {
  children: ReactNode;
}

export default function VRMusicExperiencesLayout({
  children,
}: VRMusicExperiencesLayoutProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen">
        {children}
        <Toaster />
      </div>
    </ThemeProvider>
  );
}

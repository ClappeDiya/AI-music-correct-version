"use client";

import React from "react";
import { Toaster } from "@/components/ui/Toaster";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <main className="flex-1">{children}</main>
      <Toaster />
    </div>
  );
}

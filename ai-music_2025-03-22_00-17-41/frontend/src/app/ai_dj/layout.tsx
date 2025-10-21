"use client";

import { Loader2 } from "lucide-react";
import Cookies from "js-cookie";

interface AIDJLayoutProps {
  children: React.ReactNode;
}

export default function AIDJLayout({ children }: AIDJLayoutProps) {
  // Set dashboard session cookie to ensure middleware allows access
  if (typeof window !== 'undefined') {
    // Set cookie for middleware to allow access
    Cookies.set("dashboard_session", "active", {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: 1 // 1 day
    });
    
    // Also set in localStorage as backup
    localStorage.setItem("dashboard_session", "active");
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="flex-1">{children}</main>

      <footer className="border-t py-4">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            AI DJ Experience. Mix music responsibly.
          </p>
          <p className="text-sm text-muted-foreground">
            {new Date().getFullYear()} AI DJ Experience. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
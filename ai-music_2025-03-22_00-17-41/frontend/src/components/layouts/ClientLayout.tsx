"use client";

import { Toaster } from "@/components/ui/Toaster";
import { cn } from "@/lib/utils";
import { GlobalNav } from "@/components/layout/GlobalNav";
import { Footer } from "@/components/layout/Footer";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Skip navigation for auth pages
  const isAuthPage = pathname?.startsWith('/auth/');

  // After mounting, we have access to the theme
  useEffect(() => {
    setMounted(true);
  }, []);
  
  return (
    <div className={cn(
      "min-h-screen bg-background font-sans antialiased flex flex-col",
      "transition-colors duration-300", // Smooth transitions between themes
    )} suppressHydrationWarning>
      {!isAuthPage && <GlobalNav />}
      <main className="flex-1 w-full">
        {children}
      </main>
      {!isAuthPage && <Footer />}
      <Toaster />
    </div>
  );
}

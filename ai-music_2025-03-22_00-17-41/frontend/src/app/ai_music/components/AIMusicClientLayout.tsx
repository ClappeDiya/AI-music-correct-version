"use client";

import { ProjectProvider } from "@/contexts/ProjectContext";

interface AIMusicClientLayoutProps {
  children: React.ReactNode;
}

export function AIMusicClientLayout({ children }: AIMusicClientLayoutProps) {
  return (
    <ProjectProvider>
      <div className="min-h-screen bg-background">
        <main className="flex-1">{children}</main>

        <footer className="border-t py-6 md:py-0">
          <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
            <p className="text-sm text-muted-foreground text-center md:text-left">
              AI-generated music. Use responsibly and respect copyright laws.
            </p>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} AI Music Generator. All rights
              reserved.
            </p>
          </div>
        </footer>
      </div>
    </ProjectProvider>
  );
} 
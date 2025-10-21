import { ReactNode } from "react";

interface AnalyticsLayoutProps {
  children: ReactNode;
}

export default function AnalyticsLayout({ children }: AnalyticsLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex-1 space-y-4 p-4 md:p-8">{children}</div>
    </div>
  );
}

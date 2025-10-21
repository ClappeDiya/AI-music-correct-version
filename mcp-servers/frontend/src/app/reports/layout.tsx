import { ReactNode } from "react";

interface ReportsLayoutProps {
  children: ReactNode;
}

export default function ReportsLayout({ children }: ReportsLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex-1 space-y-4 p-4 md:p-8">{children}</div>
    </div>
  );
}

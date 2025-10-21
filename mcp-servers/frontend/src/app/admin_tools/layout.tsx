import { ReactNode } from "react";
import { AdminNav, AdminHeader } from "./components";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
      <div className="border-r bg-muted/40">
        <div className="flex h-full flex-col">
          <div className="flex h-14 items-center border-b px-6">
            <span className="font-semibold">Admin Dashboard</span>
          </div>
          <div className="flex-1 p-4">
            <AdminNav />
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <AdminHeader title="Admin Tools" />
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}

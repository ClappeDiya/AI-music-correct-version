import { Metadata } from "next";
import { AuditLogViewer } from "@/app/admin/components/AuditLogViewer";

export const metadata: Metadata = {
  title: "Audit Logs",
  description: "Monitor and review system access and changes",
};

export default function AuditLogsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Audit Logs</h2>
      </div>
      <AuditLogViewer />
    </div>
  );
}

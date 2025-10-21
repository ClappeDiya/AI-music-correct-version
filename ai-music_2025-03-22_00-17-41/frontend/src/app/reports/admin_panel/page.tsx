"use client";

import { AdminDashboard } from "@/components/reports/admin/AdminDashboard";
import { PermissionGuard } from "@/components/reports/auth/PermissionGuard";

export default function AdminReportsPage() {
  return (
    <PermissionGuard
      permission="accessAdmin"
      fallback={
        <div className="flex h-[80vh] items-center justify-center text-muted-foreground">
          You don't have permission to access the admin dashboard.
        </div>
      }
    >
      <AdminDashboard />
    </PermissionGuard>
  );
}

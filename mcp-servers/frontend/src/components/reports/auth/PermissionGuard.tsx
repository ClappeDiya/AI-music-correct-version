"use client";

import { ReactNode } from "react";
import { useReportPermissions } from "./use-report-permissions";

interface PermissionGuardProps {
  children: ReactNode;
  permission: keyof ReturnType<typeof useReportPermissions>["can"];
  fallback?: ReactNode;
}

export function PermissionGuard({
  children,
  permission,
  fallback = null,
}: PermissionGuardProps) {
  const { can, isLoading } = useReportPermissions();

  if (isLoading) {
    return null;
  }

  if (!can[permission]) {
    return fallback;
  }

  return children;
}

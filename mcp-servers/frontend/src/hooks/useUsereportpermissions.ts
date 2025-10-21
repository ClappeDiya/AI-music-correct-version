import { useQuery } from "@tanstack/react-query";
import { authApi } from "@/lib/api/auth";

export interface ReportPermissions {
  canGenerateReports: boolean;
  canAccessRevenue: boolean;
  canAccessDemographics: boolean;
  canManageRoles: boolean;
  canExportData: boolean;
  canConfigureKPIs: boolean;
  allowedReportTypes: string[];
}

export function useReportPermissions() {
  const { data: permissions, isLoading } = useQuery({
    queryKey: ["report-permissions"],
    queryFn: () => authApi.getReportPermissions(),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return {
    permissions: permissions as ReportPermissions,
    isLoading,
    // Helper functions to check specific permissions
    can: {
      generateReport: (reportType: string) =>
        permissions?.canGenerateReports &&
        permissions?.allowedReportTypes.includes(reportType),
      accessRevenue: () => permissions?.canAccessRevenue,
      accessDemographics: () => permissions?.canAccessDemographics,
      manageRoles: () => permissions?.canManageRoles,
      exportData: () => permissions?.canExportData,
      configureKPIs: () => permissions?.canConfigureKPIs,
    },
  };
}

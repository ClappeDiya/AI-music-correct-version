import { useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryKey,
} from "@tanstack/react-query";
import { ComplianceAuditService } from "@/services/billing/ComplianceAuditService";
import {
  ComplianceAudit,
  ComplianceAuditCreate,
  ComplianceAuditFilter,
} from "@/types/billing/ComplianceAuditTypes";
import { useToast } from "@/components/ui/useToast";

const complianceAuditService = new ComplianceAuditService();

export function useComplianceAudit(filters?: ComplianceAuditFilter) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [error, setError] = useState<Error | null>(null);

  const queryKey: QueryKey = ["compliance-audits", filters];

  const {
    data: audits,
    isLoading,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => complianceAuditService.listWithFilters(filters || {}),
    onSettled: (_data, error) => {
      if (error) {
        setError(error as Error);
        toast({
          title: "Error fetching audit logs",
          description: (error as Error).message,
          variant: "destructive",
        });
      }
    },
  });

  const { data: summary, isLoading: isSummaryLoading } = useQuery({
    queryKey: ["compliance-audit-summary", filters?.dateFrom, filters?.dateTo],
    queryFn: () =>
      complianceAuditService.getAuditSummary({
        from: filters?.dateFrom || new Date().toISOString(),
        to: filters?.dateTo || new Date().toISOString(),
      }),
    enabled: !!filters?.dateFrom && !!filters?.dateTo,
  });

  const exportMutation = useMutation<Blob, Error, ComplianceAuditFilter>({
    mutationFn: (exportFilters) => complianceAuditService.export(exportFilters),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `compliance-audit-${new Date().toISOString()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Export successful",
        description: "Audit logs have been exported successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Export failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    audits,
    summary,
    isLoading,
    isSummaryLoading,
    error,
    refetch,
    exportAudits: exportMutation.mutate,
    isExporting: exportMutation.isPending,
  };
}

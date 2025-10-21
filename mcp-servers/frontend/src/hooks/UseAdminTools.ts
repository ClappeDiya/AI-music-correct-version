import { useState, useCallback } from "react";
import { adminToolsApi } from "@/services/admin_tools/api";
import { useToast } from "@/components/ui/useToast";

export function useAdminTools() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleApiCall = useCallback(
    async <T>(
      apiCall: () => Promise<T>,
      successMessage?: string,
      errorMessage = "An error occurred",
    ) => {
      setLoading(true);
      try {
        const result = await apiCall();
        if (successMessage) {
          toast({
            title: "Success",
            description: successMessage,
          });
        }
        return result;
      } catch (error) {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [toast],
  );

  const getReportedContent = useCallback(
    (params?: any) => {
      return handleApiCall(
        () => adminToolsApi.getReportedContent(params),
        undefined,
        "Failed to load reported content",
      );
    },
    [handleApiCall],
  );

  const getModerationActions = useCallback(
    (params?: any) => {
      return handleApiCall(
        () => adminToolsApi.getModerationActions(params),
        undefined,
        "Failed to load moderation actions",
      );
    },
    [handleApiCall],
  );

  const createModerationAction = useCallback(
    (data: any) => {
      return handleApiCall(
        () => adminToolsApi.createModerationAction(data),
        "Moderation action created successfully",
        "Failed to create moderation action",
      );
    },
    [handleApiCall],
  );

  return {
    loading,
    getReportedContent,
    getModerationActions,
    createModerationAction,
  };
}

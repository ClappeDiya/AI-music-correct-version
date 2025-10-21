import { useToast } from "@/components/ui/useToast";
import { AppError, handleError } from "@/lib/utils/error-handling";
import { APIErrorHandler } from "@/lib/utils/api-error-handler";
import { useCallback } from "react";

interface ErrorHandlerOptions {
  title?: string;
  onError?: (error: AppError) => void;
  showToast?: boolean;
}

export function useApiError(options: ErrorHandlerOptions = {}) {
  const { toast } = useToast();
  const { showToast = true } = options;

  const handleApiError = useCallback(
    (error: unknown) => {
      const appError = APIErrorHandler.handleAPIError(error);

      if (showToast) {
        toast({
          title: options.title || "Error",
          description: appError.message,
          variant: "destructive",
        });
      }

      options.onError?.(appError);
      return appError;
    },
    [toast, options, showToast],
  );

  const handleValidationError = useCallback(
    (error: unknown) => {
      const appError = handleError(error);

      if (showToast) {
        toast({
          title: "Validation Error",
          description: appError.message,
          variant: "destructive",
        });
      }

      options.onError?.(appError);
      return appError;
    },
    [toast, options, showToast],
  );

  return {
    handleApiError,
    handleValidationError,
  };
}

import { useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryKey,
} from "@tanstack/react-query";
import { RefundService } from "@/services/billing/RefundService";
import {
  Refund,
  RefundCreate,
  RefundFilter,
} from "@/types/billing/RefundTypes";
import { useToast } from "@/components/ui/useToast";

const refundService = new RefundService();

export function useRefunds(filters?: RefundFilter) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [error, setError] = useState<Error | null>(null);

  const queryKey: QueryKey = ["refunds", filters];

  const {
    data: refunds,
    isLoading,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => refundService.listWithFilters(filters || {}),
    onSettled: (_data, error) => {
      if (error) {
        setError(error as Error);
        toast({
          title: "Error fetching refunds",
          description: (error as Error).message,
          variant: "destructive",
        });
      }
    },
  });

  const createRefundMutation = useMutation<Refund, Error, RefundCreate>({
    mutationFn: (data: RefundCreate) => refundService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({
        title: "Refund created",
        description: "The refund was processed successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error processing refund",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const cancelRefundMutation = useMutation<Refund, Error, string>({
    mutationFn: (id: string) => refundService.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({
        title: "Refund cancelled",
        description: "The refund was cancelled successfully.",
      });
    },
  });

  return {
    refunds,
    isLoading,
    error,
    refetch,
    createRefund: createRefundMutation.mutate,
    cancelRefund: cancelRefundMutation.mutate,
    isCreating: createRefundMutation.isPending,
    isCancelling: cancelRefundMutation.isPending,
  };
}

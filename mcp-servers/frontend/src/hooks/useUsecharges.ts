import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChargeService } from "@/services/billing/ChargeService";
import {
  Charge,
  ChargeCreate,
  ChargeFilter,
} from "@/types/billing/ChargeTypes";
import { useToast } from "@/components/ui/useToast";

const chargeService = new ChargeService();

export function useCharges(filters?: ChargeFilter) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [error, setError] = useState<Error | null>(null);

  const {
    data: charges,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["charges", filters],
    queryFn: () => chargeService.listWithFilters(filters || {}),
    onError: (error: Error) => {
      setError(error);
      toast({
        title: "Error fetching charges",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createChargeMutation = useMutation({
    mutationFn: (data: ChargeCreate) => chargeService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["charges"]);
      toast({
        title: "Charge created",
        description: "The charge was created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating charge",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const captureMutation = useMutation({
    mutationFn: ({ id, amount }: { id: string; amount?: number }) =>
      chargeService.capture(id, amount),
    onSuccess: () => {
      queryClient.invalidateQueries(["charges"]);
      toast({
        title: "Charge captured",
        description: "The charge was captured successfully.",
      });
    },
  });

  return {
    charges,
    isLoading,
    error,
    refetch,
    createCharge: createChargeMutation.mutate,
    captureCharge: captureMutation.mutate,
    isCreating: createChargeMutation.isLoading,
    isCapturing: captureMutation.isLoading,
  };
}

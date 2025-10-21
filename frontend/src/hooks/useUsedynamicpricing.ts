import { useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryKey,
} from "@tanstack/react-query";
import { DynamicPricingService } from "@/services/billing/DynamicPricingService";
import {
  DynamicPricingRule,
  DynamicPricingRuleCreate,
  DynamicPricingRuleUpdate,
  DynamicPricingFilter,
} from "@/types/billing/DynamicPricing.types";
import { useToast } from "@/components/ui/useToast";

const dynamicPricingService = new DynamicPricingService();

export function useDynamicPricing(filters?: DynamicPricingFilter) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [error, setError] = useState<Error | null>(null);

  const queryKey: QueryKey = ["dynamic-pricing-rules", filters];

  const {
    data: rules,
    isLoading,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => dynamicPricingService.listWithFilters(filters || {}),
    onSettled: (_data, error) => {
      if (error) {
        setError(error as Error);
        toast({
          title: "Error fetching pricing rules",
          description: (error as Error).message,
          variant: "destructive",
        });
      }
    },
  });

  const createMutation = useMutation<
    DynamicPricingRule,
    Error,
    DynamicPricingRuleCreate
  >({
    mutationFn: (data) => dynamicPricingService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({
        title: "Rule created",
        description: "Dynamic pricing rule created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating rule",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation<
    DynamicPricingRule,
    Error,
    DynamicPricingRuleUpdate
  >({
    mutationFn: ({ id, ...data }) => dynamicPricingService.updateRule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({
        title: "Rule updated",
        description: "Dynamic pricing rule updated successfully.",
      });
    },
  });

  const toggleMutation = useMutation<
    DynamicPricingRule,
    Error,
    { id: string; active: boolean }
  >({
    mutationFn: ({ id, active }) =>
      dynamicPricingService.toggleActive(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({
        title: "Rule status updated",
        description: "Rule status updated successfully.",
      });
    },
  });

  const simulateMutation = useMutation({
    mutationFn: ({ id, params }: { id: string; params: Record<string, any> }) =>
      dynamicPricingService.simulatePrice(id, params),
    onError: (error: Error) => {
      toast({
        title: "Simulation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    rules,
    isLoading,
    error,
    refetch,
    createRule: createMutation.mutate,
    updateRule: updateMutation.mutate,
    toggleRule: toggleMutation.mutate,
    simulatePrice: simulateMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isToggling: toggleMutation.isPending,
    isSimulating: simulateMutation.isPending,
  };
}

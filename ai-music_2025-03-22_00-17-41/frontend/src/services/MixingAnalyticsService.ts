import { api } from "@/lib/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { MixingAnalytics } from "@/types/analytics";

export const useMixingAnalytics = (sessionId?: string) => {
  return useQuery({
    queryKey: ["mixing-analytics", sessionId],
    queryFn: async () => {
      const response = await api.get("/api/analytics/mixing", {
        params: { sessionId },
      });
      return response.data as MixingAnalytics[];
    },
    enabled: !!sessionId,
  });
};

export const useCreateMixingAnalytics = () => {
  return useMutation({
    mutationFn: async (data: Partial<MixingAnalytics>) => {
      const response = await api.post("/api/analytics/mixing", data);
      return response.data as MixingAnalytics;
    },
  });
};

import { api } from "@/lib/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { PredictivePreference, PredictiveEvent } from "@/types/analytics";

export const usePredictivePreferences = (userId: string) => {
  return useQuery({
    queryKey: ["predictive-preferences", userId],
    queryFn: async () => {
      const response = await api.get("/api/predictivepreferencemodel", {
        params: { userId },
      });
      return response.data as PredictivePreference;
    },
  });
};

export const useTrackPredictiveEvent = () => {
  return useMutation({
    mutationFn: async (data: Partial<PredictiveEvent>) => {
      const response = await api.post("/api/predictivepreferenceevent", data);
      return response.data as PredictiveEvent;
    },
  });
};

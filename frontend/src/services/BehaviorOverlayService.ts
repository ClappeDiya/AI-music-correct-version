import { api } from "@/lib/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { BehaviorTriggeredOverlay } from "@/types/analytics";

export const useBehaviorOverlays = (userId: string) => {
  return useQuery({
    queryKey: ["behavior-overlays", userId],
    queryFn: async () => {
      const response = await api.get("/api/behaviortriggeredoverlay", {
        params: { userId },
      });
      return response.data as BehaviorTriggeredOverlay[];
    },
  });
};

export const useToggleOverlay = () => {
  return useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const response = await api.post(
        `/api/behaviortriggeredoverlay/${id}/toggle`,
        { active },
      );
      return response.data as BehaviorTriggeredOverlay;
    },
  });
};

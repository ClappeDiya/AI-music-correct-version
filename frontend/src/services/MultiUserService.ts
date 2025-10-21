import { api } from "@/lib/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { MultiUserComposite } from "@/types/analytics";

export const useMultiUserComposites = () => {
  return useQuery({
    queryKey: ["multi-user-composites"],
    queryFn: async () => {
      const response = await api.get("/api/multiusercomposite");
      return response.data as MultiUserComposite[];
    },
  });
};

export const useCreateMultiUserComposite = () => {
  return useMutation({
    mutationFn: async (data: Partial<MultiUserComposite>) => {
      const response = await api.post("/api/multiusercomposite", data);
      return response.data as MultiUserComposite;
    },
  });
};

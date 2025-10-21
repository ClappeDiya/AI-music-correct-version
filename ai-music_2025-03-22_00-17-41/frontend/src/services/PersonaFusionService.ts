import { api } from "@/lib/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { PersonaFusion } from "@/types/analytics";

export const usePersonaFusion = (userId: string) => {
  return useQuery({
    queryKey: ["persona-fusion", userId],
    queryFn: async () => {
      const response = await api.get("/api/personafusion", {
        params: { userId },
      });
      return response.data as PersonaFusion;
    },
    enabled: !!userId,
  });
};

export const useUpdatePersonaFusion = () => {
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<PersonaFusion>;
    }) => {
      const response = await api.patch(`/api/personafusion/${id}`, data);
      return response.data as PersonaFusion;
    },
  });
};

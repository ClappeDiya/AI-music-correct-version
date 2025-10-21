import { api } from "@/lib/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { GenreMixingSession } from "@/types/analytics";

export const useGenreMixingSession = (sessionId: string) => {
  return useQuery({
    queryKey: ["genre-mixing", sessionId],
    queryFn: async () => {
      const response = await api.get(`/api/genre_mixing/sessions/${sessionId}`);
      return response.data as GenreMixingSession;
    },
  });
};

export const useCreateGenreMixingSession = () => {
  return useMutation({
    mutationFn: async (data: Partial<GenreMixingSession>) => {
      const response = await api.post("/api/genre_mixing/sessions", data);
      return response.data as GenreMixingSession;
    },
  });
};

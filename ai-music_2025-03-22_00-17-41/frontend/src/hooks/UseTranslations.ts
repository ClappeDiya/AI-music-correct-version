import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Translation } from "@/types/translation";

export function useTranslations() {
  return useQuery<Translation[]>({
    queryKey: ["translations"],
    queryFn: async () => {
      const { data } = await api.get("/translations/");
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

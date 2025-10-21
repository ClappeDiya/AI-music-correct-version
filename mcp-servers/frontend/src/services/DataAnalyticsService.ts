import { api } from "@/lib/api";
import { useMutation, useQuery } from "@tanstack/react-query";

interface AnalyticsFilter {
  startDate?: string;
  endDate?: string;
  genre?: string;
  region?: string;
}

interface AnalyticsResponse {
  userBehavior: UserBehaviorMetrics;
  trackAnalytics: TrackAnalyticsMetrics;
  genreTrends: GenreTrendData[];
  geographicInsights: GeographicInsightData[];
}

export const useAnalyticsData = (filters: AnalyticsFilter) => {
  return useQuery({
    queryKey: ["analytics", filters],
    queryFn: async () => {
      const response = await api.get("/api/v1/track-analytics", {
        params: filters,
      });
      return response.data;
    },
  });
};

export const useGenreTrends = () => {
  return useQuery({
    queryKey: ["genre-trends"],
    queryFn: async () => {
      const response = await api.get("/api/v1/genre-trends");
      return response.data;
    },
  });
};

export const useGeographicInsights = () => {
  return useQuery({
    queryKey: ["geographic-insights"],
    queryFn: async () => {
      const response = await api.get("/api/v1/geographic-insights");
      return response.data;
    },
  });
};

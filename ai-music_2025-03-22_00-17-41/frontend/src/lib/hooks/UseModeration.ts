import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { moderationApi } from "@/lib/api/services";
import type {
  ModerationAction,
  ModerationDashboardStats,
} from "@/lib/api/types";

export function useModeration() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    type: "",
  });

  const { data: queue, isLoading: isQueueLoading } = useQuery(
    ["moderation-queue", filters],
    () => moderationApi.getModerationQueue(filters),
  );

  const { data: stats, isLoading: isStatsLoading } = useQuery(
    ["moderation-stats"],
    () => moderationApi.getDashboardStats(),
  );

  const { mutate: assignModerator } = useMutation(
    ({ caseId, moderatorId }: { caseId: string; moderatorId: string }) =>
      moderationApi.assignModerator(caseId, moderatorId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["moderation-queue"]);
      },
    },
  );

  const { mutate: takeAction } = useMutation(
    ({ caseId, action }: { caseId: string; action: ModerationAction }) =>
      moderationApi.takeAction(caseId, action),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["moderation-queue"]);
        queryClient.invalidateQueries(["moderation-stats"]);
      },
    },
  );

  const { data: flaggedTracks, isLoading: isFlaggedLoading } = useQuery(
    ["flagged-tracks"],
    () => moderationApi.getFlaggedTracks(),
  );

  const updateFilters = useCallback((newFilters: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  return {
    queue,
    stats,
    flaggedTracks,
    isQueueLoading,
    isStatsLoading,
    isFlaggedLoading,
    filters,
    updateFilters,
    assignModerator,
    takeAction,
  };
}

export function useModerationAnalytics() {
  const { data: stats } = useQuery(["moderation-stats"], () =>
    moderationApi.getDashboardStats(),
  );

  const calculateTrends = useCallback((data: ModerationDashboardStats) => {
    const trends = {
      resolutionRate:
        (data.overview.resolved_cases / data.overview.total_cases) * 100,
      averageResolutionTime: data.overview.average_resolution_time,
      commonViolations: data.trends.common_violations
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      moderatorPerformance: data.moderator_performance.sort(
        (a, b) => b.cases_handled - a.cases_handled,
      ),
    };

    return trends;
  }, []);

  return {
    stats,
    calculateTrends: stats ? calculateTrends(stats) : null,
  };
}

export function useModerationNotifications() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    unread_only: true,
    type: "",
  });

  const { data: notifications, isLoading } = useQuery(
    ["moderation-notifications", filters],
    () => moderationApi.getNotifications(filters),
  );

  const { mutate: markAsRead } = useMutation(
    (notificationId: string) =>
      moderationApi.markNotificationRead(notificationId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["moderation-notifications"]);
      },
    },
  );

  const updateFilters = useCallback((newFilters: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  return {
    notifications,
    isLoading,
    markAsRead,
    filters,
    updateFilters,
  };
}

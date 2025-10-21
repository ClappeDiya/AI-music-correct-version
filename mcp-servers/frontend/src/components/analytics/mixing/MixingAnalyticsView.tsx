"use client";

import { useMixingAnalytics } from "@/services/mixing-analytics.service";
import { AnalyticsChart } from "@/components/analytics/AnalyticsChart";
import { MetricCard } from "@/components/analytics/MetricCard";

interface MixingAnalyticsViewProps {
  sessionId?: string;
}

export function MixingAnalyticsView({ sessionId }: MixingAnalyticsViewProps) {
  const { data, isLoading } = useMixingAnalytics(sessionId);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Total Mixes"
          value={data?.length || 0}
          isLoading={isLoading}
        />
        <MetricCard
          title="Average Duration"
          value={
            data?.reduce((acc, curr) => acc + curr.duration, 0) /
            (data?.length || 1)
          }
          format={(v) => `${Math.round(v)}s`}
          isLoading={isLoading}
        />
        <MetricCard
          title="Completion Rate"
          value={
            (data?.filter((d) => d.eventType === "mix_completed").length /
              (data?.length || 1)) *
            100
          }
          format={(v) => `${v.toFixed(1)}%`}
          isLoading={isLoading}
        />
      </div>

      <AnalyticsChart
        type="line"
        title="Mixing Activity Over Time"
        data={data || []}
        xAxis="createdAt"
        yAxis="duration"
      />
    </div>
  );
}

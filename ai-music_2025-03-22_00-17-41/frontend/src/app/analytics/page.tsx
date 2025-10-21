"use client";

import { useState } from "react";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import { Select } from "@/components/ui/Select";
import { AnalyticsChart } from "@/components/analytics/AnalyticsChart";
import { MetricCard } from "@/components/analytics/MetricCard";
import {
  useAnalyticsData,
  useGenreTrends,
  useGeographicInsights,
} from "@/services/DataAnalyticsService";
import { AnalyticsColumns } from "./components/AnalyticsColumns";
import { DateRange } from "react-day-picker";

export default function AnalyticsDashboardPage() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date(),
  });

  const handleDateRangeChange = (newRange: DateRange | undefined) => {
    if (newRange) {
      setDateRange(newRange);
    }
  };

  const { data: analyticsData, isLoading: isLoadingAnalytics } =
    useAnalyticsData({
      startDate: dateRange.from?.toISOString(),
      endDate: dateRange.to?.toISOString(),
    });

  const { data: genreTrends } = useGenreTrends();
  const { data: geoInsights } = useGeographicInsights();

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <DateRangePicker date={dateRange} onDateChange={handleDateRangeChange} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          title="Total Plays"
          value={analyticsData?.userBehavior.totalPlays ?? 0}
          isLoading={isLoadingAnalytics}
        />
        <MetricCard
          title="Active Users"
          value={analyticsData?.userBehavior.activeUsers ?? 0}
          isLoading={isLoadingAnalytics}
        />
        <MetricCard
          title="Average Session Duration"
          value={analyticsData?.userBehavior.avgSessionDuration ?? 0}
          format={(v) => `${Math.round(v / 60)} min`}
          isLoading={isLoadingAnalytics}
        />
        <MetricCard
          title="Engagement Rate"
          value={analyticsData?.userBehavior.engagementRate ?? 0}
          format={(v) => `${v.toFixed(1)}%`}
          isLoading={isLoadingAnalytics}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <AnalyticsChart
          type="line"
          title="User Activity Over Time"
          data={analyticsData?.userBehavior.timeline ?? []}
          xAxis="date"
          yAxis="users"
        />
        <AnalyticsChart
          type="bar"
          title="Popular Genres"
          data={genreTrends ?? []}
          xAxis="genre"
          yAxis="count"
        />
        <AnalyticsChart
          type="pie"
          title="Geographic Distribution"
          data={geoInsights ?? []}
          xAxis="region"
          yAxis="users"
        />
      </div>
    </div>
  );
}

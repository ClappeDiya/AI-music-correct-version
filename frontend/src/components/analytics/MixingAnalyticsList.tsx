"use client";

import { useState } from "react";
import { useAnalyticsData } from "@/hooks/useAnalyticsData";
import { PaginatedList } from "@/components/common/PaginatedList";
import { MixingAnalytics } from "@/types/analytics";

export function MixingAnalyticsList() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useAnalyticsData<MixingAnalytics>(
    "/api/v1/mixing-analytics",
    page,
    50,
    "mixing-analytics",
  );

  const renderItem = (item: MixingAnalytics) => (
    <div key={item.id} className="p-4 border rounded-lg">
      <h3 className="font-medium">{item.session_id}</h3>
      <p className="text-sm text-muted-foreground">
        {item.event_type} - {new Date(item.created_at).toLocaleDateString()}
      </p>
    </div>
  );

  return (
    <PaginatedList
      data={data?.data || []}
      isLoading={isLoading}
      error={error}
      onPageChange={setPage}
      renderItem={renderItem}
      currentPage={data?.currentPage || 1}
      totalPages={data?.totalPages || 1}
      pageSize={50}
    />
  );
}

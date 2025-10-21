import { useState, useEffect } from "react";
import { RealTimeAnalytics } from "@/lib/api/types";
import { trackAnalyticsApi } from "@/lib/api/services";

export function useRealTimeAnalytics() {
  const [data, setData] = useState<RealTimeAnalytics | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Initial fetch
    trackAnalyticsApi.getRealTimeAnalytics().then(setData).catch(setError);

    // Subscribe to real-time updates
    const subscription = trackAnalyticsApi.subscribeToRealTimeUpdates(
      (update) => {
        setData((prevData) => ({
          ...prevData,
          ...update,
          timestamp: new Date().toISOString(),
        }));
      },
    );

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { data, error };
}

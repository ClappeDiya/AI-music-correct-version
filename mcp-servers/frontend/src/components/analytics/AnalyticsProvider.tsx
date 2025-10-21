"use client";

import { createContext, useContext, useEffect, ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";

interface AnalyticsContextType {
  trackEvent: (eventName: string, properties?: Record<string, any>) => void;
  trackError: (error: Error, context?: Record<string, any>) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType>({
  trackEvent: () => {},
  trackError: () => {},
});

interface AnalyticsProviderProps {
  children: ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Track page views
    trackEvent("page_view", {
      path: pathname,
      search: searchParams?.toString(),
    });
  }, [pathname, searchParams]);

  const trackEvent = async (
    eventName: string,
    properties?: Record<string, any>,
  ) => {
    try {
      await fetch("/api/analytics/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event: eventName,
          properties: {
            ...properties,
            timestamp: new Date().toISOString(),
            path: pathname,
          },
        }),
      });
    } catch (error) {
      console.error("Failed to track event:", error);
    }
  };

  const trackError = async (error: Error, context?: Record<string, any>) => {
    try {
      await fetch("/api/analytics/errors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          error: {
            name: error.name,
            message: error.message,
            stack: error.stack,
          },
          context: {
            ...context,
            timestamp: new Date().toISOString(),
            path: pathname,
          },
        }),
      });
    } catch (err) {
      console.error("Failed to track error:", err);
    }
  };

  return (
    <AnalyticsContext.Provider value={{ trackEvent, trackError }}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export const useAnalytics = () => useContext(AnalyticsContext);

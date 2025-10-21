'use client';

import { useEffect, useRef } from 'react';
import { useAnalytics } from ./analytics-provider';

interface PerformanceMetrics {
  fcp: number | null;
  lcp: number | null;
  fid: number | null;
  cls: number | null;
  ttfb: number | null;
}

export function PerformanceMonitor() {
  const { trackEvent } = useAnalytics();
  const metricsRef = useRef<PerformanceMetrics>({
    fcp: null,
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null,
  });

  useEffect(() => {
    // Only run in production
    if (process.env.NODE_ENV !== 'production') return;

    try {
      // First Contentful Paint
      const paintObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            metricsRef.current.fcp = entry.startTime;
            trackEvent('performance_metric', {
              metric: 'first_contentful_paint',
              value: entry.startTime,
            });
          }
        }
      });
      paintObserver.observe({ entryTypes: ['paint'] });

      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        metricsRef.current.lcp = lastEntry.startTime;
        trackEvent('performance_metric', {
          metric: 'largest_contentful_paint',
          value: lastEntry.startTime,
        });
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay
      const fidObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          metricsRef.current.fid = entry.processingStart - entry.startTime;
          trackEvent('performance_metric', {
            metric: 'first_input_delay',
            value: entry.processingStart - entry.startTime,
          });
        }
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((entryList) => {
        let clsValue = 0;
        for (const entry of entryList.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        metricsRef.current.cls = clsValue;
        trackEvent('performance_metric', {
          metric: 'cumulative_layout_shift',
          value: clsValue,
        });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

      // Time to First Byte
      const navigationEntries = performance.getEntriesByType('navigation');
      if (navigationEntries.length > 0) {
        const navigationEntry = navigationEntries[0] as PerformanceNavigationTiming;
        metricsRef.current.ttfb = navigationEntry.responseStart;
        trackEvent('performance_metric', {
          metric: 'time_to_first_byte',
          value: navigationEntry.responseStart,
        });
      }

      // Cleanup
      return () => {
        paintObserver.disconnect();
        lcpObserver.disconnect();
        fidObserver.disconnect();
        clsObserver.disconnect();
      };
    } catch (error) {
      console.error('Failed to initialize performance monitoring:', error);
    }
  }, [trackEvent]);

  // This component doesn't render anything
  return null;
}



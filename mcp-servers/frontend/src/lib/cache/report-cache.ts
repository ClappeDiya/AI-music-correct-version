import { QueryClient } from "@tanstack/react-query";

// Cache configuration for different report types
const CACHE_CONFIG = {
  userMetrics: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  },
  revenueMetrics: {
    staleTime: 15 * 60 * 1000, // 15 minutes
    cacheTime: 60 * 60 * 1000, // 1 hour
  },
  contentMetrics: {
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 45 * 60 * 1000, // 45 minutes
  },
  systemHealth: {
    staleTime: 1 * 60 * 1000, // 1 minute
    cacheTime: 5 * 60 * 1000, // 5 minutes
  },
} as const;

// Initialize React Query client with optimized settings
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 2,
      },
    },
  });
}

// Prefetch critical data
export async function prefetchCriticalData(queryClient: QueryClient) {
  const promises = [
    queryClient.prefetchQuery({
      queryKey: ["user-metrics"],
      queryFn: () => fetch("/api/reports/metrics/users").then((r) => r.json()),
      staleTime: CACHE_CONFIG.userMetrics.staleTime,
    }),
    queryClient.prefetchQuery({
      queryKey: ["system-health"],
      queryFn: () => fetch("/api/reports/metrics/health").then((r) => r.json()),
      staleTime: CACHE_CONFIG.systemHealth.staleTime,
    }),
  ];

  await Promise.all(promises);
}

interface CacheItem<T> {
  value: T;
  timestamp: number;
  expiresAt: number;
}

class ReportCache {
  private cache: Map<string, CacheItem<any>> = new Map();

  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    // Check if expired
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds: number = 300): Promise<void> {
    const timestamp = Date.now();
    const expiresAt = timestamp + ttlSeconds * 1000;

    this.cache.set(key, {
      value,
      timestamp,
      expiresAt,
    });

    // Schedule cleanup
    setTimeout(() => {
      this.cache.delete(key);
    }, ttlSeconds * 1000);
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }

  async has(key: string): Promise<boolean> {
    const item = this.cache.get(key);
    if (!item) {
      return false;
    }

    // Check if expired
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  async keys(): Promise<string[]> {
    return Array.from(this.cache.keys());
  }

  async cleanup(): Promise<void> {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

export const reportCache = new ReportCache();

// Type-safe cache key generator
export function createCacheKey<T extends keyof typeof CACHE_CONFIG>(
  type: T,
  params?: Record<string, any>,
) {
  const baseKey = [type];
  return params ? [...baseKey, params] : baseKey;
}

// Optimistic updates helper
export function updateCache<T>(
  queryClient: QueryClient,
  type: keyof typeof CACHE_CONFIG,
  updater: (old: T | undefined) => T,
) {
  const key = createCacheKey(type);
  queryClient.setQueryData(key, updater);
}

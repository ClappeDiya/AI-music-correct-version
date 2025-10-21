import { useState, useEffect, useCallback, useRef } from "react";

interface CacheItem<T> {
  data: T;
  timestamp: number;
  nextCursor?: string | number;
  hasMore?: boolean;
}

interface CacheOptions<T> {
  duration?: number;
  enabled?: boolean;
  pageSize?: number;
  getNextPageParam?: (
    lastPage: T,
    allPages: T[],
  ) => string | number | undefined;
  onError?: (error: Error) => void;
}

const cache = new Map<string, CacheItem<any>>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useCache<T>(
  key: string,
  fetchFn: (cursor?: string | number, pageSize?: number) => Promise<T>,
  options: CacheOptions<T> = {},
) {
  const {
    duration = CACHE_DURATION,
    enabled = true,
    pageSize,
    getNextPageParam,
    onError,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);

  const pagesRef = useRef<T[]>([]);
  const cursorRef = useRef<string | number | undefined>(undefined);

  const fetchData = useCallback(
    async (cursor?: string | number) => {
      try {
        const cachedItem = cache.get(key);
        const now = Date.now();

        // If we have cached data and it's not expired, use it
        if (!cursor && cachedItem && now - cachedItem.timestamp < duration) {
          setData(cachedItem.data);
          cursorRef.current = cachedItem.nextCursor;
          setHasNextPage(!!cachedItem.hasMore);
          setIsLoading(false);
          return;
        }

        // Fetch new data
        const freshData = await fetchFn(cursor, pageSize);

        if (cursor) {
          // Append new data for pagination
          const newData = Array.isArray(data)
            ? [...(data as any[]), ...(freshData as any[])]
            : freshData;
          setData(newData);
          pagesRef.current = [...pagesRef.current, freshData];
        } else {
          // Set initial data
          setData(freshData);
          pagesRef.current = [freshData];
        }

        // Update cursor and hasMore if pagination is enabled
        if (getNextPageParam) {
          const nextCursor = getNextPageParam(freshData, pagesRef.current);
          cursorRef.current = nextCursor;
          setHasNextPage(!!nextCursor);

          // Cache with pagination info
          cache.set(key, {
            data: cursor ? (data as any) : freshData,
            timestamp: now,
            nextCursor,
            hasMore: !!nextCursor,
          });
        } else {
          // Cache without pagination
          cache.set(key, {
            data: freshData,
            timestamp: now,
          });
        }
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("An error occurred");
        setError(error);
        onError?.(error);
      } finally {
        setIsLoading(false);
        setIsFetchingNextPage(false);
      }
    },
    [key, fetchFn, duration, pageSize, getNextPageParam, data, onError],
  );

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    fetchData();
  }, [enabled, fetchData]);

  const fetchNextPage = useCallback(async () => {
    if (!cursorRef.current || !hasNextPage || isFetchingNextPage) return;

    setIsFetchingNextPage(true);
    await fetchData(cursorRef.current);
  }, [hasNextPage, isFetchingNextPage, fetchData]);

  const invalidate = useCallback(() => {
    cache.delete(key);
    setData(null);
    setIsLoading(true);
    fetchData();
  }, [key, fetchData]);

  const update = useCallback(
    (newData: T, optimistic = true) => {
      const now = Date.now();
      if (optimistic) {
        setData(newData);
      }
      cache.set(key, {
        data: newData,
        timestamp: now,
        nextCursor: cursorRef.current,
        hasMore: hasNextPage,
      });
    },
    [key, hasNextPage],
  );

  return {
    data,
    isLoading,
    error,
    invalidate,
    update,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  };
}

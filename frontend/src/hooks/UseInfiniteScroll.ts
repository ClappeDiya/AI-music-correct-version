"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useIntersectionObserver } from "./use-intersection-observer";

interface UseInfiniteScrollOptions<T> {
  fetchUrl: string;
  pageSize?: number;
  initialData?: T[];
  enabled?: boolean;
  onError?: (error: Error) => void;
}

export function useInfiniteScroll<T>({
  fetchUrl,
  pageSize = 10,
  initialData = [],
  enabled = true,
  onError,
}: UseInfiniteScrollOptions<T>) {
  const [data, setData] = useState<T[]>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const pageRef = useRef(1);
  const loadingRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    if (!enabled || isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `${fetchUrl}?page=${pageRef.current}&page_size=${pageSize}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const newData = await response.json();

      if (Array.isArray(newData.results)) {
        setData((prev) => [...prev, ...newData.results]);
        setHasMore(newData.results.length === pageSize);
        pageRef.current += 1;
      } else {
        setHasMore(false);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error("An error occurred");
      setError(error);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchUrl, pageSize, enabled, isLoading, hasMore, onError]);

  const { ref: intersectionRef } = useIntersectionObserver<HTMLDivElement>({
    onIntersect: fetchData,
    enabled: enabled && hasMore && !isLoading,
    rootMargin: "200px",
  });

  useEffect(() => {
    if (loadingRef.current) {
      intersectionRef(loadingRef.current);
    }
  }, [intersectionRef]);

  const refresh = useCallback(() => {
    setData([]);
    setHasMore(true);
    pageRef.current = 1;
    setError(null);
  }, []);

  return {
    data,
    isLoading,
    hasMore,
    error,
    loadingRef,
    refresh,
  };
}

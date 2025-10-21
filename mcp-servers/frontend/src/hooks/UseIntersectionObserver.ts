"use client";

import { useCallback, useRef } from "react";

interface UseIntersectionObserverProps {
  onIntersect: () => void;
  enabled?: boolean;
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
}

export function useIntersectionObserver<T extends Element>({
  onIntersect,
  enabled = true,
  root = null,
  rootMargin = "0px",
  threshold = 0,
}: UseIntersectionObserverProps) {
  const observer = useRef<IntersectionObserver | null>(null);

  const ref = useCallback(
    (element: T | null) => {
      if (observer.current) {
        observer.current.disconnect();
        observer.current = null;
      }

      if (!enabled || !element) return;

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            onIntersect();
          }
        },
        {
          root,
          rootMargin,
          threshold,
        },
      );

      observer.current.observe(element);
    },
    [enabled, root, rootMargin, threshold, onIntersect],
  );

  return { ref };
}

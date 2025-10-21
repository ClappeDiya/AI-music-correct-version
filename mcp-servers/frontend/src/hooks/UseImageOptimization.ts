"use client";

import { useState, useEffect } from "react";

interface UseImageOptimizationOptions {
  src: string;
  width?: number;
  height?: number;
  quality?: number;
  format?: "webp" | "jpeg" | "png";
}

export function useImageOptimization({
  src,
  width,
  height,
  quality = 75,
  format = "webp",
}: UseImageOptimizationOptions) {
  const [optimizedSrc, setOptimizedSrc] = useState<string>(src);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const optimizeImage = async () => {
      if (!src) return;

      try {
        // Check if the image is already served from a CDN or optimization service
        if (src.includes("imagecdn") || src.includes("optimized")) {
          setOptimizedSrc(src);
          return;
        }

        // Construct the optimization API URL
        const params = new URLSearchParams({
          url: src,
          ...(width && { w: width.toString() }),
          ...(height && { h: height.toString() }),
          q: quality.toString(),
          fmt: format,
        });

        const response = await fetch(
          `/api/optimize-image?${params.toString()}`,
        );

        if (!response.ok) {
          throw new Error("Failed to optimize image");
        }

        const data = await response.json();
        setOptimizedSrc(data.url);
      } catch (err) {
        console.error("Image optimization failed:", err);
        setError(
          err instanceof Error ? err : new Error("Failed to optimize image"),
        );
        // Fallback to original source
        setOptimizedSrc(src);
      } finally {
        setIsLoading(false);
      }
    };

    optimizeImage();
  }, [src, width, height, quality, format]);

  return {
    src: optimizedSrc,
    isLoading,
    error,
    // Generate srcSet for responsive images
    srcSet: width
      ? [0.5, 1, 2]
          .map((scale) => {
            const w = Math.round(width * scale);
            return `${optimizedSrc}?w=${w} ${w}w`;
          })
          .join(", ")
      : undefined,
  };
}

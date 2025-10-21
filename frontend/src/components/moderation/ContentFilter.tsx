"use client";

import { useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/usetoast";

interface ContentFilterProps {
  content: string;
  onFilterResult: (result: FilterResult) => void;
}

interface FilterResult {
  isInappropriate: boolean;
  toxicityScore: number;
  categories: string[];
}

// List of inappropriate words and patterns
const INAPPROPRIATE_PATTERNS = [
  /\b(hate|violent|explicit)\b/i,
  // Add more patterns as needed
];

export function ContentFilter({ content, onFilterResult }: ContentFilterProps) {
  const { toast } = useToast();

  const analyzeContent = useCallback(async () => {
    try {
      // First, check against local patterns
      const localCheck = INAPPROPRIATE_PATTERNS.some((pattern) =>
        pattern.test(content),
      );

      // Then, call the content moderation API
      const response = await fetch("/api/moderation/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) throw new Error("Failed to analyze content");

      const data = await response.json();

      const result: FilterResult = {
        isInappropriate: localCheck || data.isInappropriate,
        toxicityScore: data.toxicityScore,
        categories: data.categories,
      };

      onFilterResult(result);

      if (result.isInappropriate) {
        toast({
          title: "Content Warning",
          description: "This content may be inappropriate.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Content analysis failed:", error);
      // Fallback to local check only
      const result: FilterResult = {
        isInappropriate: INAPPROPRIATE_PATTERNS.some((pattern) =>
          pattern.test(content),
        ),
        toxicityScore: 0,
        categories: [],
      };
      onFilterResult(result);
    }
  }, [content, onFilterResult, toast]);

  useEffect(() => {
    if (content) {
      analyzeContent();
    }
  }, [content, analyzeContent]);

  return null; // This is a utility component with no UI
}

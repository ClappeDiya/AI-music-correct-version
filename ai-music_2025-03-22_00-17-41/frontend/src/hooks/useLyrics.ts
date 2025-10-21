import { useState, useCallback } from "react";
import { traditionApi } from "@/lib/api/tradition-api";
import { MultilingualLyrics } from "@/lib/api/types";

export function useLyrics() {
  const [currentLyrics, setCurrentLyrics] = useState<MultilingualLyrics | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createLyrics = useCallback(
    async (
      trackId: string,
      primaryLanguage: string,
      translationLanguages: string[],
      originalLyrics?: string,
    ) => {
      try {
        setLoading(true);
        const lyrics = await traditionApi.createLyrics({
          track: trackId,
          primary_language: primaryLanguage,
          translation_languages: translationLanguages,
          original_lyrics: originalLyrics,
        });
        setCurrentLyrics(lyrics);
        setError(null);
        return lyrics;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to create lyrics";
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const regenerateTranslations = useCallback(async () => {
    if (!currentLyrics) {
      throw new Error("No active lyrics");
    }

    try {
      setLoading(true);
      const lyrics = await traditionApi.regenerateTranslations(
        currentLyrics.id,
      );
      setCurrentLyrics(lyrics);
      setError(null);
      return lyrics;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to regenerate translations";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, [currentLyrics]);

  return {
    currentLyrics,
    loading,
    error,
    createLyrics,
    regenerateTranslations,
  };
}

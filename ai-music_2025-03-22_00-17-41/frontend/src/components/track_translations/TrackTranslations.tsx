"use client";

import React, { useState, useEffect } from "react";
import {
  trackTranslationService,
  TrackTranslation,
  TrackLyrics,
} from "@/services/trackTranslationService";
import { useLanguageStore } from "@/stores/languageStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/useToast";
import { Globe2, Music2, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrackTranslationsProps {
  trackId: number;
  className?: string;
}

export function TrackTranslations({
  trackId,
  className,
}: TrackTranslationsProps) {
  const { currentLanguage } = useLanguageStore();
  const { toast } = useToast();
  const [translation, setTranslation] = useState<TrackTranslation | null>(null);
  const [lyrics, setLyrics] = useState<TrackLyrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTranslations = async () => {
      try {
        setLoading(true);
        const [translationData, lyricsData] = await Promise.all([
          trackTranslationService.getTrackWithTranslation(
            trackId,
            currentLanguage,
          ),
          trackTranslationService.getTrackLyrics(trackId, currentLanguage),
        ]);

        setTranslation(translationData.translated_metadata);
        setLyrics(lyricsData);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load translations. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };

    if (trackId && currentLanguage) {
      loadTranslations();
    }
  }, [trackId, currentLanguage, toast]);

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe2 className="h-5 w-5" />
            Loading Translations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      {translation && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music2 className="h-5 w-5" />
            {translation.title}
          </CardTitle>
          <div className="space-y-1">
            {translation.artist && (
              <p className="text-sm text-muted-foreground">
                {translation.artist}
              </p>
            )}
            {translation.album && (
              <p className="text-xs text-muted-foreground">
                {translation.album}
              </p>
            )}
            {translation.description && (
              <p className="mt-2 text-sm">{translation.description}</p>
            )}
          </div>
        </CardHeader>
      )}

      {lyrics && (
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h4 className="font-medium">Lyrics</h4>
              {lyrics.verified && (
                <Badge variant="secondary" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Verified
                </Badge>
              )}
            </div>

            <ScrollArea className="h-[300px] rounded-md border p-4">
              {lyrics.lyrics_with_timestamps ? (
                <div className="space-y-2">
                  {lyrics.lyrics_with_timestamps.map((line, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                        <Clock className="h-3 w-3" />
                        {formatTime(line.start_time)}
                      </span>
                      <span className="flex-1">{line.text}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <pre className="text-sm whitespace-pre-wrap font-sans">
                  {lyrics.lyrics_text}
                </pre>
              )}
            </ScrollArea>

            {lyrics.translation_source && (
              <p className="text-xs text-muted-foreground italic">
                Source: {lyrics.translation_source}
              </p>
            )}
          </div>
        </CardContent>
      )}

      {!translation && !lyrics && (
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <Globe2 className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>No translations available in {currentLanguage}</p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

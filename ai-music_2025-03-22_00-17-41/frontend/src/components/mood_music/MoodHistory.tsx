"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { Button } from "@/components/ui/Button";
import { Clock, ChevronDown } from "lucide-react";
import { formatDistance } from "date-fns";
import { MoodService, type GeneratedTrack } from "@/lib/api/services/mood";
import { MoodPreview } from "./MoodPreview";
import { EmotionalCurve } from "./EmotionalCurve";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/Collapsible";

export function MoodHistory() {
  const [tracks, setTracks] = useState<GeneratedTrack[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string>();
  const [expandedTrackId, setExpandedTrackId] = useState<string>();
  const [versions, setVersions] = useState<Record<string, GeneratedTrack[]>>(
    {},
  );
  const [loading, setLoading] = useState(false);

  // Define interface for API response type
  interface MoodHistoryResponse {
    tracks: GeneratedTrack[];
    has_more: boolean;
    next_cursor?: string;
  }

  const loadHistory = async (cursor?: string) => {
    try {
      setLoading(true);
      const response = await MoodService.getMoodHistory(cursor);
      const data = response.data as MoodHistoryResponse;
      
      if (cursor) {
        setTracks((prev) => [...prev, ...data.tracks]);
      } else {
        setTracks(data.tracks);
      }
      setHasMore(data.has_more);
      setNextCursor(data.next_cursor);
    } catch (error) {
      console.error("Failed to load history:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadTrackVersions = async (trackId: string) => {
    if (versions[trackId]) return;

    try {
      const response = await MoodService.getTrackVersions(trackId);
      const data = response.data as GeneratedTrack[];
      
      setVersions((prev) => ({
        ...prev,
        [trackId]: data,
      }));
    } catch (error) {
      console.error("Failed to load track versions:", error);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleTrackExpand = async (trackId: string) => {
    setExpandedTrackId(expandedTrackId === trackId ? undefined : trackId);
    if (trackId) {
      loadTrackVersions(trackId);
    }
  };

  const handleLoadMore = () => {
    if (hasMore && nextCursor) {
      loadHistory(nextCursor);
    }
  };

  return (
    <ScrollArea className="h-[600px] pr-4">
      <div className="space-y-4">
        {tracks.map((track) => (
          <Card key={track.id} className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>
                    {formatDistance(new Date(track.created_at), new Date(), { addSuffix: true })}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleTrackExpand(track.id)}
                >
                  <ChevronDown
                    className={`h-4 w-4 transform transition-transform ${expandedTrackId === track.id ? "rotate-180" : ""}`}
                  />
                </Button>
              </div>

              <MoodPreview
                mode="track"
                trackUrl={track.file_url}
                trackId={track.id}
                compact
              />

              <Collapsible open={expandedTrackId === track.id}>
                <CollapsibleContent className="space-y-4 pt-4">
                  <EmotionalCurve metadata={track.metadata} />

                  {versions[track.id]?.length > 1 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Previous Versions</h4>
                      {versions[track.id]
                        .filter((v) => v.id !== track.id)
                        .map((version) => (
                          <Card key={version.id} className="p-2">
                            <MoodPreview
                              mode="track"
                              trackUrl={version.file_url}
                              trackId={version.id}
                              compact
                              minimal
                            />
                          </Card>
                        ))}
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
            </div>
          </Card>
        ))}

        {hasMore && (
          <Button
            variant="outline"
            className="w-full"
            onClick={handleLoadMore}
            disabled={loading}
          >
            Load More
          </Button>
        )}
      </div>
    </ScrollArea>
  );
}

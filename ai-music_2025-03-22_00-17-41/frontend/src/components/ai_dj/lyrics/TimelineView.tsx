import { useState } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Edit2,
  Trash2,
  Music2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/Slider";
import { useToast } from "@/components/ui/useToast";
import { useLyrics } from "@/hooks/uselyrics";
import { TrackSync } from "./track-sync";
import { TimelineEditor } from "./timeline-editor";
import { PreviewPlayer } from "./preview-player";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import type { LyricTimeline } from "@/types/LyricsGeneration";

export function TimelineView() {
  const { timeline, finalLyrics, loading, refresh } = useLyrics();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"timeline" | "sync" | "preview">(
    "timeline",
  );

  if (loading) {
    return (
      <Card className="p-6">
        <p>Loading timeline...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs
        value={activeTab}
        onValueChange={(value: "timeline" | "sync" | "preview") =>
          setActiveTab(value)
        }
      >
        <TabsList>
          <TabsTrigger value="timeline">Timeline Editor</TabsTrigger>
          <TabsTrigger value="sync">Track Sync</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline">
          <TimelineEditor
            timeline={timeline}
            trackDuration={finalLyrics?.track?.duration_seconds}
            onTimelineUpdate={refresh}
          />
        </TabsContent>

        <TabsContent value="sync">
          {finalLyrics ? (
            <TrackSync
              finalLyrics={finalLyrics}
              timeline={timeline}
              onTimelineUpdate={refresh}
            />
          ) : (
            <Card className="p-6">
              <div className="text-center text-muted-foreground">
                <Music2 className="h-12 w-12 mx-auto mb-4" />
                <p>
                  No final lyrics found. Finalize your lyrics first to sync with
                  a track.
                </p>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="preview">
          {finalLyrics?.track ? (
            <PreviewPlayer
              track={finalLyrics.track}
              timeline={timeline}
              onTimelineUpdate={refresh}
            />
          ) : (
            <Card className="p-6">
              <div className="text-center text-muted-foreground">
                <Music2 className="h-12 w-12 mx-auto mb-4" />
                <p>
                  No track associated. Use the Track Sync tab to associate a
                  track first.
                </p>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

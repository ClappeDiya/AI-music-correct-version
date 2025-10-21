import { useState, useEffect, useRef } from "react";
import {
  Music2,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Plus,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/Slider";
import { useToast } from "@/components/ui/useToast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import { TrackList } from "@/components/ai-dj/track-list";
import { Badge } from "@/components/ui/Badge";
import { lyricTimelineApi } from "@/services/lyrics-generation-api";
import { aiDjApi } from "@/services/ai_dj-api";
import type { Track } from "@/types/ai_dj";
import type { LyricTimeline, FinalLyrics } from "@/types/lyrics-generation";

interface TrackSyncProps {
  finalLyrics: FinalLyrics;
  timeline: LyricTimeline[];
  onTimelineUpdate: () => void;
}

export function TrackSync({
  finalLyrics,
  timeline,
  onTimelineUpdate,
}: TrackSyncProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTrackSelect, setShowTrackSelect] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadTracks();
  }, []);

  useEffect(() => {
    if (finalLyrics.track_id) {
      loadSelectedTrack();
    }
  }, [finalLyrics.track_id]);

  const loadTracks = async () => {
    try {
      const response = await aiDjApi.getTracks();
      setTracks(response);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load tracks",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadSelectedTrack = async () => {
    if (!finalLyrics.track_id) return;
    try {
      const track = await aiDjApi.getTrack(finalLyrics.track_id);
      setSelectedTrack(track);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load selected track",
        variant: "destructive",
      });
    }
  };

  const handleTrackSelect = async (track: Track) => {
    setSelectedTrack(track);
    setShowTrackSelect(false);
    try {
      await lyricTimelineApi.updateFinalLyrics(finalLyrics.id, {
        track_id: track.id,
      });
      toast({
        title: "Success",
        description: "Track associated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to associate track",
        variant: "destructive",
      });
    }
  };

  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
  };

  const getCurrentSegments = () => {
    return timeline.filter(
      (segment) =>
        currentTime >= segment.start_time_seconds &&
        currentTime <=
          (segment.end_time_seconds || segment.start_time_seconds + 5),
    );
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Music2 className="h-5 w-5" />
            <h3 className="font-medium">Track Synchronization</h3>
          </div>
          <Dialog open={showTrackSelect} onOpenChange={setShowTrackSelect}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                {selectedTrack ? "Change Track" : "Select Track"}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Select Track</DialogTitle>
              </DialogHeader>
              <ScrollArea className="h-[400px]">
                <TrackList tracks={tracks} onPlay={handleTrackSelect} />
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>

        {selectedTrack ? (
          <>
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleSeek(Math.max(0, currentTime - 5))}
              >
                <SkipBack className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handlePlayPause}>
                {isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  handleSeek(
                    Math.min(
                      selectedTrack.duration_seconds || 0,
                      currentTime + 5,
                    ),
                  )
                }
              >
                <SkipForward className="w-4 h-4" />
              </Button>
              <div className="flex-1">
                <Slider
                  value={[currentTime]}
                  min={0}
                  max={selectedTrack.duration_seconds || 0}
                  step={0.1}
                  onValueChange={([value]) => handleSeek(value)}
                />
              </div>
              <span className="text-sm text-muted-foreground w-20 text-right">
                {currentTime.toFixed(1)}s /{" "}
                {(selectedTrack.duration_seconds || 0).toFixed(1)}s
              </span>
            </div>

            <div className="bg-muted p-4 rounded-md min-h-[100px] flex items-center justify-center">
              {getCurrentSegments().map((segment) => (
                <p key={segment.id} className="text-lg font-medium text-center">
                  {segment.lyric_segment}
                </p>
              ))}
            </div>

            <audio
              ref={audioRef}
              src={selectedTrack.file_url}
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => setIsPlaying(false)}
            />
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            {isLoading
              ? "Loading tracks..."
              : 'No track selected. Click "Select Track" to choose a track for synchronization.'}
          </div>
        )}
      </Card>

      {selectedTrack && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Track Information</h3>
            <Badge variant="secondary">
              {selectedTrack.duration_seconds
                ? `${selectedTrack.duration_seconds.toFixed(1)}s`
                : "Unknown duration"}
            </Badge>
          </div>
          <div className="space-y-2">
            <p>
              <span className="font-medium">Title:</span> {selectedTrack.title}
            </p>
            <p>
              <span className="font-medium">Artist:</span>{" "}
              {selectedTrack.artist || "Unknown"}
            </p>
            <p>
              <span className="font-medium">Album:</span>{" "}
              {selectedTrack.album || "Unknown"}
            </p>
            <p>
              <span className="font-medium">Genre:</span>{" "}
              {selectedTrack.genre || "Unknown"}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}

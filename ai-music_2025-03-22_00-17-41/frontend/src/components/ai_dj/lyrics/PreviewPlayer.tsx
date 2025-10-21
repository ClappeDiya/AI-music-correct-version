import { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Music2,
  Clock,
  Settings2,
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
import { Badge } from "@/components/ui/Badge";
import { lyricTimelineApi } from "@/services/LyricsGenerationApi";
import type { Track } from "@/types/ai_dj";
import type { LyricTimeline } from "@/types/LyricsGeneration";

interface PreviewPlayerProps {
  track: Track;
  timeline: LyricTimeline[];
  onTimelineUpdate: () => void;
}

export function PreviewPlayer({
  track,
  timeline,
  onTimelineUpdate,
}: PreviewPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showAdjustDialog, setShowAdjustDialog] = useState(false);
  const [adjustingSegment, setAdjustingSegment] =
    useState<LyricTimeline | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

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

  const handleSkip = (direction: "back" | "forward") => {
    if (!audioRef.current) return;

    const currentSegment = timeline.find(
      (segment) =>
        currentTime >= segment.start_time_seconds &&
        currentTime <= segment.end_time_seconds,
    );

    if (currentSegment) {
      if (direction === "back") {
        const prevSegment = timeline.find(
          (s) => s.end_time_seconds === currentSegment.start_time_seconds,
        );
        if (prevSegment) {
          handleSeek(prevSegment.start_time_seconds);
        }
      } else {
        const nextSegment = timeline.find(
          (s) => s.start_time_seconds === currentSegment.end_time_seconds,
        );
        if (nextSegment) {
          handleSeek(nextSegment.start_time_seconds);
        }
      }
    }
  };

  const handleAdjustTiming = async (segmentId: number, adjustment: number) => {
    const segment = timeline.find((s) => s.id === segmentId);
    if (!segment) return;

    try {
      await lyricTimelineApi.update(segmentId, {
        start_time_seconds: segment.start_time_seconds + adjustment,
        end_time_seconds: segment.end_time_seconds + adjustment,
      });
      onTimelineUpdate();
      toast({
        title: "Success",
        description: "Timing adjusted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to adjust timing",
        variant: "destructive",
      });
    }
  };

  const getCurrentSegments = () => {
    return timeline.filter(
      (segment) =>
        currentTime >= segment.start_time_seconds &&
        currentTime <= segment.end_time_seconds,
    );
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Music2 className="h-5 w-5" />
            <div>
              <h3 className="font-medium">{track.title}</h3>
              <p className="text-sm text-muted-foreground">{track.artist}</p>
            </div>
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {track.duration_seconds?.toFixed(1)}s
          </Badge>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleSkip("back")}
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
            onClick={() => handleSkip("forward")}
          >
            <SkipForward className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <Slider
              value={[currentTime]}
              min={0}
              max={track.duration_seconds || 0}
              step={0.1}
              onValueChange={([value]) => handleSeek(value)}
            />
          </div>
          <span className="text-sm text-muted-foreground w-20 text-right">
            {currentTime.toFixed(1)}s /{" "}
            {(track.duration_seconds || 0).toFixed(1)}s
          </span>
        </div>

        <audio
          ref={audioRef}
          src={track.file_url}
          onEnded={() => setIsPlaying(false)}
        />
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">Synchronized Lyrics</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdjustDialog(true)}
          >
            <Settings2 className="h-4 w-4 mr-2" />
            Adjust Timings
          </Button>
        </div>

        <ScrollArea className="h-[300px]">
          <div className="space-y-2">
            {timeline.map((segment) => {
              const isActive =
                currentTime >= segment.start_time_seconds &&
                currentTime <= segment.end_time_seconds;
              const isPast = currentTime > segment.end_time_seconds;

              return (
                <div
                  key={segment.id}
                  className={`p-3 rounded-md transition-colors ${
                    isActive
                      ? "bg-primary/10 border-primary"
                      : isPast
                        ? "opacity-50"
                        : ""
                  }`}
                  onClick={() => handleSeek(segment.start_time_seconds)}
                >
                  <p className="font-medium">{segment.lyric_segment}</p>
                  <p className="text-sm text-muted-foreground">
                    {segment.start_time_seconds.toFixed(1)}s -{" "}
                    {segment.end_time_seconds.toFixed(1)}s
                  </p>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </Card>

      <Dialog open={showAdjustDialog} onOpenChange={setShowAdjustDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Timings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Click on a segment to adjust its timing. Use the slider to
              fine-tune the position.
            </p>
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {timeline.map((segment) => (
                  <Card key={segment.id} className="p-4">
                    <div className="space-y-2">
                      <p className="font-medium">{segment.lyric_segment}</p>
                      <div className="flex items-center gap-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAdjustTiming(segment.id, -0.1)}
                        >
                          -0.1s
                        </Button>
                        <div className="flex-1">
                          <Slider
                            value={[segment.start_time_seconds]}
                            min={0}
                            max={track.duration_seconds || 0}
                            step={0.1}
                            onValueChange={([value]) => {
                              const adjustment =
                                value - segment.start_time_seconds;
                              handleAdjustTiming(segment.id, adjustment);
                            }}
                          />
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAdjustTiming(segment.id, 0.1)}
                        >
                          +0.1s
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

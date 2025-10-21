import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useEffect,
} from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Slider } from "@/components/ui/Slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Play, Pause, SkipBack, SkipForward, Music2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineTrack {
  id: string;
  name: string;
  type: "melody" | "harmony" | "rhythm" | "bass";
  events: TimelineEvent[];
}

interface TimelineEvent {
  id: string;
  startTime: number;
  duration: number;
  pitch: number;
  velocity: number;
  type: "note" | "chord" | "rest";
  data: any;
}

interface Composition {
  id: string;
  title: string;
  tracks: TimelineTrack[];
  tempo: number;
  timeSignature: string;
  version: number;
}

interface CompositionTimelineProps {
  composition: Composition;
  onEdit: (edit: any) => void;
  className?: string;
}

export interface CompositionTimelineRef {
  applyEdit: (edit: any) => void;
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
}

export const CompositionTimeline = forwardRef<
  CompositionTimelineRef,
  CompositionTimelineProps
>(({ composition, onEdit, className }, ref) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  // Audio playback state
  const audioContextRef = React.useRef<AudioContext | null>(null);
  const schedulerIntervalRef = React.useRef<number | null>(null);

  useEffect(() => {
    // Initialize audio context
    audioContextRef.current = new AudioContext();

    return () => {
      if (schedulerIntervalRef.current) {
        window.clearInterval(schedulerIntervalRef.current);
      }
      audioContextRef.current?.close();
    };
  }, []);

  useImperativeHandle(ref, () => ({
    applyEdit: (edit: any) => {
      // Handle incoming edit from WebSocket
      console.log("Applying edit:", edit);
      // Update local state based on edit type
    },
    play: () => {
      setIsPlaying(true);
      startPlayback();
    },
    pause: () => {
      setIsPlaying(false);
      stopPlayback();
    },
    seek: (time: number) => {
      setCurrentTime(time);
      if (isPlaying) {
        stopPlayback();
        startPlayback(time);
      }
    },
  }));

  const startPlayback = (startTime: number = currentTime) => {
    if (!audioContextRef.current) return;

    // Schedule notes for playback
    composition.tracks.forEach((track) => {
      track.events.forEach((event) => {
        if (event.startTime >= startTime) {
          scheduleEvent(event, track.type);
        }
      });
    });

    // Start playback timer
    schedulerIntervalRef.current = window.setInterval(() => {
      setCurrentTime((time) => {
        const newTime = time + 0.1;
        if (newTime >= getDuration()) {
          stopPlayback();
          return 0;
        }
        return newTime;
      });
    }, 100);
  };

  const stopPlayback = () => {
    if (schedulerIntervalRef.current) {
      window.clearInterval(schedulerIntervalRef.current);
      schedulerIntervalRef.current = null;
    }
    setIsPlaying(false);
  };

  const scheduleEvent = (event: TimelineEvent, trackType: string) => {
    if (!audioContextRef.current) return;

    const startTime =
      audioContextRef.current.currentTime + (event.startTime - currentTime);

    if (event.type === "note") {
      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);

      // Configure oscillator based on track type
      oscillator.type = trackType === "bass" ? "triangle" : "sine";
      oscillator.frequency.value = midiToFrequency(event.pitch);

      gainNode.gain.value = event.velocity / 127;

      oscillator.start(startTime);
      oscillator.stop(startTime + event.duration);
    }
  };

  const midiToFrequency = (midi: number): number => {
    return 440 * Math.pow(2, (midi - 69) / 12);
  };

  const getDuration = (): number => {
    let maxDuration = 0;
    composition.tracks.forEach((track) => {
      track.events.forEach((event) => {
        const eventEnd = event.startTime + event.duration;
        if (eventEnd > maxDuration) {
          maxDuration = eventEnd;
        }
      });
    });
    return maxDuration;
  };

  const handleTrackClick = (trackId: string) => {
    setSelectedTrack(trackId);
    setSelectedEvent(null);
  };

  const handleEventClick = (trackId: string, eventId: string) => {
    setSelectedTrack(trackId);
    setSelectedEvent(eventId);
  };

  const handleEditEvent = (eventId: string, changes: any) => {
    onEdit({
      type: "edit_event",
      eventId,
      changes,
    });
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Transport Controls */}
      <Card className="p-4 mb-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentTime(0)}
          >
            <SkipBack className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => (isPlaying ? stopPlayback() : startPlayback())}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentTime(getDuration())}
          >
            <SkipForward className="w-4 h-4" />
          </Button>

          <div className="flex-1">
            <Slider
              value={[currentTime]}
              min={0}
              max={getDuration()}
              step={0.1}
              onValueChange={([value]) => {
                setCurrentTime(value);
                if (isPlaying) {
                  stopPlayback();
                  startPlayback(value);
                }
              }}
            />
          </div>

          <div className="flex items-center gap-2">
            <Music2 className="w-4 h-4" />
            <span className="text-sm">
              {composition.tempo} BPM | {composition.timeSignature}
            </span>
          </div>
        </div>
      </Card>

      {/* Timeline */}
      <ScrollArea className="flex-1">
        <div
          className="relative"
          style={{
            height: composition.tracks.length * 100 + "px",
          }}
        >
          {composition.tracks.map((track, trackIndex) => (
            <motion.div
              key={track.id}
              className={cn(
                "absolute w-full h-24 border-b border-border p-2",
                selectedTrack === track.id && "bg-accent",
              )}
              style={{
                top: trackIndex * 100 + "px",
              }}
              onClick={() => handleTrackClick(track.id)}
              whileHover={{ backgroundColor: "rgba(0,0,0,0.05)" }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{track.name}</span>
                <span className="text-sm text-muted-foreground">
                  {track.type}
                </span>
              </div>

              <div className="relative h-12">
                {track.events.map((event) => (
                  <motion.div
                    key={event.id}
                    className={cn(
                      "absolute h-full rounded-md cursor-pointer",
                      selectedEvent === event.id
                        ? "bg-primary"
                        : "bg-primary/50",
                    )}
                    style={{
                      left: (event.startTime / getDuration()) * 100 + "%",
                      width: (event.duration / getDuration()) * 100 + "%",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEventClick(track.id, event.id);
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  />
                ))}

                {/* Playhead */}
                {isPlaying && (
                  <motion.div
                    className="absolute top-0 w-px h-full bg-primary"
                    style={{
                      left: (currentTime / getDuration()) * 100 + "%",
                    }}
                  />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
});

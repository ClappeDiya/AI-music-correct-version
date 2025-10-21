"use client";

import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Slider } from "@/components/ui/Slider";
import { Badge } from "@/components/ui/Badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Play,
  Pause,
  Volume2,
  BarChart,
} from "lucide-react";
import { TrackIntegration } from "./TrackIntegration";
import { MoodAnalytics } from "./MoodAnalytics";
import { useMoodAnalytics } from "@/hooks/UseMoodAnalytics";
import type { MoodFeedback, Mood } from "@/lib/api/services/mood";

// Base properties for both use cases
interface BaseMoodPreviewProps {
  compact?: boolean;
  minimal?: boolean;
}

// Props for when displaying an existing track
interface TrackMoodPreviewProps extends BaseMoodPreviewProps {
  mode: 'track';
  trackUrl: string;
  trackId: string;
  onFeedbackSubmit?: (feedback: MoodFeedback) => void;
}

// Props for when preparing to generate a track
interface GenerativeMoodPreviewProps extends BaseMoodPreviewProps {
  mode: 'generative';
  moodDescription: string | Mood;
  onGenerateClick: () => Promise<void>;
  isGenerating: boolean;
}

// Combined props type using discriminated union
export type MoodPreviewProps = TrackMoodPreviewProps | GenerativeMoodPreviewProps;

// Type guard for track mode
function isTrackMode(props: MoodPreviewProps): props is TrackMoodPreviewProps {
  return props.mode === 'track';
}

// Type guard for generative mode
function isGenerativeMode(props: MoodPreviewProps): props is GenerativeMoodPreviewProps {
  return props.mode === 'generative';
}

export function MoodPreview(props: MoodPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [activeTab, setActiveTab] = useState("preview");
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Only access the trackId when in track mode
  const trackId = isTrackMode(props) ? props.trackId : '';
  const { trackInteraction } = useMoodAnalytics(trackId);

  useEffect(() => {
    if (audioRef.current && isTrackMode(props)) {
      const audio = audioRef.current;

      const handlePlay = () => {
        trackInteraction({
          type: "play"
        });
      };

      const handleEnded = () => {
        setIsPlaying(false);
        trackInteraction({
          type: "complete",
          duration: audio.duration
        });
      };

      audio.addEventListener("play", handlePlay);
      audio.addEventListener("ended", handleEnded);

      return () => {
        audio.removeEventListener("play", handlePlay);
        audio.removeEventListener("ended", handleEnded);
      };
    }
  }, [trackId, trackInteraction, props]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    if (audioRef.current) {
      audioRef.current.volume = value[0];
    }
  };

  const handleFeedback = (type: "like" | "dislike") => {
    if (isTrackMode(props) && props.onFeedbackSubmit) {
      props.onFeedbackSubmit({
        track_id: props.trackId,
        feedback_type: type,
      });
    }
  };

  // Minimal version for track mode
  if (props.minimal && isTrackMode(props)) {
    return (
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          className="w-8 h-8 p-0"
          onClick={togglePlay}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <audio
          ref={audioRef}
          src={props.trackUrl}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
      </div>
    );
  }

  // Generative mode UI
  if (isGenerativeMode(props)) {
    return (
      <Card className={props.compact ? "p-2" : "p-4"}>
        <div className="flex items-center justify-between">
          <Button
            variant="default"
            size="sm"
            className="px-4"
            onClick={props.onGenerateClick}
            disabled={props.isGenerating}
          >
            {props.isGenerating ? "Generating..." : "Generate Music"}
          </Button>
          <div className="flex-1 ml-4 text-lg">
            {typeof props.moodDescription === 'string' 
              ? props.moodDescription 
              : props.moodDescription.name || 'Custom Mood'}
          </div>
        </div>
      </Card>
    );
  }

  // Track mode with tabs UI
  if (isTrackMode(props)) {
    return (
      <Card className={props.compact ? "p-2" : "p-4"}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="integration">Integration</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          <TabsContent value="preview" className="pt-4">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="sm"
                className="w-8 h-8 p-0"
                onClick={togglePlay}
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
              <div className="flex items-center gap-2 flex-1 mx-4">
                <Volume2 className="h-4 w-4 text-gray-500" />
                <Slider
                  value={[volume]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={handleVolumeChange}
                />
              </div>
              <Badge variant="outline" className="text-xs">
                {Math.round(volume * 100)}%
              </Badge>
            </div>

            {props.onFeedbackSubmit && (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFeedback("like")}
                >
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  Like
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFeedback("dislike")}
                >
                  <ThumbsDown className="h-4 w-4 mr-2" />
                  Dislike
                </Button>
              </div>
            )}

            <audio
              ref={audioRef}
              src={props.trackUrl}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
          </TabsContent>

          <TabsContent value="integration">
            <TrackIntegration trackId={props.trackId} currentModule="mood" />
          </TabsContent>

          <TabsContent value="analytics">
            <MoodAnalytics trackId={props.trackId} />
          </TabsContent>
        </Tabs>
      </Card>
    );
  }

  // Fallback - should never reach here with proper TypeScript
  return null;
}

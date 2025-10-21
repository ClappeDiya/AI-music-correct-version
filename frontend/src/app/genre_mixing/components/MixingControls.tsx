import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Slider } from "@/components/ui/Slider";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { Download, Play, Pause, RotateCcw, Zap, Repeat } from "lucide-react";
import { MixingSessionGenre } from "@/types/GenreMixing";
import { audioPreviewService } from "@/services/AudioPreviewService";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/useToast";
import { PlaybackControls } from "@/app/ai_music/components/PlaybackControls";
import { Toggle } from "@/components/ui/Toggle";
import { SaveTrackDialog } from "./SaveTrackDialog";

interface MixingControlsProps {
  selectedGenres: MixingSessionGenre[];
  sessionId?: string;
  onWeightChange: (genreId: string, weight: number) => void;
  onGenerateMix: () => void;
  onDownloadMix: () => void;
  onEnergyLevelChange?: (level: number) => void;
  onTrackSaved?: (trackId: string) => void;
  isLoading?: boolean;
}

export function MixingControls({
  selectedGenres,
  sessionId,
  onWeightChange,
  onGenerateMix,
  onDownloadMix,
  onEnergyLevelChange,
  onTrackSaved,
  isLoading = false,
}: MixingControlsProps) {
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [energyLevel, setEnergyLevel] = useState(0.5);
  const [abTestingEnabled, setAbTestingEnabled] = useState(false);
  const [abTestSegment, setAbTestSegment] = useState<"A" | "B">("A");
  const [isLooping, setIsLooping] = useState(false);
  const [loopStart, setLoopStart] = useState(0);
  const [loopEnd, setLoopEnd] = useState(0);
  const totalWeight = selectedGenres.reduce((sum, sg) => sum + sg.weight, 0);
  const isValidMix = Math.abs(totalWeight - 100) < 0.01;

  // Handle audio preview
  const handlePreviewToggle = async () => {
    if (!sessionId) {
      toast({
        title: "Error",
        description: "No active mixing session",
        variant: "destructive",
      });
      return;
    }

    if (isPlaying) {
      audioPreviewService.stopPreview();
      setIsPlaying(false);
    } else {
      try {
        setIsGeneratingPreview(true);
        const previewData = await audioPreviewService.playPreview(sessionId, {
          duration: 30,
          quality: "medium",
          energyLevel,
          abTestSegment: abTestingEnabled ? abTestSegment : undefined,
          loop: isLooping ? { start: loopStart, end: loopEnd } : undefined,
        });
        setDuration(previewData.duration);
        if (!loopEnd) {
          setLoopEnd(previewData.duration);
        }
        setIsPlaying(true);
      } catch (error) {
        console.error("Failed to play preview:", error);
        toast({
          title: "Error",
          description: "Failed to play audio preview",
          variant: "destructive",
        });
      } finally {
        setIsGeneratingPreview(false);
      }
    }
  };

  // Handle energy level change
  const handleEnergyLevelChange = (value: number) => {
    setEnergyLevel(value);
    onEnergyLevelChange?.(value);
  };

  // Handle playback controls
  const handleSeek = (time: number) => {
    setCurrentTime(time);
    audioPreviewService.seekTo(time);
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    audioPreviewService.setVolume(newVolume);
  };

  // Toggle AB testing
  const toggleABTesting = () => {
    setAbTestingEnabled(!abTestingEnabled);
    if (!abTestingEnabled) {
      setAbTestSegment("A");
    }
  };

  // Switch between A and B segments
  const switchABSegment = () => {
    setAbTestSegment((prev) => (prev === "A" ? "B" : "A"));
    if (isPlaying) {
      handlePreviewToggle();
    }
  };

  // Handle loop controls
  const toggleLoop = () => {
    setIsLooping(!isLooping);
    if (isPlaying) {
      handlePreviewToggle();
    }
  };

  // Update loop region
  const handleLoopRegionChange = (start: number, end: number) => {
    setLoopStart(start);
    setLoopEnd(end);
    if (isPlaying && isLooping) {
      handlePreviewToggle();
    }
  };

  // Monitor playback position for looping
  useEffect(() => {
    if (isLooping && isPlaying && currentTime >= loopEnd) {
      handleSeek(loopStart);
    }
  }, [currentTime, isLooping, isPlaying, loopStart, loopEnd]);

  // Stop preview on unmount
  useEffect(() => {
    return () => {
      audioPreviewService.stopPreview();
    };
  }, []);

  // Reset weights to equal distribution
  const resetWeights = () => {
    const equalWeight = 100 / selectedGenres.length;
    selectedGenres.forEach((sg) => {
      onWeightChange(sg.genre.id, equalWeight);
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Mix Controls</CardTitle>
        <div className="text-sm text-muted-foreground">
          Total: {totalWeight.toFixed(1)}%{" "}
          {!isValidMix && "(Should equal 100%)"}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Energy Level
              </span>
              <span>{(energyLevel * 100).toFixed(0)}%</span>
            </div>
            <Slider
              value={[energyLevel * 100]}
              min={0}
              max={100}
              step={1}
              onValueChange={([value]) => handleEnergyLevelChange(value / 100)}
              className={
                isLoading || isGeneratingPreview
                  ? "opacity-50 pointer-events-none"
                  : ""
              }
            />
          </div>

          <ScrollArea className="h-[200px] pr-4">
            <div className="space-y-6">
              {selectedGenres.map((sg) => (
                <div key={sg.genre.id} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{sg.genre.name}</span>
                    <span>{sg.weight.toFixed(1)}%</span>
                  </div>
                  <Slider
                    value={[sg.weight]}
                    min={0}
                    max={100}
                    step={0.1}
                    onValueChange={([value]) =>
                      onWeightChange(sg.genre.id, value)
                    }
                    className={
                      isLoading || isGeneratingPreview
                        ? "opacity-50 pointer-events-none"
                        : ""
                    }
                  />
                </div>
              ))}
            </div>
          </ScrollArea>

          {duration > 0 && (
            <>
              <PlaybackControls
                isPlaying={isPlaying}
                onPlayPause={handlePreviewToggle}
                onSeek={handleSeek}
                onVolumeChange={handleVolumeChange}
                currentTime={currentTime}
                duration={duration}
                volume={volume}
              />

              {/* Loop Controls */}
              <div className="flex items-center gap-4">
                <Toggle
                  pressed={isLooping}
                  onPressedChange={toggleLoop}
                  disabled={isLoading || isGeneratingPreview}
                  aria-label="Toggle loop playback"
                >
                  <Repeat
                    className={`h-4 w-4 ${isLooping ? "text-primary" : ""}`}
                  />
                </Toggle>
                {isLooping && (
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Loop Region</span>
                      <span>
                        {loopStart.toFixed(1)}s - {loopEnd.toFixed(1)}s
                      </span>
                    </div>
                    <Slider
                      value={[loopStart, loopEnd]}
                      min={0}
                      max={duration}
                      step={0.1}
                      onValueChange={([start, end]) =>
                        handleLoopRegionChange(start, end)
                      }
                      className={
                        isLoading || isGeneratingPreview
                          ? "opacity-50 pointer-events-none"
                          : ""
                      }
                    />
                  </div>
                )}
              </div>
            </>
          )}

          <div className="flex gap-2">
            <Button
              className="flex-1"
              onClick={onGenerateMix}
              disabled={!isValidMix || isLoading || isGeneratingPreview}
            >
              <Play className="w-4 h-4 mr-2" />
              Generate Mix
            </Button>
            <Button
              variant="outline"
              onClick={onDownloadMix}
              disabled={isLoading || isGeneratingPreview}
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              onClick={resetWeights}
              disabled={
                isLoading || isGeneratingPreview || selectedGenres.length === 0
              }
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            {sessionId && (
              <SaveTrackDialog
                sessionId={sessionId}
                onSaved={onTrackSaved}
                isLoading={isLoading || isGeneratingPreview}
              />
            )}
          </div>

          {/* AB Testing Controls */}
          <div className="flex items-center gap-4 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleABTesting}
              disabled={isLoading || isGeneratingPreview}
            >
              {abTestingEnabled ? "Disable" : "Enable"} A/B Testing
            </Button>
            {abTestingEnabled && (
              <Button
                variant="secondary"
                size="sm"
                onClick={switchABSegment}
                disabled={isLoading || isGeneratingPreview}
              >
                Segment {abTestSegment}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

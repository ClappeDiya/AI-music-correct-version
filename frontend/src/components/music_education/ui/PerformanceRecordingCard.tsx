"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import {
  Play,
  Pause,
  Trash2,
  Music,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PerformanceRecordingCardProps {
  recording: {
    id: number;
    title: string;
    date: string;
    duration: number;
    audioUrl: string;
    analysis: {
      accuracy: number;
      rhythm: number;
      expression: number;
      feedback: string;
      improvement: "improving" | "declining" | "stable";
    };
  };
  onDelete: (id: number) => Promise<void>;
  className?: string;
}

export function PerformanceRecordingCard({
  recording,
  onDelete,
  className,
}: PerformanceRecordingCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handlePlayPause = () => {
    // Audio playback logic would go here
    setIsPlaying(!isPlaying);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(recording.id);
      toast.success("Recording deleted successfully");
    } catch (error) {
      console.error("Failed to delete recording:", error);
      toast.error("Failed to delete recording");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getImprovementIcon = () => {
    switch (recording.analysis.improvement) {
      case "improving":
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case "declining":
        return <TrendingDown className="w-5 h-5 text-red-500" />;
      default:
        return <Minus className="w-5 h-5 text-yellow-500" />;
    }
  };

  return (
    <>
      <Card className={cn("transition-all", className)}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Music className="w-5 h-5" />
              <span>{recording.title}</span>
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{recording.date}</span>
            <span>{formatDuration(recording.duration)}</span>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full"
              onClick={handlePlayPause}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4 ml-0.5" />
              )}
            </Button>
            <div className="flex-1 space-y-1">
              <div className="h-2 bg-secondary rounded-full">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: isPlaying ? "60%" : "0%" }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Accuracy</span>
              <span className="text-sm font-medium">
                {Math.round(recording.analysis.accuracy * 100)}%
              </span>
            </div>
            <Progress
              value={recording.analysis.accuracy * 100}
              className="h-2"
            />

            <div className="flex items-center justify-between">
              <span className="text-sm">Rhythm</span>
              <span className="text-sm font-medium">
                {Math.round(recording.analysis.rhythm * 100)}%
              </span>
            </div>
            <Progress value={recording.analysis.rhythm * 100} className="h-2" />

            <div className="flex items-center justify-between">
              <span className="text-sm">Expression</span>
              <span className="text-sm font-medium">
                {Math.round(recording.analysis.expression * 100)}%
              </span>
            </div>
            <Progress
              value={recording.analysis.expression * 100}
              className="h-2"
            />
          </div>

          <div className="flex items-start space-x-2 pt-2">
            {getImprovementIcon()}
            <p className="text-sm text-muted-foreground">
              {recording.analysis.feedback}
            </p>
          </div>
        </CardContent>
      </Card>

      <DeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Recording"
        description="Are you sure you want to delete this recording? This action cannot be undone."
        isLoading={isDeleting}
        onConfirm={handleDelete}
      />
    </>
  );
}

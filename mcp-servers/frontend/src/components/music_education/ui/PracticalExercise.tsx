"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import {
  Camera,
  Mic,
  Music,
  Pause,
  Play,
  Square,
  Trash2,
  Upload,
  X,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PracticalExercise, PracticalSubmission } from '@/types/music_education";
import { toast } from "sonner";
import Image from "next/image";

interface PracticalExerciseProps {
  exercise: PracticalExercise;
  onSubmit: (data: FormData) => Promise<PracticalSubmission>;
  className?: string;
}

export function PracticalExerciseComponent({
  exercise,
  onSubmit,
  className,
}: PracticalExerciseProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout>();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        setAudioBlob(audioBlob);
        setAudioUrl(URL.createObjectURL(audioBlob));
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Failed to start recording:", error);
      toast.error("Failed to access microphone");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      clearInterval(timerRef.current);
      setIsRecording(false);
    }
  };

  const captureScreenshot = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: "screen" },
      });
      const track = stream.getVideoTracks()[0];
      const imageCapture = new ImageCapture(track);
      const bitmap = await imageCapture.grabFrame();
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const context = canvas.getContext("2d");
      context?.drawImage(bitmap, 0, 0);
      const screenshot = canvas.toDataURL("image/png");
      setScreenshots((prev) => [...prev, screenshot]);
      track.stop();
    } catch (error) {
      console.error("Failed to capture screenshot:", error);
      toast.error("Failed to capture screenshot");
    }
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSubmit = async () => {
    if (!audioBlob && exercise.requirements.audioRequired) {
      toast.error("Audio recording is required");
      return;
    }

    if (screenshots.length === 0 && exercise.requirements.screenshotRequired) {
      toast.error("Screenshot is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      if (audioBlob) {
        formData.append("audio", audioBlob);
      }
      screenshots.forEach((screenshot, index) => {
        const base64Data = screenshot.split(",")[1];
        const binaryData = atob(base64Data);
        const byteArray = new Uint8Array(binaryData.length);
        for (let i = 0; i < binaryData.length; i++) {
          byteArray[i] = binaryData.charCodeAt(i);
        }
        const blob = new Blob([byteArray], { type: "image/png" });
        formData.append(`screenshot_${index}`, blob);
      });

      const submission = await onSubmit(formData);
      toast.success("Exercise submitted successfully");

      // Reset state
      setAudioBlob(null);
      setAudioUrl(null);
      setScreenshots([]);
    } catch (error) {
      console.error("Failed to submit exercise:", error);
      toast.error("Failed to submit exercise");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="p-4 sm:p-6 space-y-3">
        <CardTitle className="text-xl sm:text-2xl break-words leading-tight">
          {exercise.title}
        </CardTitle>
        <p className="text-base text-muted-foreground break-words leading-relaxed">
          {exercise.description}
        </p>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 space-y-8">
        {exercise.requirements.audioRequired && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="font-medium text-base">Audio Recording</h3>
              {exercise.requirements.duration && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span className="text-base">
                    Required: {formatTime(exercise.requirements.duration)}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              {!audioUrl ? (
                <Button
                  variant={isRecording ? "destructive" : "default"}
                  onClick={isRecording ? stopRecording : startRecording}
                  className="h-12 text-base"
                  disabled={isSubmitting}
                >
                  {isRecording ? (
                    <>
                      <Square className="w-5 h-5 mr-2" />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic className="w-5 h-5 mr-2" />
                      Start Recording
                    </>
                  )}
                </Button>
              ) : (
                <div className="flex items-stretch gap-3 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    onClick={togglePlayback}
                    className="flex-1 sm:flex-none h-12 min-w-[120px] text-base"
                    disabled={isSubmitting}
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-5 h-5 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 mr-2" />
                        Play
                      </>
                    )}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setAudioBlob(null);
                      setAudioUrl(null);
                    }}
                    className="h-12 px-4"
                    disabled={isSubmitting}
                  >
                    <Trash2 className="w-5 h-5 mr-2" />
                    Delete
                  </Button>
                </div>
              )}
              {isRecording && (
                <div className="flex items-center gap-2 bg-accent/50 px-4 py-2 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-base font-medium">
                    {formatTime(recordingTime)}
                  </span>
                </div>
              )}
            </div>

            {audioUrl && (
              <audio
                ref={audioRef}
                src={audioUrl}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />
            )}
          </div>
        )}

        {exercise.requirements.screenshotRequired && (
          <div className="space-y-4">
            <h3 className="font-medium text-base">Screenshots</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {screenshots.map((screenshot, index) => (
                <div
                  key={index}
                  className="relative aspect-square border rounded-lg overflow-hidden group touch-manipulation"
                >
                  <Image
                    src={screenshot}
                    alt={`Screenshot ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity" />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-10 w-10 opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity"
                    onClick={() =>
                      setScreenshots((prev) =>
                        prev.filter((_, i) => i !== index)
                      )
                    }
                    disabled={isSubmitting}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={captureScreenshot}
                disabled={isSubmitting}
                className="aspect-square flex flex-col items-center justify-center text-base p-4 hover:bg-accent/50 active:bg-accent/70 transition-colors"
              >
                <Camera className="w-10 h-10 mb-3" />
                <span className="text-center">Capture Screenshot</span>
              </Button>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t">
          {(exercise.requirements.audioRequired || exercise.requirements.screenshotRequired) && (
            <p className="text-sm text-muted-foreground order-2 sm:order-1">
              {exercise.requirements.audioRequired && !audioBlob && "Audio recording required • "}
              {exercise.requirements.screenshotRequired && screenshots.length === 0 && "Screenshot required"}
            </p>
          )}
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="h-12 text-base order-1 sm:order-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              "Submit Exercise"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 


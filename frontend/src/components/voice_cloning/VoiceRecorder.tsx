"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { useToast } from "@/components/ui/useToast";
import { Mic, Square, Loader2 } from "lucide-react";

interface Props {
  onRecordingComplete: (blob: Blob) => void;
  isProcessing?: boolean;
  maxDuration?: number; // in seconds
}

export function VoiceRecorder({
  onRecordingComplete,
  isProcessing,
  maxDuration = 30,
}: Props) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (mediaRecorder.current && isRecording) {
        mediaRecorder.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      chunks.current = [];

      mediaRecorder.current.ondataavailable = (e) => {
        chunks.current.push(e.data);
      };

      mediaRecorder.current.onstop = () => {
        const blob = new Blob(chunks.current, { type: "audio/webm" });
        onRecordingComplete(blob);
        setIsRecording(false);
        setDuration(0);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.current.start();
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setDuration((prev) => {
          if (prev >= maxDuration) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to access microphone",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <Button
          size="lg"
          variant={isRecording ? "destructive" : "default"}
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : isRecording ? (
            <Square className="h-4 w-4 mr-2" />
          ) : (
            <Mic className="h-4 w-4 mr-2" />
          )}
          {isProcessing
            ? "Processing..."
            : isRecording
              ? "Stop Recording"
              : "Start Recording"}
        </Button>
      </div>

      <div className="space-y-2">
        <Progress value={(duration / maxDuration) * 100} />
        <p className="text-sm text-center text-muted-foreground">
          {duration.toFixed(0)}s / {maxDuration}s
        </p>
      </div>
    </div>
  );
}

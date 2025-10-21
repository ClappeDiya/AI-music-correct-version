"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useLanguageStore } from "@/stores/languageStore";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { useToast } from "@/components/ui/useToast";
import {
  Mic,
  MicOff,
  Languages,
  Activity,
  Volume2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceCommandRecognizerProps {
  sessionId: number;
  onCommandRecognized: (command: string) => void;
  className?: string;
}

export function VoiceCommandRecognizer({
  sessionId,
  onCommandRecognized,
  className,
}: VoiceCommandRecognizerProps) {
  const { currentLanguage, supportedLanguages } = useLanguageStore();
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [recognition, setRecognition] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const initializeRecognition = useCallback(() => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      setError("Speech recognition is not supported in this browser");
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognizer = new SpeechRecognition();

    recognizer.continuous = true;
    recognizer.interimResults = true;
    recognizer.lang = currentLanguage;

    recognizer.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognizer.onerror = (event: any) => {
      setError(event.error);
      setIsListening(false);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to start voice recognition: ${event.error}`,
      });
    };

    recognizer.onend = () => {
      setIsListening(false);
    };

    recognizer.onresult = async (event: any) => {
      const last = event.results.length - 1;
      const command = event.results[last][0].transcript;

      if (event.results[last].isFinal) {
        try {
          const response = await fetch(
            `/api/sessions/${sessionId}/voice_commands`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                command,
                language: currentLanguage,
              }),
            },
          );

          if (!response.ok) throw new Error("Failed to process voice command");

          const data = await response.json();
          onCommandRecognized(data.processedCommand);
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to process voice command",
          });
        }
      }
    };

    setRecognition(recognizer);
  }, [currentLanguage, sessionId, onCommandRecognized, toast]);

  useEffect(() => {
    initializeRecognition();
    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [initializeRecognition]);

  useEffect(() => {
    if (!isListening) return;

    let audioContext: AudioContext;
    let analyser: AnalyserNode;
    let microphone: MediaStreamAudioSourceNode;
    let dataArray: Uint8Array;

    const processAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        audioContext = new AudioContext();
        analyser = audioContext.createAnalyser();
        microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);
        analyser.fftSize = 256;
        dataArray = new Uint8Array(analyser.frequencyBinCount);

        const updateLevel = () => {
          if (!isListening) return;
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setAudioLevel(Math.min(100, (average / 128) * 100));
          requestAnimationFrame(updateLevel);
        };

        updateLevel();
      } catch (error) {
        console.error("Error accessing microphone:", error);
      }
    };

    processAudio();

    return () => {
      if (audioContext) {
        audioContext.close();
      }
    };
  }, [isListening]);

  const toggleListening = () => {
    if (isListening) {
      recognition?.stop();
    } else {
      recognition?.start();
    }
  };

  return (
    <Card className={cn("w-full max-w-md", className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isListening ? (
              <Mic className="h-5 w-5 text-primary animate-pulse" />
            ) : (
              <MicOff className="h-5 w-5 text-muted-foreground" />
            )}
            Voice Commands
          </div>
          <Badge variant="outline" className="gap-1">
            <Languages className="h-3 w-3" />
            {supportedLanguages.find((l) => l.code === currentLanguage)?.name}
          </Badge>
        </CardTitle>
        <CardDescription>
          Speak commands in{" "}
          {supportedLanguages.find((l) => l.code === currentLanguage)?.name}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {error ? (
            <div className="flex items-center gap-2 text-destructive text-sm">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          ) : (
            <>
              <div className="flex items-center gap-4">
                <Button
                  onClick={toggleListening}
                  variant={isListening ? "destructive" : "default"}
                  className="w-full gap-2"
                  disabled={!!error}
                >
                  {isListening ? (
                    <>
                      <MicOff className="h-4 w-4" />
                      Stop Listening
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4" />
                      Start Listening
                    </>
                  )}
                </Button>
              </div>

              {isListening && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Activity className="h-4 w-4" />
                      Audio Level
                    </div>
                    <div className="flex items-center gap-1">
                      <Volume2 className="h-4 w-4" />
                      {Math.round(audioLevel)}%
                    </div>
                  </div>
                  <Progress value={audioLevel} className="h-2" />
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

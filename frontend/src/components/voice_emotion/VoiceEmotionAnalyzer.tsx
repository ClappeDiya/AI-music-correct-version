"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/useToast";
import {
  Mic,
  MicOff,
  Waveform,
  Brain,
  Volume2,
  Music2,
  Smile,
  Frown,
  Meh,
  Heart,
  ThermometerSun,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EmotionData {
  emotion: "happy" | "sad" | "neutral" | "excited" | "calm" | "frustrated";
  confidence: number;
  audioFeatures: {
    pitch: number;
    tempo: number;
    energy: number;
    valence: number;
  };
}

interface VoiceEmotionAnalyzerProps {
  onEmotionDetected: (emotion: EmotionData) => void;
  className?: string;
}

export function VoiceEmotionAnalyzer({
  onEmotionDetected,
  className,
}: VoiceEmotionAnalyzerProps) {
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [currentEmotion, setCurrentEmotion] = useState<EmotionData | null>(
    null,
  );
  const audioContext = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const mediaStream = useRef<MediaStream | null>(null);
  const animationFrame = useRef<number>();

  const getEmotionIcon = (emotion: EmotionData["emotion"]) => {
    switch (emotion) {
      case "happy":
        return <Smile className="h-4 w-4 text-success" />;
      case "sad":
        return <Frown className="h-4 w-4 text-destructive" />;
      case "neutral":
        return <Meh className="h-4 w-4 text-muted-foreground" />;
      case "excited":
        return <ThermometerSun className="h-4 w-4 text-warning" />;
      case "calm":
        return <Heart className="h-4 w-4 text-primary" />;
      case "frustrated":
        return <Volume2 className="h-4 w-4 text-destructive" />;
      default:
        return <Brain className="h-4 w-4" />;
    }
  };

  const initializeAudio = async () => {
    try {
      audioContext.current = new AudioContext();
      mediaStream.current = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      const source = audioContext.current.createMediaStreamSource(
        mediaStream.current,
      );
      analyser.current = audioContext.current.createAnalyser();
      analyser.current.fftSize = 2048;
      source.connect(analyser.current);

      return true;
    } catch (error) {
      console.error("Error initializing audio:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to access microphone",
      });
      return false;
    }
  };

  const startListening = async () => {
    if (!(await initializeAudio())) return;

    setIsListening(true);
    processAudioData();
  };

  const stopListening = () => {
    setIsListening(false);
    if (mediaStream.current) {
      mediaStream.current.getTracks().forEach((track) => track.stop());
    }
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
    }
    if (audioContext.current) {
      audioContext.current.close();
    }
  };

  const processAudioData = () => {
    if (!analyser.current || !isListening) return;

    const dataArray = new Float32Array(analyser.current.frequencyBinCount);
    analyser.current.getFloatTimeDomainData(dataArray);

    // Calculate audio features
    const features = calculateAudioFeatures(dataArray);

    // Detect emotion based on audio features
    const emotion = detectEmotion(features);

    if (emotion) {
      setCurrentEmotion(emotion);
      onEmotionDetected(emotion);
    }

    // Update audio level visualization
    const level = calculateAudioLevel(dataArray);
    setAudioLevel(level * 100);

    animationFrame.current = requestAnimationFrame(processAudioData);
  };

  const calculateAudioFeatures = (data: Float32Array) => {
    // Implement sophisticated audio feature extraction
    // This is a simplified version - in production, use more advanced DSP
    let pitch = 0;
    let tempo = 0;
    let energy = 0;
    let valence = 0;

    // Calculate pitch using zero-crossing rate
    let zeroCrossings = 0;
    for (let i = 1; i < data.length; i++) {
      if (
        (data[i] >= 0 && data[i - 1] < 0) ||
        (data[i] < 0 && data[i - 1] >= 0)
      ) {
        zeroCrossings++;
      }
    }
    pitch =
      zeroCrossings * (audioContext.current!.sampleRate / (2 * data.length));

    // Calculate energy (RMS)
    energy = Math.sqrt(
      data.reduce((acc, val) => acc + val * val, 0) / data.length,
    );

    // Estimate tempo using peak detection
    const peaks = detectPeaks(data);
    if (peaks.length > 1) {
      const avgInterval =
        (peaks[peaks.length - 1] - peaks[0]) / (peaks.length - 1);
      tempo = (60 * audioContext.current!.sampleRate) / avgInterval;
    }

    // Calculate valence (emotional positivity) using spectral centroid
    valence = calculateSpectralCentroid(data);

    return { pitch, tempo, energy, valence };
  };

  const detectPeaks = (data: Float32Array) => {
    const peaks: number[] = [];
    const threshold = 0.5;

    for (let i = 1; i < data.length - 1; i++) {
      if (
        data[i] > threshold &&
        data[i] > data[i - 1] &&
        data[i] > data[i + 1]
      ) {
        peaks.push(i);
      }
    }

    return peaks;
  };

  const calculateSpectralCentroid = (data: Float32Array) => {
    let weightedSum = 0;
    let sum = 0;

    for (let i = 0; i < data.length; i++) {
      weightedSum += Math.abs(data[i]) * i;
      sum += Math.abs(data[i]);
    }

    return sum === 0 ? 0 : weightedSum / sum;
  };

  const calculateAudioLevel = (data: Float32Array) => {
    const sum = data.reduce((acc, val) => acc + Math.abs(val), 0);
    return sum / data.length;
  };

  const detectEmotion = (
    features: EmotionData["audioFeatures"],
  ): EmotionData => {
    // Implement emotion detection using audio features
    // This is a simplified version - in production, use ML models
    const { pitch, tempo, energy, valence } = features;

    let emotion: EmotionData["emotion"] = "neutral";
    let confidence = 0.7;

    if (energy > 0.7 && tempo > 120) {
      emotion = "excited";
      confidence = 0.8;
    } else if (energy > 0.6 && valence > 0.6) {
      emotion = "happy";
      confidence = 0.85;
    } else if (energy < 0.3 && valence < 0.4) {
      emotion = "sad";
      confidence = 0.75;
    } else if (energy < 0.4 && valence > 0.5) {
      emotion = "calm";
      confidence = 0.8;
    } else if (energy > 0.6 && valence < 0.3) {
      emotion = "frustrated";
      confidence = 0.7;
    }

    return {
      emotion,
      confidence,
      audioFeatures: features,
    };
  };

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, []);

  return (
    <Card className={cn("w-full max-w-md", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Waveform className="h-5 w-5" />
          Voice Emotion Analysis
        </CardTitle>
        <CardDescription>
          Analyzing voice patterns for emotional cues
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <Button
            onClick={isListening ? stopListening : startListening}
            variant={isListening ? "destructive" : "default"}
            className="w-full gap-2"
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

          {isListening && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Audio Level</span>
                  <span>{Math.round(audioLevel)}%</span>
                </div>
                <Progress value={audioLevel} className="h-2" />
              </div>

              {currentEmotion && (
                <div className="space-y-4 p-4 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getEmotionIcon(currentEmotion.emotion)}
                      <span className="font-medium capitalize">
                        {currentEmotion.emotion}
                      </span>
                    </div>
                    <Badge variant="outline">
                      {Math.round(currentEmotion.confidence * 100)}% confident
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Music2 className="h-3 w-3" />
                        Pitch
                      </div>
                      <Progress
                        value={currentEmotion.audioFeatures.pitch}
                        className="h-1"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Activity className="h-3 w-3" />
                        Energy
                      </div>
                      <Progress
                        value={currentEmotion.audioFeatures.energy * 100}
                        className="h-1"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

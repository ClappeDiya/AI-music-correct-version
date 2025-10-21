"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Slider } from "@/components/ui/Slider";
import { Switch } from "@/components/ui/Switch";
import { useToast } from "@/components/ui/useToast";
import { VoiceSettings, voiceSettings } from "@/services/api/voice-settings";
import { Mic, Settings2, Activity } from "lucide-react";

interface RealTimeVoiceProps {
  voiceId: number;
  onUpdate: () => void;
}

export function RealTimeVoice({ voiceId, onUpdate }: RealTimeVoiceProps) {
  const [settings, setSettings] = useState<VoiceSettings | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, [voiceId]);

  useEffect(() => {
    if (isActive) {
      startVoiceProcessing();
    } else {
      stopVoiceProcessing();
    }
    return () => stopVoiceProcessing();
  }, [isActive]);

  const loadSettings = async () => {
    try {
      const data = await voiceSettings.getSettings(voiceId);
      setSettings(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load voice settings",
        variant: "destructive",
      });
    }
  };

  const startVoiceProcessing = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      setStream(mediaStream);

      audioContextRef.current = new AudioContext();
      const source =
        audioContextRef.current.createMediaStreamSource(mediaStream);

      // Add audio processing nodes here based on settings
      // This is where you'd implement the real-time voice transformation
      // using Web Audio API nodes

      toast({
        title: "Voice Processing Started",
        description: "Real-time voice transformation is now active",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start voice processing",
        variant: "destructive",
      });
      setIsActive(false);
    }
  };

  const stopVoiceProcessing = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };

  const handleQualityChange = async (quality: "low" | "medium" | "high") => {
    if (!settings) return;

    try {
      await voiceSettings.updateSettings(voiceId, {
        real_time_settings: {
          ...settings.real_time_settings,
          quality,
        },
      });
      await loadSettings();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update quality settings",
        variant: "destructive",
      });
    }
  };

  if (!settings) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Real-Time Voice Changer
          </div>
          <Switch
            checked={isActive}
            onCheckedChange={setIsActive}
            disabled={!settings.capabilities.real_time_enabled}
          />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Quality</label>
            <div className="flex gap-2">
              {(["low", "medium", "high"] as const).map((quality) => (
                <Button
                  key={quality}
                  variant={
                    settings.real_time_settings.quality === quality
                      ? "default"
                      : "outline"
                  }
                  onClick={() => handleQualityChange(quality)}
                  className="flex-1 capitalize"
                >
                  {quality}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Latency</label>
              <Slider
                value={[settings.real_time_settings.latency]}
                onValueChange={async ([value]) => {
                  await voiceSettings.updateSettings(voiceId, {
                    real_time_settings: {
                      ...settings.real_time_settings,
                      latency: value,
                    },
                  });
                  await loadSettings();
                }}
                min={0}
                max={500}
                step={10}
              />
              <p className="text-sm text-muted-foreground">
                {settings.real_time_settings.latency}ms
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Noise Reduction</label>
                <p className="text-sm text-muted-foreground">
                  Reduce background noise during processing
                </p>
              </div>
              <Switch
                checked={settings.real_time_settings.noise_reduction}
                onCheckedChange={async (value) => {
                  await voiceSettings.updateSettings(voiceId, {
                    real_time_settings: {
                      ...settings.real_time_settings,
                      noise_reduction: value,
                    },
                  });
                  await loadSettings();
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Echo Cancellation</label>
                <p className="text-sm text-muted-foreground">
                  Remove echo from input audio
                </p>
              </div>
              <Switch
                checked={settings.real_time_settings.echo_cancellation}
                onCheckedChange={async (value) => {
                  await voiceSettings.updateSettings(voiceId, {
                    real_time_settings: {
                      ...settings.real_time_settings,
                      echo_cancellation: value,
                    },
                  });
                  await loadSettings();
                }}
              />
            </div>
          </div>

          {isActive && (
            <div className="flex items-center justify-center p-4 border rounded-lg">
              <Activity className="h-6 w-6 animate-pulse text-primary" />
              <span className="ml-2 text-sm font-medium">
                Voice processing active
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { useLanguageStore } from "@/stores/languageStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Volume2, VolumeX, Settings2 } from "lucide-react";
import { useToast } from "@/components/ui/useToast";

interface VoiceStyle {
  id: string;
  name: string;
  description: string;
}

interface VoiceAccent {
  id: string;
  name: string;
  language_code: string;
}

const VOICE_STYLES: VoiceStyle[] = [
  { id: "casual", name: "Casual", description: "Relaxed and friendly tone" },
  {
    id: "energetic",
    name: "Energetic",
    description: "High-energy and enthusiastic",
  },
  {
    id: "professional",
    name: "Professional",
    description: "Polished and formal",
  },
  { id: "calm", name: "Calm", description: "Soothing and peaceful" },
];

interface DJVoiceSettingsProps {
  sessionId: number;
  initialSettings?: {
    voice_style: string;
    voice_accent: string;
    announcement_frequency: "low" | "medium" | "high";
  };
  onSettingsChange: (settings: any) => void;
  className?: string;
}

export function DJVoiceSettings({
  sessionId,
  initialSettings,
  onSettingsChange,
  className,
}: DJVoiceSettingsProps) {
  const { currentLanguage } = useLanguageStore();
  const { toast } = useToast();
  const [settings, setSettings] = useState(
    initialSettings || {
      voice_style: "casual",
      voice_accent: currentLanguage,
      announcement_frequency: "medium",
    },
  );

  const [voiceAccents, setVoiceAccents] = useState<VoiceAccent[]>([]);
  const [isTestPlaying, setIsTestPlaying] = useState(false);

  useEffect(() => {
    const loadVoiceAccents = async () => {
      try {
        const response = await fetch(
          `/api/voice-accents/?language=${currentLanguage}`,
        );
        const data = await response.json();
        setVoiceAccents(data);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load voice accents. Please try again.",
        });
      }
    };

    loadVoiceAccents();
  }, [currentLanguage, toast]);

  const handleSettingChange = (key: string, value: string) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const playTestAnnouncement = async () => {
    try {
      setIsTestPlaying(true);
      const response = await fetch(
        `/api/sessions/${sessionId}/test-announcement/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(settings),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to play test announcement");
      }

      const blob = await response.blob();
      const audio = new Audio(URL.createObjectURL(blob));
      audio.onended = () => setIsTestPlaying(false);
      await audio.play();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to play test announcement. Please try again.",
      });
      setIsTestPlaying(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings2 className="h-5 w-5" />
          DJ Voice Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="voice_style">Voice Style</Label>
          <Select
            value={settings.voice_style}
            onValueChange={(value) => handleSettingChange("voice_style", value)}
          >
            <SelectTrigger id="voice_style">
              <SelectValue placeholder="Select a voice style" />
            </SelectTrigger>
            <SelectContent>
              {VOICE_STYLES.map((style) => (
                <SelectItem key={style.id} value={style.id}>
                  {style.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            {
              VOICE_STYLES.find((s) => s.id === settings.voice_style)
                ?.description
            }
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="voice_accent">Voice Accent</Label>
          <Select
            value={settings.voice_accent}
            onValueChange={(value) =>
              handleSettingChange("voice_accent", value)
            }
          >
            <SelectTrigger id="voice_accent">
              <SelectValue placeholder="Select a voice accent" />
            </SelectTrigger>
            <SelectContent>
              {voiceAccents.map((accent) => (
                <SelectItem key={accent.id} value={accent.id}>
                  {accent.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="announcement_frequency">Announcement Frequency</Label>
          <Select
            value={settings.announcement_frequency}
            onValueChange={(value) =>
              handleSettingChange("announcement_frequency", value)
            }
          >
            <SelectTrigger id="announcement_frequency">
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low - Only Important Updates</SelectItem>
              <SelectItem value="medium">Medium - Balanced</SelectItem>
              <SelectItem value="high">High - More Interactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={playTestAnnouncement}
          disabled={isTestPlaying}
          className="w-full"
          variant="secondary"
        >
          {isTestPlaying ? (
            <>
              <Volume2 className="mr-2 h-4 w-4 animate-pulse" />
              Playing...
            </>
          ) : (
            <>
              <VolumeX className="mr-2 h-4 w-4" />
              Test Voice
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

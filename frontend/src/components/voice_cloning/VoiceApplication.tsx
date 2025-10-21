"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Slider } from "@/components/ui/Slider";
import { Switch } from "@/components/ui/Switch";
import { useToast } from "@/components/ui/useToast";
import {
  VoiceApplicationConfig,
  voiceApplication,
} from "@/services/api/voice-application";
import { Mic2, Music, Activity, Volume2, Clock, Sparkles } from "lucide-react";
import { AudioPreview } from "@/components/voice_cloning/AudioPreview";

interface VoiceApplicationProps {
  voiceModelId: number;
  contentId: number;
  onComplete: (trackId: number) => void;
}

export function VoiceApplication({
  voiceModelId,
  contentId,
  onComplete,
}: VoiceApplicationProps) {
  const [config, setConfig] = useState<VoiceApplicationConfig>({
    modelId: voiceModelId,
    settings: {
      pitch_shift: 0,
      tempo: 1,
      volume: 1,
      effects: [],
    },
  });
  const [previewId, setPreviewId] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleSettingChange = (
    key: keyof VoiceApplicationConfig["settings"],
    value: number | string[],
  ) => {
    setConfig((prev: VoiceApplicationConfig) => ({
      ...prev,
      settings: {
        ...prev.settings,
        [key]: value,
      },
    }));
  };

  const handleEffectToggle = (effect: string) => {
    setConfig((prev: VoiceApplicationConfig) => ({
      ...prev,
      settings: {
        ...prev.settings,
        effects: prev.settings.effects.includes(effect)
          ? prev.settings.effects.filter((e: string) => e !== effect)
          : [...prev.settings.effects, effect],
      },
    }));
  };

  const generatePreview = async () => {
    try {
      setIsGenerating(true);
      const result = await voiceApplication.applyVoice(config);
      setPreviewId(result.id);
      toast({
        title: "Preview Generated",
        description: "Your voice preview is ready to play",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate preview",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = async () => {
    try {
      if (!previewId) {
        await generatePreview();
        return;
      }

      // For now, just use the trackId from the result to maintain compatibility with the onComplete callback
      onComplete(previewId);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to apply voice",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic2 className="h-5 w-5" />
            Voice Application Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Music className="h-4 w-4" />
                  Pitch Shift
                </label>
                <span className="text-sm text-muted-foreground">
                  {config.settings.pitch_shift > 0 ? "+" : ""}
                  {config.settings.pitch_shift} semitones
                </span>
              </div>
              <Slider
                value={[config.settings.pitch_shift]}
                onValueChange={([value]) =>
                  handleSettingChange("pitch_shift", value)
                }
                min={-12}
                max={12}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Tempo
                </label>
                <span className="text-sm text-muted-foreground">
                  {config.settings.tempo.toFixed(2)}x
                </span>
              </div>
              <Slider
                value={[config.settings.tempo]}
                onValueChange={([value]) => handleSettingChange("tempo", value)}
                min={0.5}
                max={2}
                step={0.1}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Volume2 className="h-4 w-4" />
                  Volume
                </label>
                <span className="text-sm text-muted-foreground">
                  {Math.round(config.settings.volume * 100)}%
                </span>
              </div>
              <Slider
                value={[config.settings.volume]}
                onValueChange={([value]) =>
                  handleSettingChange("volume", value)
                }
                min={0}
                max={1}
                step={0.1}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Effects
              </label>
              <div className="grid grid-cols-2 gap-4">
                {["reverb", "chorus", "compression", "eq"].map((effect) => (
                  <div
                    key={effect}
                    className="flex items-center justify-between p-2 border rounded-lg"
                  >
                    <span className="text-sm capitalize">{effect}</span>
                    <Switch
                      checked={config.settings.effects.includes(effect)}
                      onCheckedChange={() => handleEffectToggle(effect)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {previewId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AudioPreview previewId={previewId} />
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={generatePreview}
          disabled={isGenerating}
        >
          {isGenerating ? "Generating..." : "Generate Preview"}
        </Button>
        <Button onClick={handleApply} disabled={!previewId}>
          Apply Voice
        </Button>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Slider } from "@/components/ui/Slider";
import { Button } from "@/components/ui/Button";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { useToast } from "@/components/ui/useToast";
import {
  VoiceEditConfig,
  VoiceVersion,
  voiceEditing,
} from "@/services/api/voice-editing";
import { Waveform, Mic2, Settings2, History } from "lucide-react";
import { AudioPreview } from "./audio-preview";

interface VoiceEditorProps {
  voiceId: number;
  onUpdate: () => void;
}

export function VoiceEditor({ voiceId, onUpdate }: VoiceEditorProps) {
  const [config, setConfig] = useState<VoiceEditConfig>({
    voiceId,
    parameters: {
      timbre: {
        brightness: 0,
        breathiness: 0,
        roughness: 0,
      },
      pitch: {
        shift: 0,
        range: 1,
        stability: 1,
      },
      articulation: {
        speed: 1,
        clarity: 1,
      },
    },
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [versions, setVersions] = useState<VoiceVersion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadVersionHistory();
  }, [voiceId]);

  const loadVersionHistory = async () => {
    try {
      const history = await voiceEditing.getVersionHistory(voiceId);
      setVersions(history);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load version history",
        variant: "destructive",
      });
    }
  };

  const handleParameterChange = (
    category: keyof VoiceEditConfig["parameters"],
    parameter: string,
    value: number,
  ) => {
    setConfig((prev) => ({
      ...prev,
      parameters: {
        ...prev.parameters,
        [category]: {
          ...prev.parameters[category],
          [parameter]: value,
        },
      },
    }));
  };

  const generatePreview = async () => {
    try {
      setIsGenerating(true);
      const result = await voiceEditing.getPreview(voiceId, config.parameters);
      setPreviewUrl(result.preview_url);
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

  const saveChanges = async () => {
    try {
      await voiceEditing.updateVoice(config);
      await loadVersionHistory();
      onUpdate();
      toast({
        title: "Success",
        description: "Voice settings updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update voice settings",
        variant: "destructive",
      });
    }
  };

  const revertToVersion = async (versionId: number) => {
    try {
      await voiceEditing.revertToVersion(voiceId, versionId);
      await loadVersionHistory();
      onUpdate();
      toast({
        title: "Success",
        description: "Reverted to previous version",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to revert version",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Voice Parameters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-medium">Timbre</h3>
              <div className="space-y-2">
                <label className="text-sm">Brightness</label>
                <Slider
                  value={[config.parameters.timbre.brightness]}
                  onValueChange={([value]) =>
                    handleParameterChange("timbre", "brightness", value)
                  }
                  min={-1}
                  max={1}
                  step={0.1}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm">Breathiness</label>
                <Slider
                  value={[config.parameters.timbre.breathiness]}
                  onValueChange={([value]) =>
                    handleParameterChange("timbre", "breathiness", value)
                  }
                  min={0}
                  max={1}
                  step={0.1}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm">Roughness</label>
                <Slider
                  value={[config.parameters.timbre.roughness]}
                  onValueChange={([value]) =>
                    handleParameterChange("timbre", "roughness", value)
                  }
                  min={0}
                  max={1}
                  step={0.1}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Pitch</h3>
              <div className="space-y-2">
                <label className="text-sm">Shift (semitones)</label>
                <Slider
                  value={[config.parameters.pitch.shift]}
                  onValueChange={([value]) =>
                    handleParameterChange("pitch", "shift", value)
                  }
                  min={-12}
                  max={12}
                  step={1}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm">Range</label>
                <Slider
                  value={[config.parameters.pitch.range]}
                  onValueChange={([value]) =>
                    handleParameterChange("pitch", "range", value)
                  }
                  min={0.5}
                  max={2}
                  step={0.1}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm">Stability</label>
                <Slider
                  value={[config.parameters.pitch.stability]}
                  onValueChange={([value]) =>
                    handleParameterChange("pitch", "stability", value)
                  }
                  min={0}
                  max={1}
                  step={0.1}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Articulation</h3>
              <div className="space-y-2">
                <label className="text-sm">Speed</label>
                <Slider
                  value={[config.parameters.articulation.speed]}
                  onValueChange={([value]) =>
                    handleParameterChange("articulation", "speed", value)
                  }
                  min={0.5}
                  max={2}
                  step={0.1}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm">Clarity</label>
                <Slider
                  value={[config.parameters.articulation.clarity]}
                  onValueChange={([value]) =>
                    handleParameterChange("articulation", "clarity", value)
                  }
                  min={0}
                  max={1}
                  step={0.1}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={generatePreview}
              disabled={isGenerating}
            >
              {isGenerating ? "Generating..." : "Preview Changes"}
            </Button>
            <Button onClick={saveChanges}>Save Changes</Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {previewUrl && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Waveform className="h-5 w-5" />
                Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AudioPreview url={previewUrl} />
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Version History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {versions.map((version) => (
                  <div
                    key={version.id}
                    className="flex items-center justify-between p-2 border rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        Version {version.id}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(version.created_at).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => revertToVersion(version.id)}
                    >
                      Revert
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

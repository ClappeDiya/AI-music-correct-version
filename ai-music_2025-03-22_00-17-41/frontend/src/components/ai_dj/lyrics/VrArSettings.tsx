import { useState } from "react";
import { Save, Eye, Undo } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Slider } from "@/components/ui/Slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { useToast } from "@/components/ui/useToast";
import { lyricVrArSettingsApi } from "@/services/LyricsGenerationApi";
import type { LyricVrArSettings } from "@/types/LyricsGeneration";

interface VrArSettingsProps {
  finalLyricsId: number;
  initialSettings?: LyricVrArSettings;
}

const defaultConfig = {
  environment: "stage",
  textStyle: "floating",
  position: { x: 0, y: 1.6, z: -2 },
  scale: 1,
  color: "#ffffff",
  backgroundColor: "#000000",
  opacity: 0.8,
  animation: "fade",
};

export function VrArSettings({
  finalLyricsId,
  initialSettings,
}: VrArSettingsProps) {
  const [config, setConfig] = useState(
    initialSettings?.vr_ar_config || defaultConfig,
  );
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      if (initialSettings) {
        await lyricVrArSettingsApi.update(initialSettings.id, {
          vr_ar_config: config,
        });
      } else {
        await lyricVrArSettingsApi.create({
          final_lyrics: finalLyricsId,
          vr_ar_config: config,
        });
      }
      toast({
        title: "Success",
        description: "VR/AR settings saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save VR/AR settings",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    setConfig(defaultConfig);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium">VR/AR Settings</h3>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset}>
              <Undo className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label>Environment</Label>
              <Select
                value={config.environment}
                onValueChange={(value) =>
                  setConfig({ ...config, environment: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stage">Stage</SelectItem>
                  <SelectItem value="space">Space</SelectItem>
                  <SelectItem value="nature">Nature</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Text Style</Label>
              <Select
                value={config.textStyle}
                onValueChange={(value) =>
                  setConfig({ ...config, textStyle: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="floating">Floating</SelectItem>
                  <SelectItem value="billboard">Billboard</SelectItem>
                  <SelectItem value="curved">Curved</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Animation</Label>
              <Select
                value={config.animation}
                onValueChange={(value) =>
                  setConfig({ ...config, animation: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fade">Fade</SelectItem>
                  <SelectItem value="slide">Slide</SelectItem>
                  <SelectItem value="bounce">Bounce</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Position</Label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs">X</Label>
                  <Input
                    type="number"
                    value={config.position.x}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        position: {
                          ...config.position,
                          x: parseFloat(e.target.value),
                        },
                      })
                    }
                    step={0.1}
                  />
                </div>
                <div>
                  <Label className="text-xs">Y</Label>
                  <Input
                    type="number"
                    value={config.position.y}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        position: {
                          ...config.position,
                          y: parseFloat(e.target.value),
                        },
                      })
                    }
                    step={0.1}
                  />
                </div>
                <div>
                  <Label className="text-xs">Z</Label>
                  <Input
                    type="number"
                    value={config.position.z}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        position: {
                          ...config.position,
                          z: parseFloat(e.target.value),
                        },
                      })
                    }
                    step={0.1}
                  />
                </div>
              </div>
            </div>

            <div>
              <Label>Scale</Label>
              <Slider
                value={[config.scale]}
                min={0.1}
                max={3}
                step={0.1}
                onValueChange={([value]) =>
                  setConfig({ ...config, scale: value })
                }
              />
            </div>

            <div>
              <Label>Colors</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Text</Label>
                  <Input
                    type="color"
                    value={config.color}
                    onChange={(e) =>
                      setConfig({ ...config, color: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label className="text-xs">Background</Label>
                  <Input
                    type="color"
                    value={config.backgroundColor}
                    onChange={(e) =>
                      setConfig({ ...config, backgroundColor: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <div>
              <Label>Opacity</Label>
              <Slider
                value={[config.opacity]}
                min={0}
                max={1}
                step={0.1}
                onValueChange={([value]) =>
                  setConfig({ ...config, opacity: value })
                }
              />
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">Preview</h3>
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-2" />
            Full Preview
          </Button>
        </div>
        <div
          className="bg-muted rounded-md h-[300px] flex items-center justify-center"
          style={{
            backgroundColor: config.backgroundColor,
            opacity: config.opacity,
          }}
        >
          <p
            style={{
              color: config.color,
              transform: `scale(${config.scale})`,
            }}
          >
            Sample Lyrics Text
          </p>
        </div>
      </Card>
    </div>
  );
}

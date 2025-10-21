"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/componen../ui/card";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Slider } from "@/components/ui/Slider";
import { Switch } from "@/components/ui/Switch";
import { useToast } from "@/components/ui/usetoast";
import { Loader2, Eye, Volume2, Vibrate } from "lucide-react";
import { settingsService, UserSensoryTheme } from "@/services/settings.service";

export function SensorySettings() {
  const [themes, setThemes] = useState<UserSensoryTheme[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadThemes();
  }, []);

  const loadThemes = async () => {
    try {
      const data = await settingsService.getSensoryThemes();
      setThemes(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load sensory themes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (
    id: number,
    updates: Partial<UserSensoryTheme>,
  ) => {
    try {
      const updated = await settingsService.updateSensoryTheme(id, updates);
      setThemes((prev) =>
        prev.map((theme) => (theme.id === id ? updated : theme)),
      );
      toast({
        title: "Success",
        description: "Sensory theme updated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update sensory theme",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {themes.map((theme) => (
        <Card key={theme.id}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>Sensory Theme {theme.id}</span>
              <Switch
                checked={theme.active}
                onCheckedChange={(checked) =>
                  handleUpdate(theme.id, { active: checked })
                }
              />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Eye className="h-4 w-4" />
                  <Label>Visual Intensity</Label>
                </div>
                <Slider
                  value={[theme.theme_parameters.visual_intensity || 50]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={([value]) =>
                    handleUpdate(theme.id, {
                      theme_parameters: {
                        ...theme.theme_parameters,
                        visual_intensity: value,
                      },
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Volume2 className="h-4 w-4" />
                  <Label>Audio Feedback</Label>
                </div>
                <Slider
                  value={[theme.theme_parameters.audio_feedback || 50]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={([value]) =>
                    handleUpdate(theme.id, {
                      theme_parameters: {
                        ...theme.theme_parameters,
                        audio_feedback: value,
                      },
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Vibrate className="h-4 w-4" />
                  <Label>Haptic Feedback</Label>
                </div>
                <Slider
                  value={[theme.theme_parameters.haptic_feedback || 50]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={([value]) =>
                    handleUpdate(theme.id, {
                      theme_parameters: {
                        ...theme.theme_parameters,
                        haptic_feedback: value,
                      },
                    })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
